import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const typeInteriors = [
  { name: 'Classe Basse', icon: 'Home', order: 1 },
  { name: 'Classe Moyenne', icon: 'House', order: 2 },
  { name: 'Classe Haute', icon: 'Villa', order: 3 },
  { name: 'Garages', icon: 'Garage', order: 4 },
  { name: 'Entrepôts', icon: 'Warehouse', order: 5 },
  { name: 'Bureaux', icon: 'Business', order: 6 },
  { name: 'Spécifique', icon: 'Diamond', order: 7 },
];

async function main() {
  console.log('🏠 Création des types d\'intérieurs...');
  
  for (const type of typeInteriors) {
    const existing = await prisma.typeInterior.findUnique({
      where: { name: type.name }
    });
    
    if (!existing) {
      await prisma.typeInterior.create({
        data: type
      });
      console.log(`✅ Créé: ${type.name} (${type.icon})`);
    } else {
      console.log(`⚠️ Existe déjà: ${type.name}`);
    }
  }
  
  console.log('🎉 Types d\'intérieurs configurés !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
