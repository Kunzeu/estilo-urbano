"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

interface UserWithRol {
  name?: string | null;
  nombre?: string | null;
  email?: string | null;
  image?: string | null;
  rol?: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/login");
      return;
    }

    if ((session.user as UserWithRol)?.rol !== "admin") {
      router.push("/");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!session || (session.user as UserWithRol)?.rol !== "admin") {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 px-4 sm:px-6">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">
          Panel de Administración
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
          Bienvenido, {(session.user as UserWithRol)?.nombre ?? session.user?.name ?? session.user?.email}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Gestión de Usuarios
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Administra usuarios, roles y permisos del sistema.
          </p>
          <a 
            href="/admin/usuarios" 
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Gestionar Usuarios
          </a>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Gestión de Productos
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Crea, edita y elimina productos del catálogo.
          </p>
          <a 
            href="/admin/productos" 
            className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Gestionar Productos
          </a>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Gestión de pedidos
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Visualiza y actualiza el estado de todos los pedidos realizados en la tienda.
          </p>
          <a 
            href="/admin/pedidos" 
            className="inline-block bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Gestionar Pedidos
          </a>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Configuración
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Ajustes generales del sistema y configuración.
          </p>
          <a 
            href="/admin/configuracion" 
            className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Configuración
          </a>
        </div>
      </div>

      <div className="mt-6 sm:mt-8 text-center">
        <Link 
          href="/" 
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
} 