"use server";

import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isValidEmail, isStrongPassword } from '@/lib/auth-utils';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export type UserRole = 'AGENT' | 'ADMIN';

export type UserInput = {
  name?: string;
  email: string;
  role: UserRole;
  password?: string; // Optionnel pour update
};

export type UserOutput = {
  id: string;
  name?: string | null;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date | null;
};

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('UNAUTHORIZED: Admin access required');
  }
  return session;
}

export async function getAllUsers(): Promise<UserOutput[]> {
  await requireAdmin();
  
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
    },
    orderBy: { createdAt: 'desc' }
  });
  
  return users as UserOutput[];
}

export async function createUser(userData: UserInput): Promise<UserOutput> {
  await requireAdmin();
  
  // Validation
  if (!isValidEmail(userData.email)) {
    throw new Error('Format email invalide');
  }
  
  if (!userData.password) {
    throw new Error('Mot de passe requis pour la création');
  }
  
  const passwordValidation = isStrongPassword(userData.password);
  if (!passwordValidation.valid) {
    throw new Error(`Mot de passe faible: ${passwordValidation.errors.join(', ')}`);
  }
  
  // Vérifier email unique
  const existing = await prisma.user.findUnique({
    where: { email: userData.email }
  });
  
  if (existing) {
    throw new Error('Un utilisateur avec cet email existe déjà');
  }
  
  // Hash password
  const passwordHash = await bcrypt.hash(userData.password, 12);
  
  const user = await prisma.user.create({
    data: {
      name: userData.name,
      email: userData.email,
      role: userData.role,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
    }
  });
  
  return user as UserOutput;
}

export async function updateUser(id: string, userData: Partial<UserInput>): Promise<UserOutput> {
  const session = await requireAdmin();
  
  // Validation email si fourni
  if (userData.email && !isValidEmail(userData.email)) {
    throw new Error('Format email invalide');
  }
  
  // Validation mot de passe si fourni
  let passwordHash: string | undefined;
  if (userData.password) {
    const passwordValidation = isStrongPassword(userData.password);
    if (!passwordValidation.valid) {
      throw new Error(`Mot de passe faible: ${passwordValidation.errors.join(', ')}`);
    }
    passwordHash = await bcrypt.hash(userData.password, 12);
  }
  
  // Vérifier email unique si changé
  if (userData.email) {
    const existing = await prisma.user.findFirst({
      where: { 
        email: userData.email,
        NOT: { id: id }
      }
    });
    
    if (existing) {
      throw new Error('Un utilisateur avec cet email existe déjà');
    }
  }
  
  // Empêcher un admin de se rétrograder lui-même
  if (userData.role === 'AGENT' && session.user.id === id) {
    throw new Error('Vous ne pouvez pas changer votre propre rôle');
  }
  
  const updateData: any = {};
  if (userData.name !== undefined) updateData.name = userData.name;
  if (userData.email) updateData.email = userData.email;
  if (userData.role) updateData.role = userData.role;
  if (passwordHash) updateData.passwordHash = passwordHash;
  
  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
    }
  });
  
  return user as UserOutput;
}

export async function deleteUser(id: string): Promise<void> {
  const session = await requireAdmin();
  
  // Empêcher un admin de se supprimer lui-même
  if (session.user.id === id) {
    throw new Error('Vous ne pouvez pas supprimer votre propre compte');
  }
  
  await prisma.user.delete({ where: { id } });
}
