import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_ringtone_player/flutter_ringtone_player.dart';

class Notif{
  static Future initialize(FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin) async {
    var androidInitialize = new AndroidInitializationSettings('mipmap/ic_launcher');
    var initializationSettings = new InitializationSettings(android: androidInitialize);
    await flutterLocalNotificationsPlugin.initialize(initializationSettings);
  }

  static Future showNotification({var id=0,required String title, required String body, var payload, required FlutterLocalNotificationsPlugin fln}) async {
    AndroidNotificationDetails androidPlatformChannelSpecifics = 
    new AndroidNotificationDetails(
      'channel_id_15',
      'alert',
      'generator alert',
      playSound: true,
      importance: Importance.high,
      priority: Priority.high
    );

    var not = NotificationDetails(android: androidPlatformChannelSpecifics);

    
    await fln.show(0, title, body, not);
    
  }
}