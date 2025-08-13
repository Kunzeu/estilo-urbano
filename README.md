# Estilo Urbano 🎨

Una plataforma de comercio electrónico moderna para personalización de camisetas y ropa urbana, construida con Next.js 15, TypeScript y PostgreSQL.

## 📋 Tabla de Contenidos

- [Descripción](#descripción)
- [Características](#características)
- [Tecnologías](#tecnologías)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [API Endpoints](#api-endpoints)
- [Base de Datos](#base-de-datos)
- [Autenticación](#autenticación)
- [Pagos](#pagos)
- [Despliegue](#despliegue)
- [Contribución](#contribución)
- [Licencia](#licencia)

## 🎯 Descripción

Estilo Urbano es una plataforma de comercio electrónico especializada en la personalización de camisetas y ropa urbana. Los usuarios pueden explorar productos predefinidos o crear diseños personalizados utilizando herramientas de diseño integradas.

### Funcionalidades Principales

- **Catálogo de Productos**: Explorar camisetas y ropa urbana
- **Personalización**: Herramientas de diseño para crear camisetas únicas
- **Carrito de Compras**: Gestión completa del proceso de compra
- **Sistema de Pagos**: Integración con múltiples métodos de pago
- **Panel de Administración**: Gestión de productos, pedidos y usuarios
- **Perfil de Usuario**: Gestión de información personal y pedidos

## ✨ Características

### Para Clientes
- 🛍️ Catálogo de productos con filtros
- 🎨 Herramienta de personalización de camisetas
- 🛒 Carrito de compras persistente
- 💳 Múltiples métodos de pago (PSE, Nequi)
- 📱 Diseño responsive
- 👤 Perfil de usuario con historial de pedidos
- 🌙 Modo oscuro/claro

### Para Administradores
- 📊 Panel de administración completo
- 👥 Gestión de usuarios y roles
- 📦 Gestión de productos y inventario
- 📋 Seguimiento de pedidos
- 📁 Gestión de archivos subidos
- 📈 Estadísticas de ventas

## 🛠️ Tecnologías

### Frontend
- **Next.js 15** - Framework de React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de estilos
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de esquemas
- **Lucide React** - Iconografía

### Backend
- **Next.js API Routes** - API REST
- **Prisma** - ORM para base de datos
- **PostgreSQL** - Base de datos principal
- **NextAuth.js** - Autenticación
- **bcryptjs** - Encriptación de contraseñas

### Herramientas de Diseño
- **Fabric.js** - Canvas para diseño
- **Three.js** - Renderizado 3D
- **html2canvas** - Captura de pantalla
- **Cloudinary** - Almacenamiento de imágenes

### Pagos
- **PSE** - Pagos seguros en línea
- **Nequi** - Billetera digital

## 🚀 Instalación

### Prerrequisitos

- Node.js 18+ 
- PostgreSQL
- npm, yarn, pnpm o bun

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/estilo-urbano.git
cd estilo-urbano
```

### 2. Instalar dependencias

```bash
npm install
# o
yarn install
# o
pnpm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Base de datos
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/estilo_urbano"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secret-key-aqui"

# Cloudinary
CLOUDINARY_CLOUD_NAME="tu-cloud-name"
CLOUDINARY_API_KEY="tu-api-key"
CLOUDINARY_API_SECRET="tu-api-secret"

# Pagos (opcional)
PSE_MERCHANT_ID="tu-merchant-id"
NEQUI_API_KEY="tu-nequi-api-key"
```

### 4. Configurar la base de datos

```bash
# Generar el cliente de Prisma
npm run postinstall

# Ejecutar migraciones
npx prisma migrate dev

# Opcional: Poblar con datos de ejemplo
npx prisma db seed
```

### 5. Ejecutar el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## ⚙️ Configuración

### Base de Datos

El proyecto utiliza PostgreSQL con Prisma como ORM. Las migraciones están en `prisma/migrations/`.

### Autenticación

Configurada con NextAuth.js, soporta:
- Autenticación por email/contraseña
- OAuth (configurable)
- Roles de usuario (user, admin)

### Almacenamiento

Las imágenes se almacenan en Cloudinary para optimización automática.

## 📁 Estructura del Proyecto

```
estilo-urbano/
├── src/
│   ├── app/                    # App Router de Next.js
│   │   ├── admin/             # Panel de administración
│   │   ├── api/               # API Routes
│   │   ├── carrito/           # Páginas del carrito
│   │   ├── login/             # Autenticación
│   │   ├── pago/              # Proceso de pago
│   │   ├── pedidos/           # Gestión de pedidos
│   │   ├── perfil/            # Perfil de usuario
│   │   └── productos/         # Catálogo de productos
│   ├── components/            # Componentes reutilizables
│   │   ├── ui/               # Componentes de UI
│   │   └── layout/           # Componentes de layout
│   ├── lib/                  # Utilidades y configuraciones
│   └── types/                # Definiciones de tipos
├── prisma/                   # Esquema y migraciones de BD
├── public/                   # Archivos estáticos
└── docs/                     # Documentación adicional
```

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Productos
- `GET /api/productos` - Listar productos
- `POST /api/productos` - Crear producto
- `GET /api/productos/[id]` - Obtener producto
- `PUT /api/productos/[id]` - Actualizar producto
- `DELETE /api/productos/[id]` - Eliminar producto

### Pedidos
- `GET /api/pedidos` - Listar pedidos
- `POST /api/pedidos` - Crear pedido
- `GET /api/pedidos/[id]` - Obtener pedido
- `PUT /api/pedidos/[id]/estado` - Actualizar estado

### Usuarios
- `GET /api/usuarios` - Listar usuarios
- `PUT /api/usuarios/[id]/rol` - Cambiar rol
- `GET /api/user/profile` - Perfil del usuario actual

### Pagos
- `POST /api/pedidos/pago` - Procesar pago
- `POST /api/nequi/webhook` - Webhook de Nequi

## 🗄️ Base de Datos

### Modelos Principales

- **User**: Usuarios del sistema
- **Producto**: Productos del catálogo
- **Pedido**: Pedidos de los clientes
- **PedidoItem**: Items individuales de cada pedido

### Relaciones

```
User (1) ── (N) Pedido
Pedido (1) ── (N) PedidoItem
Producto (1) ── (N) PedidoItem
```

## 🔐 Autenticación

El sistema utiliza NextAuth.js con:

- **Estrategias**: Credentials, OAuth (configurable)
- **Roles**: user, admin
- **Sesiones**: JWT
- **Protección**: Middleware para rutas protegidas

## 💳 Pagos

### Métodos Soportados

1. **PSE (Pagos Seguros en Línea)**
   - Integración con bancos colombianos
   - Proceso seguro y verificado

2. **Nequi**
   - Billetera digital
   - Pagos instantáneos

### Flujo de Pago

1. Usuario selecciona productos
2. Completa información de envío
3. Selecciona método de pago
4. Redirección a pasarela de pago
5. Confirmación y actualización de estado

## 🚀 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. El build automático incluye:
   - Generación del cliente Prisma
   - Ejecución de migraciones
   - Build de Next.js

### Variables de Entorno para Producción

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://tu-dominio.com"
NEXTAUTH_SECRET="secret-produccion"
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
```

### Otros Proveedores

El proyecto es compatible con:
- Netlify
- Railway
- Heroku
- AWS

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guías de Contribución

- Usa TypeScript para todo el código nuevo
- Sigue las convenciones de Next.js
- Escribe tests para nuevas funcionalidades
- Documenta cambios en APIs

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

- **Email**: soporte@estilourbano.com
- **Documentación**: [docs.estilourbano.com](https://docs.estilourbano.com)
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/estilo-urbano/issues)

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/) por el framework
- [Prisma](https://prisma.io/) por el ORM
- [Tailwind CSS](https://tailwindcss.com/) por los estilos
- [Cloudinary](https://cloudinary.com/) por el almacenamiento de imágenes

---

**Estilo Urbano** - Viste tu creatividad 🎨
