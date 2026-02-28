import '../entities/user.dart';
import '../repositories/auth_repository.dart';

class RegisterUseCase {
  final AuthRepository _repository;

  const RegisterUseCase(this._repository);

  Future<({User user, String accessToken, String refreshToken})> call({
    required String name,
    required String email,
    required String password,
    required String role,
    required String companyName,
    required String cnpj,
  }) {
    return _repository.register(
      name: name,
      email: email,
      password: password,
      role: role,
      companyName: companyName,
      cnpj: cnpj,
    );
  }
}
