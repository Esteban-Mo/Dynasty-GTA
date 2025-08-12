"use server";

import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export type InteriorInput = {
  title: string;
  listImages: string;
  typeId: number;
  furniture: boolean;
  unfurnished: boolean;
  description?: string;
  stockage?: number;
  rooms?: number;
  bedRooms?: number;
  floor?: number;
  parkingSpots?: number;
  displayed: boolean;
  minRentalPrice?: number;
  maxRentalPrice?: number;
  minPurchasePrice?: number;
  maxPurchasePrice?: number;
};

export type InteriorOutput = {
  id: number;
  title: string;
  listImages: string;
  typeId: number;
  furniture: boolean;
  unfurnished: boolean;
  description?: string | null;
  stockage?: number | null;
  rooms?: number | null;
  bedRooms?: number | null;
  floor?: number | null;
  parkingSpots?: number | null;
  displayed: boolean;
  minRentalPrice?: number | null;
  maxRentalPrice?: number | null;
  minPurchasePrice?: number | null;
  maxPurchasePrice?: number | null;
  type: {
    id: number;
    name: string;
    icon: string;
    order: number;
  };
};

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('UNAUTHORIZED: Admin access required');
  }
  return session;
}

export async function getAllInteriorsAdmin(): Promise<InteriorOutput[]> {
  await requireAdmin();
  
  const interiors = await prisma.interior.findMany({
    include: {
      type: true
    },
    orderBy: { id: 'desc' }
  });
  
  return interiors as InteriorOutput[];
}

export async function createInterior(interiorData: InteriorInput): Promise<InteriorOutput> {
  await requireAdmin();
  
  // Validation basique
  if (!interiorData.title?.trim()) {
    throw new Error('Le titre est requis');
  }
  
  if (!interiorData.listImages?.trim()) {
    throw new Error('L\'URL des images est requise');
  }
  
  // Vérifier que le type existe
  const typeExists = await prisma.typeInterior.findUnique({
    where: { id: interiorData.typeId }
  });
  
  if (!typeExists) {
    throw new Error('Type d\'intérieur invalide');
  }
  
  const interior = await prisma.interior.create({
    data: interiorData,
    include: {
      type: true
    }
  });
  
  return interior as InteriorOutput;
}

export async function updateInterior(id: number, interiorData: Partial<InteriorInput>): Promise<InteriorOutput> {
  await requireAdmin();
  
  // Validation basique si fourni
  if (interiorData.title !== undefined && !interiorData.title?.trim()) {
    throw new Error('Le titre ne peut pas être vide');
  }
  
  if (interiorData.listImages !== undefined && !interiorData.listImages?.trim()) {
    throw new Error('L\'URL des images ne peut pas être vide');
  }
  
  // Vérifier que le type existe si fourni
  if (interiorData.typeId) {
    const typeExists = await prisma.typeInterior.findUnique({
      where: { id: interiorData.typeId }
    });
    
    if (!typeExists) {
      throw new Error('Type d\'intérieur invalide');
    }
  }
  
  const interior = await prisma.interior.update({
    where: { id },
    data: interiorData,
    include: {
      type: true
    }
  });
  
  return interior as InteriorOutput;
}

export async function deleteInterior(id: number): Promise<void> {
  await requireAdmin();
  
  await prisma.interior.delete({ where: { id } });
}
