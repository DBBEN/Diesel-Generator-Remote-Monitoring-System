#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <Firebase_ESP_Client.h>
#include <DNSServer.h>
#include <ESP8266WebServer.h>
#include <WiFiManager.h>
#include <ArduinoJson.h>
#include <NTPClient.h>
#include <WiFiUdp.h>
#include <LiquidCrystal_I2C.h>

#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

//  PINOUTS ==================================
#define WIFI_READY_PIN                D0
#define I2C_SDA                       D2 
#define I2C_SCL                       D1
#define BUTTON_1                      D5
#define BUTTON_2                      D6
#define BUTTON_3                      D7

#define LCD_COLUMNS                   16
#define LCD_ROWS                      4
#define LCD_I2C_ADDR                  0x27
// ===========================================

#define API_KEY         "AIzaSyAvwcewC-_jeyFp00PjPWkHoer1C9FyoHM"
#define DATABASE_URL    "https://diesel-generator-monitoring-default-rtdb.asia-southeast1.firebasedatabase.app/"
#define PROJECT_ID      "diesel-generator-monitoring"

// Define NTP Client to get time
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org");

// Variable to save current epoch time
int timestamp;

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;
LiquidCrystal_I2C lcd(LCD_I2C_ADDR, LCD_COLUMNS, LCD_ROWS);

int rpm, powerStatus, temperature, harmo, voltage;
float current;
int button1State, button2State, button3State;
int displaySelect = 1;
unsigned long sendDataPrevMillis, prevTime = 0;
bool signupOK, messageReady = false;
char displayBuff[20];
String msg;

// Function that gets current epoch time
unsigned long getTime() {
  timeClient.update();
  unsigned long now = timeClient.getEpochTime();
  return now;
}

void setup(){
  Serial.begin(9600);
  timeClient.begin();
  lcd.init();
  lcd.backlight();
  pinMode(WIFI_READY_PIN, OUTPUT);
  pinMode(BUTTON_1, INPUT);
  pinMode(BUTTON_2, INPUT);
  pinMode(BUTTON_3, INPUT);
  digitalWrite(WIFI_READY_PIN, LOW);
  lcd.print("Setting Up...");

  WiFiManager wifiManager;
  wifiManager.autoConnect("Generator Monitoring System");

  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  /* Sign up */
  if (Firebase.signUp(&config, &auth, "", "")){
    Serial.println("ok");
    signupOK = true;
  }
  else{
    Serial.printf("%s\n", config.signer.signupError.message.c_str());
  }

  config.token_status_callback = tokenStatusCallback; 
  
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  digitalWrite(WIFI_READY_PIN, HIGH);
  lcd.clear();
  lcd.print("Ready");
  delay(2000);
  lcd.clear();
}

void loop(){
  if(Serial.available() > 0){
    StaticJsonDocument<500> doc;
    DeserializationError err = deserializeJson(doc, Serial);
    if (err == DeserializationError::Ok) {
      temperature = doc["temp"].as<int>();
      rpm = doc["rpm"].as<int>();
      harmo = doc["harmo"].as<int>();
      powerStatus = doc["ps"].as<int>();
      voltage = doc["vol"].as<int>();
      current = doc["cur"].as<float>();
    } 
    else {
      while (Serial.available() > 0) Serial.read();
    }
    messageReady = true;
  }

  if(messageReady){
    lcd.clear();

    switch (displaySelect)
    {
      case 1:
        //display temp
        lcd.setCursor(0, 0);
        lcd.print("TEMPERATURE:");
        lcd.setCursor(0, 1);
        sprintf(displayBuff, "%d%cC", temperature, char(223));
        lcd.print(displayBuff);
        break;
      case 2:
        //display rpm
        lcd.setCursor(0, 0);
        lcd.print("TACHOMETER:");
        lcd.setCursor(0, 1);
        sprintf(displayBuff, "%d RPM", rpm);
        lcd.print(displayBuff);
        break;
      case 3:
        //display harmo
        lcd.setCursor(0, 0);
        lcd.print("HARMONICS:");
        lcd.setCursor(0, 1);
        sprintf(displayBuff, "%d Hz", harmo);
        lcd.print(displayBuff);
        break;
      case 4:
        //display voltage
        lcd.setCursor(0, 0);
        lcd.print("VOLTAGE:");
        lcd.setCursor(0, 1);
        sprintf(displayBuff, "%d V", voltage);
        lcd.print(displayBuff);
        break;
      case 5:
        //display current
        lcd.setCursor(0, 0);
        lcd.print("CURRENT:");
        lcd.setCursor(0, 1);
        sprintf(displayBuff, "%.2f A", current);
        lcd.print(displayBuff);
        break;
    }
  
    if(Firebase.ready() && signupOK && (millis() - sendDataPrevMillis > 1000 || sendDataPrevMillis == 0) && temperature > 0){
      FirebaseJson content;
      timestamp = getTime();
      content.set("/temperature", temperature);
      content.set("/rpm", rpm);
      content.set("/harmo", harmo);
      content.set("/powerStatus", powerStatus);
      content.set("/timestamp/", timestamp);
      content.set("/voltage", voltage);
      content.set("/current", current);

      if(Firebase.RTDB.setJSON(&fbdo, "/generatorReadings", &content)); else Serial.println("FAILED: " + fbdo.errorReason());
      if(Firebase.RTDB.pushJSON(&fbdo, "/readingRecords/", &content)); else Serial.println("FAILED: " + fbdo.errorReason());
    

      sendDataPrevMillis = millis();
    }
    
    messageReady = false;
  }

  if(button1State && !button2State && !button3State){
    displaySelect = 1;
  } else if (!button1State && button2State && !button3State) {
    displaySelect = 2;
  } else if (!button1State && !button2State && button3State) {
    displaySelect = 3;
  } else if (button1State && button2State && !button3State) {
    displaySelect = 4;
  } else if (!button1State && button2State && button3State) {
    displaySelect = 5;
  }

  if(millis() - prevTime >= 100){
    button1State = digitalRead(BUTTON_1); 
    button2State = digitalRead(BUTTON_2); 
    button3State = digitalRead(BUTTON_3);
    prevTime = millis();
  }
}