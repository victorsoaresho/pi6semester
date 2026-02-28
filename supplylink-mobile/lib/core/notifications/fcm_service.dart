import 'package:flutter/foundation.dart';

class FcmService {
  static final FcmService _instance = FcmService._internal();

  factory FcmService() => _instance;

  FcmService._internal();

  Future<void> initialize() async {
    // TODO: inicializar Firebase Messaging
    if (kDebugMode) {
      print('FCM Service initialized');
    }
  }

  Future<String?> getToken() async {
    // TODO: retornar token FCM
    return null;
  }

  Future<void> subscribeToTopic(String topic) async {
    // TODO: inscrever-se em tópico
  }

  Future<void> unsubscribeFromTopic(String topic) async {
    // TODO: desinscrever-se de tópico
  }

  void onMessageReceived(void Function(Map<String, dynamic>) callback) {
    // TODO: configurar listener de mensagens recebidas
  }
}
