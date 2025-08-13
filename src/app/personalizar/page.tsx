"use client";
import { useSession } from "next-auth/react";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const COLORES = ["#000000", "#ffffff", "#e11d48", "#2563eb", "#22c55e", "#fbbf24"];
const TALLAS = ["S", "M", "L", "XL", "XXL"];

// Tipos para el formulario y las personalizaciones
interface Personalizacion {
  id: number;
  color: string;
  talla: string;
  texto: string;
  textoColor: string;
  imagen: File | null; // legacy
  imagenPreview: string | null; // legacy
  imagenFrente?: File | null;
  imagenFrentePreview?: string | null;
  imagenEspalda?: File | null;
  imagenEspaldaPreview?: string | null;
}

interface FormPersonalizacion {
  color: string;
  talla: string;
  texto: string;
  textoColor: string;
  imagen: File | null; // compat legacy
  imagenPreview: string | null; // compat legacy
  imagenFrente: File | null;
  imagenFrentePreview: string | null;
  imagenEspalda: File | null;
  imagenEspaldaPreview: string | null;
}

export default function PersonalizarPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [personalizaciones, setPersonalizaciones] = useState<Personalizacion[]>([]);
  const [form, setForm] = useState<FormPersonalizacion>({
    color: COLORES[0],
    talla: TALLAS[0],
    texto: "",
    textoColor: "#000000",
    imagen: null,
    imagenPreview: null,
    imagenFrente: null,
    imagenFrentePreview: null,
    imagenEspalda: null,
    imagenEspaldaPreview: null,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileFrenteRef = useRef<HTMLInputElement | null>(null);
  const fileEspaldaRef = useRef<HTMLInputElement | null>(null);
  const [frontScale, setFrontScale] = useState(1.25);
  const [frontOffsetY, setFrontOffsetY] = useState(0);
  const [backScale, setBackScale] = useState(1.25);
  const [backOffsetY, setBackOffsetY] = useState(0);

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded shadow text-center">
          <h2 className="text-2xl font-bold mb-4">Inicia sesión para personalizar camisetas</h2>
          <p className="mb-6">Debes estar logueado para acceder a la personalización.</p>
          <Link href="/login">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Iniciar sesión</Button>
          </Link>
        </div>
      </div>
    );
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function handleColor(color: string) {
    setForm(f => ({ ...f, color }));
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files && e.target.files[0];
    const name = e.target.name;
    if (!file) return;
    if (name === 'imagenFrente') {
      setForm(f => ({ ...f, imagenFrente: file, imagenFrentePreview: URL.createObjectURL(file) }));
    } else if (name === 'imagenEspalda') {
      setForm(f => ({ ...f, imagenEspalda: file, imagenEspaldaPreview: URL.createObjectURL(file) }));
    } else {
      setForm(f => ({ ...f, imagen: file, imagenPreview: URL.createObjectURL(file) }));
    }
  }

  function agregarPersonalizacion() {
    if (!form.talla || !form.color) {
      setError("Selecciona talla y color");
      return;
    }
    setPersonalizaciones(arr => [
      ...arr,
      {
        ...form,
        id: Date.now() + Math.random(),
      },
    ]);
    setForm({ color: COLORES[0], talla: TALLAS[0], texto: "", textoColor: "#000000", imagen: null, imagenPreview: null, imagenFrente: null, imagenFrentePreview: null, imagenEspalda: null, imagenEspaldaPreview: null });
    setError("");
    if (fileFrenteRef.current) fileFrenteRef.current.value = "";
    if (fileEspaldaRef.current) fileEspaldaRef.current.value = "";
  }

  function eliminarPersonalizacion(id: number) {
    setPersonalizaciones(arr => arr.filter(p => p.id !== id));
  }

  async function enviarPersonalizaciones() {
    if (personalizaciones.length === 0) {
      setError("Agrega al menos una camiseta personalizada");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      const userEmail = session?.user?.email ?? "";
      formData.append("usuario", userEmail);
      personalizaciones.forEach((p: Personalizacion, i: number) => {
        formData.append(`personalizaciones[${i}][color]`, p.color);
        formData.append(`personalizaciones[${i}][talla]`, p.talla);
        formData.append(`personalizaciones[${i}][texto]`, p.texto);
        formData.append(`personalizaciones[${i}][textoColor]`, p.textoColor);
        if (p.imagenFrente) formData.append(`personalizaciones[${i}][imagenFrente]`, p.imagenFrente);
        if (p.imagenEspalda) formData.append(`personalizaciones[${i}][imagenEspalda]`, p.imagenEspalda);
      });
      const res = await fetch("/api/personalizar", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Error al enviar personalización");
      // Ir a checkout de personalización
      router.push(`/personalizar/checkout?pedido=${result.numeroPedido}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar personalización");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto bg-white rounded shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Personaliza tu camiseta</h1>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Formulario de personalización */}
          <div>
            <div className="mb-4">
              <label className="block font-medium mb-1">Color de camiseta</label>
              <div className="flex gap-2">
                {COLORES.map(c => (
                  <button
                    key={c}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${form.color === c ? "border-blue-600" : "border-gray-300"}`}
                    style={{ background: c }}
                    onClick={() => handleColor(c)}
                  />
                ))}
              </div>
            </div>
            {/* Ajustes de logo */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-3 border rounded-lg">
                <div className="font-medium mb-2">Ajustes Frente</div>
                <label className="block text-sm">Tamaño ({Math.round(frontScale * 100)}%)</label>
                <input type="range" min={50} max={250} value={Math.round(frontScale * 100)} onChange={(e) => setFrontScale(Number(e.target.value) / 100)} className="w-full" />
                <label className="block text-sm mt-3">Vertical ({frontOffsetY}%)</label>
                <input type="range" min={-20} max={20} value={frontOffsetY} onChange={(e) => setFrontOffsetY(Number(e.target.value))} className="w-full" />
              </div>
              <div className="p-3 border rounded-lg">
                <div className="font-medium mb-2">Ajustes Espalda</div>
                <label className="block text-sm">Tamaño ({Math.round(backScale * 100)}%)</label>
                <input type="range" min={50} max={250} value={Math.round(backScale * 100)} onChange={(e) => setBackScale(Number(e.target.value) / 100)} className="w-full" />
                <label className="block text-sm mt-3">Vertical ({backOffsetY}%)</label>
                <input type="range" min={-20} max={20} value={backOffsetY} onChange={(e) => setBackOffsetY(Number(e.target.value))} className="w-full" />
              </div>
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1">Talla</label>
              <select name="talla" value={form.talla} onChange={handleInput} className="border rounded px-3 py-2 w-full">
                {TALLAS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1">Texto personalizado</label>
              <input name="texto" value={form.texto} onChange={handleInput} className="border rounded px-3 py-2 w-full" placeholder="Escribe tu texto" maxLength={30} />
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs">Color del texto:</span>
                <input type="color" name="textoColor" value={form.textoColor} onChange={handleInput} />
              </div>
            </div>
            <div className="mb-4 space-y-6">
              <div>
                <label className="block font-medium mb-2">Logo Frente (opcional)</label>
                <div className="flex items-center gap-3">
                  <Button type="button" className="bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200 px-4 py-2" onClick={() => fileFrenteRef.current?.click()}>
                    {form.imagenFrente ? "Cambiar imagen" : "Subir imagen"}
                  </Button>
                  {form.imagenFrente && (
                    <Button
                      type="button"
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-100 px-3 py-2"
                      onClick={() => setForm(f => ({ ...f, imagenFrente: null, imagenFrentePreview: null }))}
                    >
                      Eliminar
                    </Button>
                  )}
                </div>
                <input type="file" name="imagenFrente" accept="image/*" ref={fileFrenteRef} onChange={handleFile} style={{ display: "none" }} />
                {form.imagenFrentePreview && (
                  <div className="mt-2">
                    <Image src={form.imagenFrentePreview} alt="Vista previa frente" width={120} height={120} className="rounded border" />
                  </div>
                )}
              </div>
              <div>
                <label className="block font-medium mb-2">Logo Espalda (opcional)</label>
                <div className="flex items-center gap-3">
                  <Button type="button" className="bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200 px-4 py-2" onClick={() => fileEspaldaRef.current?.click()}>
                    {form.imagenEspalda ? "Cambiar imagen" : "Subir imagen"}
                  </Button>
                  {form.imagenEspalda && (
                    <Button
                      type="button"
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-100 px-3 py-2"
                      onClick={() => setForm(f => ({ ...f, imagenEspalda: null, imagenEspaldaPreview: null }))}
                    >
                      Eliminar
                    </Button>
                  )}
                </div>
                <input type="file" name="imagenEspalda" accept="image/*" ref={fileEspaldaRef} onChange={handleFile} style={{ display: "none" }} />
                {form.imagenEspaldaPreview && (
                  <div className="mt-2">
                    <Image src={form.imagenEspaldaPreview} alt="Vista previa espalda" width={120} height={120} className="rounded border" />
                  </div>
                )}
              </div>
            </div>
            <Button type="button" className="bg-green-600 hover:bg-green-700 text-white w-full" onClick={agregarPersonalizacion}>
              Agregar al carrito de personalización
            </Button>
            {error && <div className="mt-4 text-red-600 text-sm">{error}</div>}
          </div>
          {/* Vista previa 2D: Frente y Espalda */}
          <div className="flex flex-col items-center w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
              {/* Frente */}
              <div className="relative w-full h-[520px] md:h-[620px] overflow-visible">
                <div
                  className="absolute inset-0"
                  style={{
                    WebkitMaskImage: 'url(/shirt_front_mask.svg)',
                    maskImage: 'url(/shirt_front_mask.svg)',
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                    maskPosition: 'center',
                    WebkitMaskSize: '115% 115%',
                    maskSize: '115% 115%',
                  }}
                >
                  {/* Color de prenda recortado a la camiseta */}
                  <div className="absolute inset-0" style={{ background: form.color }} />
                  {/* Área de impresión para el logo, centrada en el torso */}
                  <div
                    className="absolute w-[28%] h-[32%]"
                    style={{
                      left: '50%',
                      top: `calc(50% + ${frontOffsetY}%)`,
                      transform: `translate(-50%, -50%) scale(${frontScale})`,
                      transformOrigin: 'center'
                    }}
                  >
                    {form.imagenFrentePreview && (
                      <Image
                        src={form.imagenFrentePreview}
                        alt="Logo frente"
                        fill
                        className="object-contain object-center"
                        style={{ backgroundColor: 'transparent' }}
                      />
                    )}
                  </div>
                </div>
                {form.texto && (
                  <span
                    className="absolute left-1/2 bottom-6 -translate-x-1/2 text-base font-bold"
                    style={{ color: form.textoColor }}
                  >
                    {form.texto}
                  </span>
                )}
                <div className="absolute left-2 top-2 text-xs bg-white/80 px-2 py-0.5 rounded border">Frente</div>
              </div>

              {/* Espalda */}
              <div className="relative w-full h-[520px] md:h-[620px] overflow-visible">
                <div
                  className="absolute inset-0"
                  style={{
                    WebkitMaskImage: 'url(/shirt_back_mask.svg)',
                    maskImage: 'url(/shirt_back_mask.svg)',
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                    maskPosition: 'center',
                    WebkitMaskSize: '115% 115%',
                    maskSize: '115% 115%',
                  }}
                >
                  {/* Color de prenda recortado a la camiseta */}
                  <div className="absolute inset-0" style={{ background: form.color }} />
                  {/* Área de impresión para el logo (espalda) */}
                  <div
                    className="absolute w-[28%] h-[32%]"
                    style={{
                      left: '50%',
                      top: `calc(50% + ${backOffsetY}%)`,
                      transform: `translate(-50%, -50%) scale(${backScale})`,
                      transformOrigin: 'center'
                    }}
                  >
                    {form.imagenEspaldaPreview && (
                      <Image
                        src={form.imagenEspaldaPreview}
                        alt="Logo espalda"
                        fill
                        className="object-contain object-center"
                        style={{ backgroundColor: 'transparent' }}
                      />
                    )}
                  </div>
                </div>
                {form.texto && (
                  <span
                    className="absolute left-1/2 bottom-6 -translate-x-1/2 text-base font-bold"
                    style={{ color: form.textoColor }}
                  >
                    {form.texto}
                  </span>
                )}
                <div className="absolute left-2 top-2 text-xs bg-white/80 px-2 py-0.5 rounded border">Espalda</div>
              </div>
            </div>
            <div className="text-sm text-gray-500 mt-2">Vista previa de la camiseta (2D)</div>
          </div>
        </div>
        {/* Lista de personalizaciones agregadas */}
        {personalizaciones.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Tus camisetas personalizadas</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {personalizaciones.map(p => (
                <div key={p.id} className="border rounded p-3 md:p-4 bg-gray-50">
                  <div className="flex items-center gap-3">
                    {/* Frente */}
                    <div className="relative w-20 h-28">
                      <div className="absolute inset-0 rounded-md border" style={{ background: p.color }} />
                      {p.imagenFrentePreview && (
                        <Image src={p.imagenFrentePreview} alt="Frente" width={46} height={46} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded shadow object-contain" />
                      )}
                    </div>
                    {/* Espalda */}
                    <div className="relative w-20 h-28">
                      <div className="absolute inset-0 rounded-md border" style={{ background: p.color }} />
                      {p.imagenEspaldaPreview && (
                        <Image src={p.imagenEspaldaPreview} alt="Espalda" width={46} height={46} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded shadow object-contain" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">Talla: {p.talla}</div>
                      <div className="text-xs text-gray-500">Color: <span style={{ background: p.color }} className="inline-block w-4 h-4 rounded align-middle border ml-1" /></div>
                    </div>
                    <button onClick={() => eliminarPersonalizacion(p.id)} className="text-red-600 hover:text-red-800 text-xs whitespace-nowrap">Eliminar</button>
                  </div>
                  {p.texto && (
                    <div className="mt-2 text-xs font-semibold" style={{ color: p.textoColor }}>Texto: {p.texto}</div>
                  )}
                </div>
              ))}
            </div>
            <Button className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={enviarPersonalizaciones} disabled={loading}>
              {loading ? "Enviando..." : "Finalizar y pagar"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 