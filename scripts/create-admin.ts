import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { isValidEmail, isStrongPassword } from '../src/lib/auth-utils';

const prisma = new PrismaClient();

async function createFirstAdmin() {
  console.log('🚀 Création du premier administrateur Dynasty GTA...\n');

  // Vérifier s'il y a déjà des utilisateurs
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log('⚠️  Des utilisateurs existent déjà dans la base de données.');
    console.log('Voulez-vous vraiment créer un nouvel administrateur ? (y/N)');
    
    // En mode script, on continue automatiquement
    console.log('Création d\'un nouvel administrateur...\n');
  }

  // Données par défaut pour le premier admin
  const defaultAdmin = {
    email: 'admin@dynasty-gta.com',
    password: 'Dynasty2024!Admin',
    name: 'Administrateur Principal'
  };

  console.log('Données de l\'administrateur :');
  console.log(`📧 Email: ${defaultAdmin.email}`);
  console.log(`👤 Nom: ${defaultAdmin.name}`);
  console.log(`🔒 Mot de passe: ${defaultAdmin.password}`);
  console.log('');

  // Validation de l'email
  if (!isValidEmail(defaultAdmin.email)) {
    throw new Error('❌ Format d\'email invalide');
  }

  // Validation du mot de passe
  const passwordValidation = isStrongPassword(defaultAdmin.password);
  if (!passwordValidation.valid) {
    console.error('❌ Mot de passe trop faible :');
    passwordValidation.errors.forEach(error => console.error(`   - ${error}`));
    throw new Error('Mot de passe non conforme aux exigences de sécurité');
  }

  // Vérifier si l'email existe déjà
  const existingUser = await prisma.user.findUnique({
    where: { email: defaultAdmin.email }
  });

  if (existingUser) {
    throw new Error(`❌ Un utilisateur avec l'email ${defaultAdmin.email} existe déjà`);
  }

  // Hachage du mot de passe
  console.log('🔐 Hachage du mot de passe...');
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(defaultAdmin.password, saltRounds);

  // Création de l'administrateur
  console.log('👤 Création de l\'utilisateur administrateur...');
  
  try {
    const admin = await prisma.user.create({
      data: {
        email: defaultAdmin.email,
        name: defaultAdmin.name,
        passwordHash: passwordHash,
        role: 'ADMIN',
        emailVerified: new Date(),
      }
    });

    console.log('✅ Administrateur créé avec succès !');
    console.log('');
    console.log('📋 Informations de connexion :');
    console.log(`   🆔 ID: ${admin.id}`);
    console.log(`   📧 Email: ${admin.email}`);
    console.log(`   👤 Nom: ${admin.name}`);
    console.log(`   🎭 Rôle: ${admin.role}`);
    console.log(`   📅 Créé le: ${admin.createdAt.toLocaleString('fr-FR')}`);
    console.log('');
    console.log('🔐 Prochaines étapes :');
    console.log('   1. Connectez-vous avec ces identifiants sur /auth/signin');
    console.log('   3. Changez le mot de passe par défaut');
    console.log('   4. Créez d\'autres comptes agents si nécessaire');
    console.log('');
    console.log('⚠️  IMPORTANT : Supprimez ce script après la première utilisation !');

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'administrateur:', error);
    throw error;
  }
}

// Fonction pour créer un agent
async function createAgent(email: string, name: string, password: string) {
  console.log(`🧑‍💼 Création de l'agent: ${name} (${email})`);

  // Validations
  if (!isValidEmail(email)) {
    throw new Error('❌ Format d\'email invalide');
  }

  const passwordValidation = isStrongPassword(password);
  if (!passwordValidation.valid) {
    console.error('❌ Mot de passe trop faible :');
    passwordValidation.errors.forEach(error => console.error(`   - ${error}`));
    throw new Error('Mot de passe non conforme');
  }

  // Vérifier si l'email existe déjà
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new Error(`❌ Un utilisateur avec l'email ${email} existe déjà`);
  }

  // Création de l'agent
  const passwordHash = await bcrypt.hash(password, 12);
  
  const agent = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      role: 'AGENT',
      emailVerified: new Date(),
      twoFactorEnabled: false,
    }
  });

  console.log(`✅ Agent ${name} créé avec succès !`);
  return agent;
}

// Script principal
async function main() {
  try {
    // Créer l'admin principal
    await createFirstAdmin();

    // Optionnel : créer quelques agents de test
    console.log('\n📝 Création d\'agents de test...');
    
    await createAgent(
      'agent1@dynasty-gta.com',
      'Agent Commercial 1',
      'Agent2024!Test1'
    );

    await createAgent(
      'agent2@dynasty-gta.com', 
      'Agent Commercial 2',
      'Agent2024!Test2'
    );

    console.log('\n🎉 Configuration initiale terminée avec succès !');
    console.log('🔗 Accédez à votre espace pro : http://localhost:3000/pro');

  } catch (error) {
    console.error('\n💥 Erreur lors de la configuration :', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
if (require.main === module) {
  main();
}

export { createFirstAdmin, createAgent };
