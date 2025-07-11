"use client";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 p-3 sm:p-6">
      <div className="flex flex-col items-center justify-center min-h-screen">
        <section className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 sm:p-8 max-w-full sm:max-w-2xl w-full text-center">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-blue-600 dark:text-blue-400 mb-4 break-words">Bienvenido a Estilo Urbano</h1>
          <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 mb-6 break-words">
            Personaliza tus camisetas y viste tu creatividad. ¡Explora nuestro catálogo o diseña la tuya!
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center mb-6 w-full">
            <Link href="/productos" className="bg-blue-600 text-white px-4 sm:px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-sm sm:text-base w-full sm:w-auto">Ver productos</Link>
            <Link href="/personalizar" className="bg-green-600 text-white px-4 sm:px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition text-sm sm:text-base w-full sm:w-auto">Personalizar camiseta</Link>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">¿Por qué elegirnos?</h2>
          <ul className="text-gray-700 dark:text-gray-300 space-y-1 text-sm sm:text-base">
            <li>✔️ Calidad premium en cada prenda</li>
            <li>✔️ Personalización fácil y rápida</li>
            <li>✔️ Pagos seguros y envío a todo el país</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
