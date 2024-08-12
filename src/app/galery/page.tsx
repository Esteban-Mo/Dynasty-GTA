"use client"

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import CircularLoader from '@/components/loaders/CircularLoader';

// Chargement dynamique de GaleryMenu
const DynamicGaleryMenu = dynamic(() => import('@/components/galery/GaleryMenu'), {
    ssr: false,
    loading: () => <CircularLoader />
});

// Chargement dynamique de InteriorCards
const DynamicInteriorCards = dynamic(() => import('@/components/galery/InteriorCards'), {
    ssr: false,
    loading: () => <CircularLoader />
});

export default function Home() {
    return (
        <div className="h-full w-full">
            <Suspense fallback={<CircularLoader />}>
                <DynamicGaleryMenu />
            </Suspense>
            <Suspense fallback={<CircularLoader />}>
                <DynamicInteriorCards />
            </Suspense>
        </div>
    );
}