"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ShoppingCart, User, Heart } from "lucide-react";

export default function UserNav() {
  const { data: session } = useSession();
  
  // Solo mostrar si el usuario está logueado
  if (!session?.user) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 mb-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Panel de Usuario
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link 
          href="/perfil" 
          className="flex items-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
        >
          <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mr-3" />
          <div>
            <h3 className="font-semibold text-indigo-900 dark:text-indigo-100">Mi Perfil</h3>
            <p className="text-sm text-indigo-700 dark:text-indigo-300">Ver y editar perfil</p>
          </div>
        </Link>
        
        <Link 
          href="/carrito" 
          className="flex items-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
        >
          <ShoppingCart className="w-6 h-6 text-orange-600 dark:text-orange-400 mr-3" />
          <div>
            <h3 className="font-semibold text-orange-900 dark:text-orange-100">Carrito</h3>
            <p className="text-sm text-orange-700 dark:text-orange-300">Ver mis compras</p>
          </div>
        </Link>
        
        <Link 
          href="/favoritos" 
          className="flex items-center p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-colors"
        >
          <Heart className="w-6 h-6 text-pink-600 dark:text-pink-400 mr-3" />
          <div>
            <h3 className="font-semibold text-pink-900 dark:text-pink-100">Favoritos</h3>
            <p className="text-sm text-pink-700 dark:text-pink-300">Mis productos favoritos</p>
          </div>
        </Link>
      </div>
    </div>
  );
} 