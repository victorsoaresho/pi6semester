import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../domain/entities/user.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_remote_datasource.dart';
import '../../../../core/error/exceptions.dart';
import '../../../../core/error/failures.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDatasource _remoteDatasource;
  final FlutterSecureStorage _secureStorage;

  const AuthRepositoryImpl(this._remoteDatasource, this._secureStorage);

  @override
  Future<({User user, String accessToken, String refreshToken})> login({
    required String email,
    required String password,
  }) async {
    try {
      final data = await _remoteDatasource.login(
        email: email,
        password: password,
      );

      final user = User.fromJson(data['user'] as Map<String, dynamic>);
      final accessToken = data['accessToken'] as String;
      final refreshToken = data['refreshToken'] as String;

      await _secureStorage.write(key: 'access_token', value: accessToken);
      await _secureStorage.write(key: 'refresh_token', value: refreshToken);

      return (user: user, accessToken: accessToken, refreshToken: refreshToken);
    } on ServerException catch (e) {
      throw ServerFailure(message: e.message, statusCode: e.statusCode);
    }
  }

  @override
  Future<({User user, String accessToken, String refreshToken})> register({
    required String name,
    required String email,
    required String password,
    required String role,
    required String companyName,
    required String cnpj,
  }) async {
    try {
      final data = await _remoteDatasource.register(
        name: name,
        email: email,
        password: password,
        role: role,
        companyName: companyName,
        cnpj: cnpj,
      );

      final user = User.fromJson(data['user'] as Map<String, dynamic>);
      final accessToken = data['accessToken'] as String;
      final refreshToken = data['refreshToken'] as String;

      await _secureStorage.write(key: 'access_token', value: accessToken);
      await _secureStorage.write(key: 'refresh_token', value: refreshToken);

      return (user: user, accessToken: accessToken, refreshToken: refreshToken);
    } on ServerException catch (e) {
      throw ServerFailure(message: e.message, statusCode: e.statusCode);
    }
  }

  @override
  Future<void> logout() async {
    await _secureStorage.delete(key: 'access_token');
    await _secureStorage.delete(key: 'refresh_token');
  }

  @override
  Future<User?> getCurrentUser() async {
    try {
      final token = await _secureStorage.read(key: 'access_token');
      if (token == null) return null;
      return await _remoteDatasource.getCurrentUser();
    } on ServerException {
      return null;
    }
  }

  @override
  Future<({String accessToken, String refreshToken})> refreshToken({
    required String refreshToken,
  }) async {
    try {
      final data = await _remoteDatasource.refreshToken(refreshToken);
      final newAccessToken = data['accessToken'] as String;
      final newRefreshToken = data['refreshToken'] as String;

      await _secureStorage.write(key: 'access_token', value: newAccessToken);
      await _secureStorage.write(key: 'refresh_token', value: newRefreshToken);

      return (accessToken: newAccessToken, refreshToken: newRefreshToken);
    } on ServerException catch (e) {
      throw ServerFailure(message: e.message, statusCode: e.statusCode);
    }
  }
}
