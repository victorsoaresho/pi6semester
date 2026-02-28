import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-gray-900">404</h1>
      <h2 className="mt-2 text-xl font-semibold text-gray-700">
        Página Não Encontrada
      </h2>
      <p className="mt-2 text-gray-500">
        A página que você procura não existe ou foi movida.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
      >
        Voltar ao Início
      </Link>
    </div>
  );
}
