"use client";
import Link from "next/link";
import { ShoppingCart, Shirt, LogIn, Home, ChevronDown, User, Heart, Menu, X } from "lucide-react";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useRef, useState, useEffect } from "react";
import { useCart } from "@/components/CartContext";

interface UserWithRol {
  name?: string | null;
  nombre?: string | null;
  email?: string | null;
  image?: string | null;
  rol?: string;
}

export default function Header() {
  const { data: session } = useSession();
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [openMobileMenu, setOpenMobileMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const { totalItems } = useCart();

  // Función para obtener el nombre a mostrar
  const getDisplayName = (user: UserWithRol) => {
    if (user.nombre) return user.nombre;
    if (user.name) return user.name;
    if (user.email) {
      // Extraer el nombre del email (parte antes del @)
      const nameFromEmail = user.email.split('@')[0];
      return nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
    }
    return "Usuario";
  };

  // Cerrar el menú al hacer clic fuera (excepto si el clic es en el botón o dentro del menú)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setOpenUserMenu(false);
      }
      
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setOpenMobileMenu(false);
      }
    }
    if (openUserMenu || openMobileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openUserMenu, openMobileMenu]);

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setOpenMobileMenu(false);
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full bg-white/80 dark:bg-gray-900/80 shadow-md z-50 backdrop-blur border-b border-gray-200 dark:border-gray-800">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo-estilo-urbano.png" alt="Estilo Urbano Logo" width={48} height={48} className="rounded" priority />
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 tracking-tight hidden sm:inline">Estilo Urbano</span>
        </Link>
        
        {/* Navegación de escritorio */}
        <div className="hidden md:flex gap-4 text-base font-medium items-center">
          <Link href="/productos" className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition"><Shirt size={20}/>Productos</Link>
          <Link href="/personalizar" className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition"><Home size={20}/>Personalizar</Link>
          <Link href="/carrito" className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition relative">
            <ShoppingCart size={20}/>
            Carrito
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs rounded-full px-2 py-0.5 font-bold shadow">{totalItems}</span>
            )}
          </Link>
          {session && session.user ? (
            <div
              className="relative"
              ref={userMenuRef}
            >
              <button
                ref={buttonRef}
                className={`flex items-center gap-2 focus:outline-none ${openUserMenu ? "bg-gray-100 dark:bg-gray-800" : ""}`}
                onClick={() => setOpenUserMenu((v) => !v)}
                aria-expanded={openUserMenu}
                aria-haspopup="true"
                type="button"
              >
                {session.user.image ? (
                  <Image src={session.user.image} alt="avatar" width={32} height={32} className="rounded-full" />
                ) : (
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <User size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                )}
                <span className="text-sm font-semibold">{getDisplayName(session.user)}</span>
                <ChevronDown size={18} />
              </button>
              <div
                className={`absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded shadow-lg border border-gray-200 dark:border-gray-700 transition-opacity z-[100] ${openUserMenu ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                onClick={e => e.stopPropagation()}
              >
                <ul className="py-2">
                  <li>
                    <Link href="/perfil" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                      <User size={18} /> Mi Perfil
                    </Link>
                  </li>
                  <li>
                    <Link href="/favoritos" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                      <Heart size={18} /> Favoritos
                    </Link>
                  </li>
                  {(session.user as UserWithRol).rol === "admin" && (
                    <>
                      <li>
                        <Link href="/admin" className="flex items-center gap-2 px-4 py-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition font-semibold text-blue-600 dark:text-blue-400">
                          Panel de Administración
                        </Link>
                      </li>
                    </>
                  )}
                  <li>
                    <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-red-600">
                      Cerrar sesión
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <Link href="/login" className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition"><LogIn size={20}/>Iniciar Sesión</Link>
          )}
        </div>

        {/* Botón del carrito para móvil */}
        <div className="md:hidden flex items-center gap-2">
          <Link href="/carrito" className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
            <ShoppingCart size={20}/>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 font-bold shadow">{totalItems}</span>
            )}
          </Link>
          
          {/* Botón hamburguesa */}
          <button
            onClick={() => setOpenMobileMenu(!openMobileMenu)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
            aria-label="Abrir menú"
          >
            {openMobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Menú móvil */}
      <div
        ref={mobileMenuRef}
        className={`md:hidden fixed top-16 left-0 w-full bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700 transition-all duration-300 z-40 ${
          openMobileMenu ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
        }`}
      >
        <div className="px-4 py-6 space-y-4">
          {/* Enlaces de navegación */}
          <div className="space-y-2">
            <Link 
              href="/productos" 
              className="flex items-center gap-3 px-4 py-3 text-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              onClick={() => setOpenMobileMenu(false)}
            >
              <Shirt size={20}/> Productos
            </Link>
            <Link 
              href="/personalizar" 
              className="flex items-center gap-3 px-4 py-3 text-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              onClick={() => setOpenMobileMenu(false)}
            >
              <Home size={20}/> Personalizar
            </Link>
          </div>

          {/* Sección de usuario */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            {session && session.user ? (
              <details className="group">
                <summary className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition list-none">
                  {session.user.image ? (
                    <Image src={session.user.image} alt="avatar" width={40} height={40} className="rounded-full" />
                  ) : (
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <User size={24} className="text-blue-600 dark:text-blue-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{getDisplayName(session.user)}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{session.user.email}</p>
                  </div>
                  <ChevronDown size={20} className="text-gray-500 dark:text-gray-400 transition-transform group-open:rotate-180" />
                </summary>
                
                <div className="space-y-1 mt-2 ml-4">
                  <Link 
                    href="/perfil" 
                    className="flex items-center gap-3 px-4 py-3 text-lg hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                    onClick={() => setOpenMobileMenu(false)}
                  >
                    <User size={20} /> Mi Perfil
                  </Link>
                  <Link 
                    href="/favoritos" 
                    className="flex items-center gap-3 px-4 py-3 text-lg hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                    onClick={() => setOpenMobileMenu(false)}
                  >
                    <Heart size={20} /> Favoritos
                  </Link>
                  {(session.user as UserWithRol).rol === "admin" && (
                    <Link 
                      href="/admin" 
                      className="flex items-center gap-3 px-4 py-3 text-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition font-semibold text-blue-600 dark:text-blue-400"
                      onClick={() => setOpenMobileMenu(false)}
                    >
                      Panel de Administración
                    </Link>
                  )}
                  <button 
                    onClick={() => {
                      signOut({ callbackUrl: "/" });
                      setOpenMobileMenu(false);
                    }} 
                    className="w-full text-left flex items-center gap-3 px-4 py-3 text-lg hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition text-red-600"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </details>
            ) : (
              <Link 
                href="/login" 
                className="flex items-center gap-3 px-4 py-3 text-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                onClick={() => setOpenMobileMenu(false)}
              >
                <LogIn size={20}/> Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 