"use server"

import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export type PinTypeDB = 'DEFAULT' | 'PRESTIGE' | 'UNAVAILABLE';

export type PinInput = {
    lat: number;
    lng: number;
    type?: PinTypeDB;
};

export type ExtendedPin = {
    id: number;
    lat: number;
    lng: number;
    type?: PinTypeDB;
    createdAt?: Date;
    updatedAt?: Date;
};

export async function getAllPins(): Promise<ExtendedPin[]> {
    try {
        const pins = await prisma.pin.findMany();
        return pins as unknown as ExtendedPin[];
    } catch (error) {
        console.error("Error fetching pins:", error);
        throw error;
    }
}

export async function createPin(pinData: PinInput): Promise<ExtendedPin> {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') throw new Error('UNAUTHORIZED');
        const newPin = await prisma.pin.create({
            data: pinData as any,
        });
        return newPin as unknown as ExtendedPin;
    } catch (error) {
        console.error("Error creating pin:", error);
        throw error;
    }
}

export async function deletePin(id: number): Promise<void> {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') throw new Error('UNAUTHORIZED');
        await prisma.pin.delete({ where: { id } });
    } catch (error) {
        console.error("Error deleting pin:", error);
        throw error;
    }
}

export async function updatePinType(id: number, type: PinTypeDB): Promise<ExtendedPin> {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') throw new Error('UNAUTHORIZED');
        const p = await prisma.pin.update({ where: { id }, data: { type } });
        return p as unknown as ExtendedPin;
    } catch (error) {
        console.error("Error updating pin type:", error);
        throw error;
    }
}