class User {
  final String id;
  final String name;
  final String email;
  final String role;
  final String companyName;
  final String cnpj;
  final String status;

  const User({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    required this.companyName,
    required this.cnpj,
    required this.status,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
      role: json['role'] as String,
      companyName: json['companyName'] as String? ?? '',
      cnpj: json['cnpj'] as String? ?? '',
      status: json['status'] as String? ?? 'pending',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'role': role,
      'companyName': companyName,
      'cnpj': cnpj,
      'status': status,
    };
  }

  User copyWith({
    String? id,
    String? name,
    String? email,
    String? role,
    String? companyName,
    String? cnpj,
    String? status,
  }) {
    return User(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      role: role ?? this.role,
      companyName: companyName ?? this.companyName,
      cnpj: cnpj ?? this.cnpj,
      status: status ?? this.status,
    );
  }

  bool get isFactory => role == 'FACTORY';
  bool get isSupplier => role == 'SUPPLIER';
  bool get isApproved => status == 'approved';

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is User && runtimeType == other.runtimeType && id == other.id;

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() => 'User(id: $id, name: $name, email: $email, role: $role)';
}
