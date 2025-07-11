// Extiende los tipos de NextAuth para incluir el campo 'rol' y 'nombre' en user y session

declare module "next-auth" {
  interface Session {
    user: {
      id?: number;
      name?: string | null;
      nombre?: string | null;
      email?: string | null;
      image?: string | null;
      rol?: string;
    };
  }
  interface User {
    id: number;
    nombre?: string | null;
    email: string;
    password?: string | null;
    image?: string | null;
    provider?: string | null;
    createdAt: Date;
    updatedAt: Date;
    rol: string;
  }
} 