"use server";

import { PrismaClient, Zone, Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export type ExtendedZone = Omit<Zone, 'coordinates'> & {
    coordinates: Prisma.JsonValue;
};

export type ZoneInput = Omit<ExtendedZone, 'id' | 'createdAt' | 'updatedAt'> & {
    coordinates: Prisma.InputJsonValue;
};

export const getAllZones = async (): Promise<ExtendedZone[]> => {
    const zones = await prisma.zone.findMany();
    return zones as ExtendedZone[];
};

export const createZone = async (zoneData: ZoneInput): Promise<ExtendedZone> => {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') throw new Error('UNAUTHORIZED');
    const newZone = await prisma.zone.create({
        data: {
            name: zoneData.name,
            coordinates: zoneData.coordinates,
            color: zoneData.color,
        },
    });
    return newZone as ExtendedZone;
};

export const deleteZone = async (id: number): Promise<void> => {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') throw new Error('UNAUTHORIZED');
    await prisma.zone.delete({ where: { id } });
};

export const updateZone = async (
    id: number,
    data: { name?: string; color?: string; coordinates?: Prisma.InputJsonValue }
): Promise<ExtendedZone> => {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') throw new Error('UNAUTHORIZED');
    const updated = await prisma.zone.update({
        where: { id },
        data,
    });
    return updated as ExtendedZone;
};