"use server";

import { FAQ, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type ExtendedFAQ = FAQ;

export const getAllFAQs = async (): Promise<ExtendedFAQ[]> => {
    const faqs = await prisma.fAQ.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
    });

    return faqs as ExtendedFAQ[];
};