import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import Image from 'next/image';

export default async function ArchivosAdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.rol !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso denegado</h1>
          <p className="text-gray-600">Debes ser administrador para ver esta página.</p>
        </div>
      </div>
    );
  }

  const archivos = await prisma.uploadedFile.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: true },
  });

  // Inferencia de tipo para cada archivo
  type ArchivoConUsuario = typeof archivos[number];

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Archivos subidos por los usuarios</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">Miniatura</th>
              <th className="py-2 px-4 border-b">Nombre</th>
              <th className="py-2 px-4 border-b">Usuario</th>
              <th className="py-2 px-4 border-b">Fecha</th>
              <th className="py-2 px-4 border-b">Acción</th>
            </tr>
          </thead>
          <tbody>
            {archivos.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">No hay archivos subidos aún.</td>
              </tr>
            ) : (
              archivos.map((archivo: ArchivoConUsuario) => (
                <tr key={archivo.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4 text-center">
                    <a href={archivo.url} target="_blank" rel="noopener noreferrer">
                      <Image src={archivo.url} alt={archivo.filename} width={64} height={64} className="w-16 h-16 object-contain rounded shadow" />
                    </a>
                  </td>
                  <td className="py-2 px-4">{archivo.filename}</td>
                  <td className="py-2 px-4">{archivo.user?.nombre || archivo.user?.email || 'Sin nombre'}</td>
                  <td className="py-2 px-4">{new Date(archivo.createdAt).toLocaleString()}</td>
                  <td className="py-2 px-4">
                    <a href={archivo.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Ver/Descargar</a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 