import 'package:dio/dio.dart';
import '../../domain/entities/user.dart';
import '../../../../core/error/exceptions.dart';

class AuthRemoteDatasource {
  final Dio _dio;

  const AuthRemoteDatasource(this._dio);

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _dio.post('/auth/login', data: {
        'email': email,
        'password': password,
      });
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data?['message'] ?? 'Erro ao fazer login',
        statusCode: e.response?.statusCode,
      );
    }
  }

  Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String password,
    required String role,
    required String companyName,
    required String cnpj,
  }) async {
    try {
      final response = await _dio.post('/auth/register', data: {
        'name': name,
        'email': email,
        'password': password,
        'role': role,
        'companyName': companyName,
        'cnpj': cnpj,
      });
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data?['message'] ?? 'Erro ao registrar',
        statusCode: e.response?.statusCode,
      );
    }
  }

  Future<User> getCurrentUser() async {
    try {
      final response = await _dio.get('/auth/me');
      return User.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data?['message'] ?? 'Erro ao buscar usuário',
        statusCode: e.response?.statusCode,
      );
    }
  }

  Future<Map<String, dynamic>> refreshToken(String refreshToken) async {
    try {
      final response = await _dio.post('/auth/refresh', data: {
        'refreshToken': refreshToken,
      });
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data?['message'] ?? 'Erro ao renovar token',
        statusCode: e.response?.statusCode,
      );
    }
  }
}
