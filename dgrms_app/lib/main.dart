import 'dart:async';

import 'package:dgrms_app/firebase_options.dart';
import 'package:dgrms_app/services/notification_service.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:webview_flutter/webview_flutter.dart';

int _rpm = 0;
int _harmo = 0;
int _temp = 0;
int _powerStatus = 0;
Timer? _timer;

int _start = 5;
bool nowNotify = false;
bool timerStarted = false;


final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
    FlutterLocalNotificationsPlugin();
late final WebViewController controller;
FirebaseDatabase database = FirebaseDatabase.instance;

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Generator Monitor',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: MyHomePage(title: 'Generator Monitor'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});

  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  void startTimer() {
    timerStarted = true;
  const oneMin = const Duration(minutes: 1);
  _timer = new Timer.periodic(
    oneMin,
    (Timer timer) {
      if (_start == 0) {
        setState(() {
          timer.cancel();
          timerStarted = false;
          if(_rpm > 1800 || _harmo > 1500) nowNotify = true;
        });
      } else {
        nowNotify = false;
        setState(() {
          _start--;
        });
      }
    }
  );
}

  @override
  void initState() {
    super.initState();
    Notif.initialize(flutterLocalNotificationsPlugin);
    controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..loadRequest(
        Uri.parse('https://diesel-generator-monitoring.web.app'),
      );
  }

   @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {

    DatabaseReference sensorData = database.ref('generatorReadings');

    sensorData.onValue.listen((DatabaseEvent event) {
      final data = event.snapshot.value as Map;
      
      _rpm = data['rpm'];
      _harmo = data['harmo'];
      _powerStatus = data['powerStatus'];
      _temp = data['temperature'];

      if(_temp > 90) Notif.showNotification(title: "Temperature Alert", body: "Generator is at above critical temperature", fln: flutterLocalNotificationsPlugin);
      if(_harmo > 3000) Notif.showNotification(title: "Harmonics Alert", body: "Generator is at above critical harmonic reading", fln: flutterLocalNotificationsPlugin);
      if(_rpm > 1800 || _harmo > 1500 && timerStarted == false){
        startTimer();
      } 
      
      if(nowNotify == true){
        Notif.showNotification(title: "Generator Alert", body: "Generator is still running", fln: flutterLocalNotificationsPlugin);
        nowNotify = false;
      }


      
    });

    return Scaffold(
        appBar: AppBar(
          elevation: 0,
          backgroundColor: Colors.white,
        ),
        body: Stack(children: [WebViewWidget(controller: controller)]));
  }
}
