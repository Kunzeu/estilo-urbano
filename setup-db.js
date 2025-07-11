const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupDatabase() {
  try {
    console.log('🔍 Verificando conexión a la base de datos...');
    
    // Verificar conexión
    await prisma.$connect();
    console.log('✅ Conexión exitosa a la base de datos');
    
    // Verificar si las tablas existen
    const userCount = await prisma.user.count();
    console.log(`📊 Usuarios en la base de datos: ${userCount}`);
    
    const productCount = await prisma.producto.count();
    console.log(`📦 Productos en la base de datos: ${productCount}`);
    
    console.log('✅ Base de datos configurada correctamente');
    
  } catch (error) {
    console.error('❌ Error al configurar la base de datos:', error);
    console.log('💡 Intenta ejecutar: npx prisma db push');
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase(); 