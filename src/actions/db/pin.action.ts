"use server"

import { PrismaClient, Pin } from '@prisma/client';

const prisma = new PrismaClient();

export type PinInput = {
    lat: number;
    lng: number;
};

export type ExtendedPin = Pin;

export async function getAllPins(): Promise<ExtendedPin[]> {
    try {
        const pins = await prisma.pin.findMany();
        return pins;
    } catch (error) {
        console.error("Error fetching pins:", error);
        throw error;
    }
}

export async function createPin(pinData: PinInput): Promise<ExtendedPin> {
    try {
        const newPin = await prisma.pin.create({
            data: pinData
        });
        return newPin;
    } catch (error) {
        console.error("Error creating pin:", error);
        throw error;
    }
}