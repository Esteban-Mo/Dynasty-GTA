"use server";

import {PrismaClient, TypeInterior} from '@prisma/client';

const prisma = new PrismaClient();

export const getAllTypeInteriors = async (): Promise<TypeInterior[]> => {
    try {
        return await prisma.typeInterior.findMany({
            orderBy: {
                order: 'asc'
            }
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des types d'intérieur:", error);
        throw error;
    }
};