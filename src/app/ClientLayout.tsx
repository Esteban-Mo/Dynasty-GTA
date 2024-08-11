"use client";

import { ReactNode } from 'react';
import NavMenu from '@/components/menus/globalMenu/NavMenu';

export default function ClientLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <NavMenu />
            {children}
        </>
    );
}