"use client"

import React, { useState, useEffect, Suspense } from 'react';
import CircularLoader from '@/components/loaders/CircularLoader';

// Hook personnalisé pour détecter si nous sommes dans un navigateur
const useIsBrowser = () => {
    const [isBrowser, setIsBrowser] = useState(false);
    useEffect(() => {
        setIsBrowser(true);
    }, []);
    return isBrowser;
};

// Composant Leaflet chargé dynamiquement
const DynamicLeaflet = React.lazy(() => import('@/components/leaflet/Leaflet'));

export default function Home() {
    const [isLoading, setIsLoading] = useState(true);
    const isBrowser = useIsBrowser();

    useEffect(() => {
        if (isBrowser) {
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [isBrowser]);

    if (!isBrowser) {
        return null; // ou un placeholder pour le rendu côté serveur
    }

    return (
        <div className="h-full w-full">
            {isLoading ? (
                <CircularLoader/>
            ) : (
                <Suspense fallback={<CircularLoader/>}>
                    <DynamicLeaflet/>
                </Suspense>
            )}
        </div>
    );
}