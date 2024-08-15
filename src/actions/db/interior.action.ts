"use server";

import {Interior, PrismaClient, TypeInterior} from '@prisma/client';

const prisma = new PrismaClient();

export type ExtendedInterior = Interior & {
    type: TypeInterior;
};

async function fetchImageUrls(baseUrl: string): Promise<string[]> {
    const imageUrls: string[] = [];
    let index = 1;

    while (true) {
        const imageUrl = `${baseUrl}${index}.jpg`;
        try {
            const response = await fetch(imageUrl, { method: 'HEAD' });
            if (response.ok) {
                imageUrls.push(imageUrl);
                index++;
            } else {
                break;
            }
        } catch (error) {
            console.error(`Error checking image ${imageUrl}:`, error);
            break;
        }
    }

    return imageUrls;
}

export const getAllInteriors = async (typeId?: number): Promise<ExtendedInterior[]> => {
    const interiors = await prisma.interior.findMany({
        where: typeId ? { typeId: typeId } : undefined,
        include: {
            type: true,
        },
    });

    return await Promise.all(
        interiors.map(async (interior) => {
            const baseUrl = interior.listImages as string;
            const imageUrls = await fetchImageUrls(baseUrl);
            return {
                ...interior,
                listImages: imageUrls,
            } as ExtendedInterior;
        })
    );
};