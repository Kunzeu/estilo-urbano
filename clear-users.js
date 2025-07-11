const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearUsers() {
  try {
    console.log('Eliminando todos los usuarios...');
    
    const deletedUsers = await prisma.user.deleteMany({});
    
    console.log(`✅ Se eliminaron ${deletedUsers.count} usuarios de la base de datos.`);
    console.log('Ahora puedes crear un nuevo usuario admin desde la web.');
    
  } catch (error) {
    console.error('Error al eliminar usuarios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearUsers(); 