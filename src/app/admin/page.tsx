"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Users, Package, ClipboardList, Settings } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-gray-200 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 py-8 px-2">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 drop-shadow">Panel de Administración</h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">Bienvenido, <span className="font-semibold text-blue-600 dark:text-blue-400">{(session.user as UserWithRol)?.nombre ?? session.user?.name ?? session.user?.email}</span></p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Usuarios */}
          <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col items-center text-center transition-transform hover:-translate-y-1 hover:shadow-2xl border border-transparent hover:border-blue-200 dark:hover:border-blue-800">
            <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full mb-4">
              <Users size={40} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Gestión de Usuarios</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Administra usuarios, roles y permisos del sistema.</p>
            <Link href="/admin/usuarios" className="w-full inline-block bg-blue-600 text-white font-semibold py-2 rounded-lg shadow hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900">Gestionar Usuarios</Link>
          </div>

          {/* Productos */}
          <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col items-center text-center transition-transform hover:-translate-y-1 hover:shadow-2xl border border-transparent hover:border-green-200 dark:hover:border-green-800">
            <div className="bg-green-100 dark:bg-green-900 p-4 rounded-full mb-4">
              <Package size={40} className="text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Gestión de Productos</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Crea, edita y elimina productos del catálogo.</p>
            <Link href="/admin/productos" className="w-full inline-block bg-green-600 text-white font-semibold py-2 rounded-lg shadow hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900">Gestionar Productos</Link>
          </div>

          {/* Pedidos */}
          <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col items-center text-center transition-transform hover:-translate-y-1 hover:shadow-2xl border border-transparent hover:border-orange-200 dark:hover:border-orange-800">
            <div className="bg-orange-100 dark:bg-orange-900 p-4 rounded-full mb-4">
              <ClipboardList size={40} className="text-orange-500 dark:text-orange-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Gestión de Pedidos</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Visualiza y actualiza el estado de todos los pedidos realizados en la tienda.</p>
            <Link href="/admin/pedidos" className="w-full inline-block bg-orange-500 text-white font-semibold py-2 rounded-lg shadow hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900">Gestionar Pedidos</Link>
          </div>

          {/* Configuración */}
          <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col items-center text-center transition-transform hover:-translate-y-1 hover:shadow-2xl border border-transparent hover:border-purple-200 dark:hover:border-purple-800">
            <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-full mb-4">
              <Settings size={40} className="text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Configuración</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Ajustes generales del sistema y configuración.</p>
            <Link href="/admin/configuracion" className="w-full inline-block bg-purple-600 text-white font-semibold py-2 rounded-lg shadow hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900">Configuración</Link>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors font-medium text-base"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
} 