"use server";

import { Interior, PrismaClient, TypeInterior, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export type ExtendedInterior = Omit<Interior, 'listImages'> & {
    type: TypeInterior;
    listImages: Prisma.JsonValue;
};

export const getAllInteriors = async (typeId?: number): Promise<ExtendedInterior[]> => {
    const interiors = await prisma.interior.findMany({
        where: typeId ? { typeId: typeId } : undefined,
        include: {
            type: true,
        },
    });

    return interiors as ExtendedInterior[];
};