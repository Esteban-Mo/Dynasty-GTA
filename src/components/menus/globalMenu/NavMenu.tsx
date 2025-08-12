"use client";

import {
    House,
    Map,
    Image,
    Business,
    ContactMail,
    QuestionAnswer
} from '@mui/icons-material';
import {IconButton, Tooltip} from '@mui/material';
import {usePathname, useRouter} from 'next/navigation';
import {text} from '@/lib/text';
import { useState } from 'react';
import FAQModal from '@/components/modals/FAQModal';
import ContactModal from '@/components/modals/ContactModal';

const NavMenu = () => {
    const router = useRouter();
    const pathname = usePathname();
    const color = '#f4b53f'
    const [isFAQOpen, setIsFAQOpen] = useState(false);
    const [isContactOpen, setIsContactOpen] = useState(false);

    const tooltipStyles = {
        tooltip: {
            backgroundColor: '#1f1f1f',
            color: '#ffffff',
            fontSize: '14px',
            fontFamily: 'inherit',
            borderRadius: '8px',
            padding: '8px 12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            border: `1px solid ${color}`,
        },
        arrow: {
            color: '#1f1f1f',
            '&:before': {
                border: `1px solid ${color}`,
            }
        }
    };

    async function handleNavigation(path: string): Promise<void> {
        router.push(path);
    }

    return (
        <>
            <div className="fixed top-5 right-5 flex flex-col gap-4 opacity-90" style={{zIndex: 1000}}>
                <Tooltip 
                    title={text.global_menu.home} 
                    placement={"left"} 
                    arrow
                    componentsProps={{
                        tooltip: { sx: tooltipStyles.tooltip },
                        arrow: { sx: tooltipStyles.arrow }
                    }}
                >
                    <IconButton
                        sx={{color: pathname === '/' ? color : 'white'}}
                        onClick={() => handleNavigation('/')}>
                        <House fontSize={'medium'}/>
                    </IconButton>
                </Tooltip>

                <Tooltip 
                    title={text.global_menu.map} 
                    placement={"left"} 
                    arrow
                    componentsProps={{
                        tooltip: { sx: tooltipStyles.tooltip },
                        arrow: { sx: tooltipStyles.arrow }
                    }}
                >
                    <IconButton
                        sx={{color: pathname === '/quartiers' ? color : 'white'}}
                        onClick={() => handleNavigation('/quartiers')}>
                        <Map fontSize={'medium'}/>
                    </IconButton>
                </Tooltip>

                <Tooltip 
                    title={text.global_menu.interior} 
                    placement={"left"} 
                    arrow
                    componentsProps={{
                        tooltip: { sx: tooltipStyles.tooltip },
                        arrow: { sx: tooltipStyles.arrow }
                    }}
                >
                    <IconButton
                        sx={{color: pathname === '/galery' ? color : 'white'}}
                        onClick={() => handleNavigation('/galery?type=1')}>
                        {/* eslint-disable-next-line jsx-a11y/alt-text */}
                        <Image fontSize={'medium'}/>
                    </IconButton>
                </Tooltip>

                <Tooltip 
                    title={text.global_menu.pro_space} 
                    placement={"left"} 
                    arrow
                    componentsProps={{
                        tooltip: { sx: tooltipStyles.tooltip },
                        arrow: { sx: tooltipStyles.arrow }
                    }}
                >
                    <IconButton
                        sx={{color: pathname === '/espace-pro' ? color : 'white'}}
                        onClick={() => handleNavigation('/espace-pro')}>
                        <Business fontSize={'medium'}/>
                    </IconButton>
                </Tooltip>
            </div>

            {/* Boutons FAQ et Contact en bas */}
            <div className="fixed bottom-5 right-5 flex flex-col gap-3 opacity-90" style={{zIndex: 1000}}>
                <Tooltip 
                    title="Questions Fréquentes" 
                    placement={"left"} 
                    arrow
                    componentsProps={{
                        tooltip: { sx: tooltipStyles.tooltip },
                        arrow: { sx: tooltipStyles.arrow }
                    }}
                >
                    <IconButton
                        sx={{color: 'white', backgroundColor: 'rgba(244, 181, 63, 0.1)', '&:hover': { backgroundColor: 'rgba(244, 181, 63, 0.2)' }}}
                        onClick={() => setIsFAQOpen(true)}>
                        <QuestionAnswer fontSize={'medium'}/>
                    </IconButton>
                </Tooltip>

                <Tooltip 
                    title="Contact" 
                    placement={"left"} 
                    arrow
                    componentsProps={{
                        tooltip: { sx: tooltipStyles.tooltip },
                        arrow: { sx: tooltipStyles.arrow }
                    }}
                >
                    <IconButton
                        sx={{color: 'white', backgroundColor: 'rgba(244, 181, 63, 0.1)', '&:hover': { backgroundColor: 'rgba(244, 181, 63, 0.2)' }}}
                        onClick={() => setIsContactOpen(true)}>
                        <ContactMail fontSize={'medium'}/>
                    </IconButton>
                </Tooltip>
            </div>

            {/* Modals */}
            <FAQModal open={isFAQOpen} onClose={() => setIsFAQOpen(false)} />
            <ContactModal open={isContactOpen} onClose={() => setIsContactOpen(false)} />
        </>
    );
}

export default NavMenu;