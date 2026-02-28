import '../entities/user.dart';

abstract class AuthRepository {
  Future<({User user, String accessToken, String refreshToken})> login({
    required String email,
    required String password,
  });

  Future<({User user, String accessToken, String refreshToken})> register({
    required String name,
    required String email,
    required String password,
    required String role,
    required String companyName,
    required String cnpj,
  });

  Future<void> logout();

  Future<User?> getCurrentUser();

  Future<({String accessToken, String refreshToken})> refreshToken({
    required String refreshToken,
  });
}
