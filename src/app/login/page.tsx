"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (isRegister) {
      // Registro manual
      const res = await fetch("http://localhost:3002/api/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, nombre }),
      });
      if (res.ok) {
        await signIn("credentials", { email, password, callbackUrl: "/" });
      } else {
        const data = await res.json();
        setError(data.error || "Error al registrar usuario");
      }
    } else {
      // Login manual
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) {
        setError("Credenciales incorrectas");
      } else {
        window.location.href = "/";
      }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white dark:bg-gray-900 p-8 rounded shadow w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">{isRegister ? "Crear cuenta" : "Iniciar sesión"}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isRegister && (
            <input type="text" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} className="border rounded px-3 py-2" />
          )}
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="border rounded px-3 py-2" />
          <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} className="border rounded px-3 py-2" />
          {error && <span className="text-red-600 text-sm">{error}</span>}
          <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 font-semibold hover:bg-blue-700 transition" disabled={loading}>
            {isRegister ? "Registrarse" : "Iniciar sesión"}
          </button>
        </form>
        <div className="flex flex-col gap-2 mt-6">
          <button onClick={() => signIn("google", { callbackUrl: "/" })} className="bg-red-500 text-white rounded px-4 py-2 font-semibold hover:bg-red-600 transition">Continuar con Google</button>
          <button onClick={() => signIn("facebook", { callbackUrl: "/" })} className="bg-blue-700 text-white rounded px-4 py-2 font-semibold hover:bg-blue-800 transition">Continuar con Facebook</button>
        </div>
        <div className="mt-6 text-center">
          <button onClick={() => { setIsRegister(!isRegister); setError(""); }} className="text-blue-600 hover:underline">
            {isRegister ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
          </button>
        </div>
      </div>
    </div>
  );
} 