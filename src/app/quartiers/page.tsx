"use client"

import React, {useState, useEffect} from 'react';
import CircularLoader from '@/components/loaders/CircularLoader';
import Leaflet from '@/components/leaflet/Leaflet';

export default function Home() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="h-full w-full">
            {isLoading ? (
                <CircularLoader/>
            ) : (
                <Leaflet/>
            )}
        </div>
    );
}