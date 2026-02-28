# SupplyLink Mobile

Aplicativo mobile da plataforma SupplyLink, construído com **Flutter 3** e **Dart 3**, seguindo a arquitetura **Clean Architecture**.

## Overview

App mobile que permite que fábricas e fornecedores interajam com a plataforma SupplyLink em dispositivos Android e iOS. Oferece funcionalidades de autenticação, gerenciamento de demandas, cotações, pedidos e visualização de previsão de demanda.

## Stack

- **Framework:** Flutter 3 / Dart 3
- **Gerenciamento de estado:** Riverpod 2
- **Navegação:** go_router 13
- **HTTP Client:** Dio 5
- **Storage seguro:** flutter_secure_storage 9
- **Gráficos:** fl_chart 0.68
- **Serialização:** freezed + json_serializable

## Arquitetura

O projeto segue **Clean Architecture** com organização **feature-first**:

```
lib/
├── main.dart                    # Entry point
├── app/
│   ├── router/app_router.dart   # Configuração de rotas (go_router)
│   └── theme/app_theme.dart     # Tema Material 3 (claro/escuro)
├── core/
│   ├── network/                 # Dio client + interceptors
│   ├── storage/                 # Secure storage
│   ├── notifications/           # FCM service
│   └── error/                   # Failures e Exceptions
├── shared/
│   └── widgets/                 # Widgets reutilizáveis (AppButton, AppCard, LoadingOverlay)
└── features/
    ├── auth/                    # Autenticação (implementação completa)
    │   ├── data/                # Datasources e Repositories (implementação)
    │   ├── domain/              # Entities, Repositories (abstratos), UseCases
    │   └── presentation/        # Providers, Screens, Widgets
    ├── demands/                 # Demandas (estrutura)
    ├── quotes/                  # Cotações (estrutura)
    ├── orders/                  # Pedidos (estrutura)
    ├── portfolio/               # Portfólio (estrutura)
    └── forecast/                # Previsão (estrutura)
```

Cada feature segue a separação em 3 camadas:
- **Domain:** Entidades, contratos de repositório, use cases
- **Data:** Datasources (API), implementação dos repositórios
- **Presentation:** Providers (Riverpod), screens, widgets

## Como Rodar

### Pré-requisitos

- Flutter SDK >= 3.0.0
- Dart SDK >= 3.0.0
- Android Studio ou Xcode (para emuladores)
- API do SupplyLink rodando

### Instalação do Flutter

Se o Flutter não estiver instalado, siga o guia oficial: https://docs.flutter.dev/get-started/install

### Passos

```bash
# 1. Instalar dependências
flutter pub get

# 2. Gerar código (freezed, json_serializable, riverpod_generator)
dart run build_runner build --delete-conflicting-outputs

# 3. Rodar no emulador ou dispositivo
flutter run
```

### Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `flutter pub get` | Instalar dependências |
| `flutter run` | Rodar no dispositivo/emulador |
| `flutter build apk` | Gerar APK de release |
| `flutter build ios` | Gerar build iOS |
| `flutter test` | Rodar testes |
| `dart run build_runner build` | Gerar código (freezed, etc.) |

## Configuração da API

O endereço da API está configurado em `lib/core/network/dio_client.dart`:

- **Android Emulator:** `http://10.0.2.2:3000/v1` (padrão)
- **iOS Simulator:** `http://localhost:3000/v1`
- **Dispositivo físico:** Use o IP da sua máquina na rede local

## Estado Atual

- **Feature `auth`**: Implementação completa (login, registro, splash screen)
- **Features `demands`, `quotes`, `orders`, `portfolio`, `forecast`**: Estrutura de diretórios criada, aguardando implementação

## Temas

O app suporta tema claro e escuro (Material 3), configurado automaticamente pelo sistema operacional. A paleta de cores usa azul/indigo como cor primária.
