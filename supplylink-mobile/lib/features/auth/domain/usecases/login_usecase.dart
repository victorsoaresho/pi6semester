import '../entities/user.dart';
import '../repositories/auth_repository.dart';

class LoginUseCase {
  final AuthRepository _repository;

  const LoginUseCase(this._repository);

  Future<({User user, String accessToken, String refreshToken})> call({
    required String email,
    required String password,
  }) {
    return _repository.login(email: email, password: password);
  }
}
