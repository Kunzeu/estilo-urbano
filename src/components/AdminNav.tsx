"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Users, Package, Settings, Shirt } from "lucide-react";

interface UserWithRol {
  name?: string | null;
  nombre?: string | null;
  email?: string | null;
  image?: string | null;
  rol?: string;
}

export default function AdminNav() {
  const { data: session } = useSession();
  const user = session?.user as UserWithRol | undefined;
  
  // Solo mostrar si el usuario es admin
  if (!user || user.rol !== "admin") {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 mb-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Panel de Administración
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link 
          href="/admin/usuarios" 
          className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
        >
          <Users className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">Usuarios</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">Gestionar usuarios</p>
          </div>
        </Link>
        
        <Link 
          href="/admin/productos" 
          className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
        >
          <Package className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" />
          <div>
            <h3 className="font-semibold text-green-900 dark:text-green-100">Productos</h3>
            <p className="text-sm text-green-700 dark:text-green-300">Gestionar productos</p>
          </div>
        </Link>
        
        <Link 
          href="/admin/personalizados" 
          className="flex items-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
        >
          <Shirt className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mr-3" />
          <div>
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">Personalizados</h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">Pedidos personalizados</p>
          </div>
        </Link>

        <Link 
          href="/admin/configuracion" 
          className="flex items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
        >
          <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400 mr-3" />
          <div>
            <h3 className="font-semibold text-purple-900 dark:text-purple-100">Configuración</h3>
            <p className="text-sm text-purple-700 dark:text-purple-300">Ajustes del sistema</p>
          </div>
        </Link>
      </div>
    </div>
  );
} 