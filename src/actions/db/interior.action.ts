"use server";

import {Interior, PrismaClient, TypeInterior} from '@prisma/client';

const prisma = new PrismaClient();

export type ExtendedInterior = Omit<Interior, 'listImages'> & {
    type: TypeInterior;
    listImages: string[];
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
        interiors.map(async (interior): Promise<ExtendedInterior> => {
            let baseUrl: string;

            baseUrl = interior.listImages;

            const imageUrls = await fetchImageUrls(baseUrl);

            const {listImages, ...restInterior} = interior;

            return {
                ...restInterior,
                listImages: imageUrls,
            };
        })
    );
};