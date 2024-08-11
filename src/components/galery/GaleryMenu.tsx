"use client";

import React, { useState, useEffect } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { TypeInterior } from '@prisma/client';
import { getAllTypeInteriors } from '@/actions/db/typeInterior.action';
import * as MuiIcons from '@mui/icons-material';

interface Button {
    tooltip: string;
    icon: JSX.Element;
    id: number;
}

const GaleryMenu: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [buttons, setButtons] = useState<Button[]>([]);

    useEffect(() => {
        const fetchTypeInteriors = async () => {
            try {
                const typeInteriors = await getAllTypeInteriors();
                const newButtons = typeInteriors.map((type: TypeInterior) => {
                    // @ts-ignore
                    const IconComponent = MuiIcons[type.icon] || MuiIcons.House;
                    return {
                        tooltip: type.name,
                        icon: <IconComponent fontSize={'medium'} />,
                        id: type.id
                    };
                });
                setButtons(newButtons);
            } catch (error) {
                console.error("Erreur lors de la récupération des types d'intérieur:", error);
            }
        };

        void fetchTypeInteriors();
    }, []);

    const handleClick = (id: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('type', id.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    const currentTypeId = searchParams.get('type');

    return (
        <div className="fixed top-5 left-5 flex flex-col gap-4 opacity-90" style={{zIndex: 1000}}>
            {buttons.map((button: Button) => (
                <Tooltip key={button.id}
                         title={button.tooltip}
                         placement={'left'} arrow
                         onClick={() => handleClick(button.id)}>
                    <IconButton sx={{color: currentTypeId === button.id.toString() ? '#dd3955' : 'white'}}>
                        {button.icon}
                    </IconButton>
                </Tooltip>
            ))}
        </div>
    );
};

export default GaleryMenu;