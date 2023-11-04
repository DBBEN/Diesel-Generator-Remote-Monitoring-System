#include <Arduino.h>
#include <max6675.h>
#include <arduinoFFT.h>

//  PINOUTS ==================================
#define PIEZO1_SENSOR           0   //ANALOG
#define VOLTAGE_SENSOR          1   //ANALOG
#define CURRENT_SENSOR          2   //ANALOG
#define THERMOC_DO              2  
#define THERMOC_CS              5
#define THERMOC_CLK             4
#define IR_OUT                  3
#define WIFI_STATUS_PIN         6
#define WIFI_TX                 7
#define VIN_DETECT              8
// ===========================================

#define VOLTAGE_SAMPLES         60
#define CURR_M                  0.0002155405
#define CURR_B                  0
#define VOL_M                   0.855596
#define VOL_B                   -2.566787

#define SAMPLES                 128
#define SAMPLING_FREQ           5000

#define RPM_MAX                 1800
#define RPM_MIN                 0

int currTemp, rpm, calReading, piezoCalibration, voltage;
float current;
unsigned int period, detect_ctr = 0;
int _random = 0;
int powerStatus;
int buttonStateFalling, lastButtonStateFalling = 1;
unsigned long t1, t2, prevMillis, lastTime, now;
volatile unsigned long pulseCount = 0;
bool detectFlag, rpmFlag, harmoFlag = false;

double vReal[SAMPLES];
double vImag[SAMPLES];
int previous_rpm = 0;
unsigned int harmo, sampling_period_us;
unsigned long microseconds;

MAX6675 tempSense(THERMOC_CLK, THERMOC_CS, THERMOC_DO);
arduinoFFT FFT = arduinoFFT();

int findFrequency(){
  for(int i = 0; i < SAMPLES; i++){
    microseconds = micros();    
    vReal[i] = analogRead(PIEZO1_SENSOR);
    vImag[i] = 0;
    while(micros() < (microseconds + sampling_period_us));
  }
 
  FFT.Windowing(vReal, SAMPLES, FFT_WIN_TYP_HAMMING, FFT_FORWARD);
  FFT.Compute(vReal, vImag, SAMPLES, FFT_FORWARD);
  FFT.ComplexToMagnitude(vReal, vImag, SAMPLES);
  double peak = FFT.MajorPeak(vReal, SAMPLES, SAMPLING_FREQ);

  peak = peak * 0.97;
  return round(peak);
}

int getVoltage(){
  int volrms, analogReading;
  int highest, lowest;
  
  volrms = 0;
  highest = 509;
  lowest = 509;

  for(int j = 0; j < VOLTAGE_SAMPLES; j++){
    analogReading = analogRead(VOLTAGE_SENSOR);
    if(analogReading > highest) highest = analogReading;
    else if(analogReading < lowest) lowest = analogReading;
    delay(15);
  }

  volrms = highest - lowest;
  volrms = (volrms * VOL_M) + VOL_B;

  if(volrms <= 3) volrms = 0;

  return volrms;
}

float getCurrent(){
  int x = analogRead(CURRENT_SENSOR);
  return ((CURR_M * x) + CURR_B);
}

void sendtoWiFi(){
  Serial.print("{\"temp\":");
  Serial.print(currTemp);
  Serial.print(",\"rpm\":");
  Serial.print(rpm);
  Serial.print(",\"harmo\":");
  Serial.print(harmo);
  Serial.print(",\"ps\":");
  Serial.print(powerStatus);
  Serial.print(",\"vol\":");
  Serial.print(voltage);
  Serial.print(",\"cur\":");
  Serial.print(current, 2);
  Serial.print("}");
}

void countPulse(){
  pulseCount++;
}

void setup() {
  sampling_period_us = round(1000000 * (1.0 / SAMPLING_FREQ));
  Serial.begin(9600);
  pinMode(WIFI_STATUS_PIN, INPUT);
  pinMode(VIN_DETECT, INPUT);
  pinMode(IR_OUT, INPUT);
  delay(100);
  while(!digitalRead(WIFI_STATUS_PIN));
  attachInterrupt(digitalPinToInterrupt(IR_OUT), countPulse, FALLING);
}

void loop() {
  //harmonics
  harmo = findFrequency();

  now = millis();
  if(now - lastTime > 1000){
    //tachometer
    detachInterrupt(digitalPinToInterrupt(IR_OUT));
    rpm = (pulseCount * 60000) / (now - lastTime);
    if(rpm >= RPM_MAX) rpm = RPM_MAX + _random;
    if (rpm <= 0) {
      _random = random(1, 100);
      rpm = RPM_MIN;
    }
    
    pulseCount = 0;
    lastTime = millis();
    attachInterrupt(digitalPinToInterrupt(IR_OUT), countPulse, FALLING);

    //thermocouple
    currTemp = (int)tempSense.readCelsius();

    //power status
    if(digitalRead(VIN_DETECT) == LOW) powerStatus = 1;
    else powerStatus = 0;

    //voltage
    voltage = getVoltage();

    //current
    current = getCurrent();
    
    sendtoWiFi();
  }

}