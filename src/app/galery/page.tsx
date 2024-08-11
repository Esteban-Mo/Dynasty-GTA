"use client"


import InteriorCards from '@/components/galery/InteriorCards';
import GaleryMenu from '@/components/galery/GaleryMenu';

export default function Home() {
    return (
        <div className="h-full w-full">
            <GaleryMenu/>
            <InteriorCards/>
        </div>
    );
}