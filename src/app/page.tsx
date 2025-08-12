"use client"

import {BackgroundBeams} from '@/components/ui/background-beams';
import {Logo} from '@/components/logo/Logo';

export default function Home() {
    return (
        <div className="h-full w-full" style={{overflow: 'hidden'}}>
            <Logo/>

            <video
                autoPlay
                muted
                loop
                className="absolute z-0 top-0 left-0 w-full h-full object-cover opacity-50 blur-lg"
            >
                <source src={"./videos/vidbg.mp4"} type="video/mp4"/>
            </video>

            <BackgroundBeams className="absolute inset-0"/>
        </div>
    );
}
