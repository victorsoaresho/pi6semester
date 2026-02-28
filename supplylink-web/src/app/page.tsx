import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-6 px-4">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
          Supply<span className="text-indigo-600">Link</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-md mx-auto">
          Conectando fábricas e fornecedores
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link
            href="/login"
            className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="rounded-lg border border-indigo-600 px-6 py-3 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            Criar Conta
          </Link>
        </div>
      </div>
    </div>
  );
}
