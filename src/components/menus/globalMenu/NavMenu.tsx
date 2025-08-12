"use client";

import {
    House,
    Map,
    Image,
    Business,
    ContactMail,
    QuestionAnswer,
    Menu as MenuIcon,
    Close,
    Logout as LogoutIcon
} from '@mui/icons-material';
import {IconButton, Tooltip, Drawer, Divider} from '@mui/material';
import {usePathname, useRouter} from 'next/navigation';
import {text} from '@/lib/text';
import { useState, useEffect } from 'react';
import FAQModal from '@/components/modals/FAQModal';
import ContactModal from '@/components/modals/ContactModal';
import { signOut, useSession } from 'next-auth/react';

const NavMenu = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const color = '#f4b53f'
    const [isFAQOpen, setIsFAQOpen] = useState(false);
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

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

    // Détecter la taille d'écran
    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < 1000);
        };

        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);

        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

    async function handleNavigation(path: string): Promise<void> {
        router.push(path);
        setIsMobileMenuOpen(false); // Fermer le menu mobile après navigation
    }

    async function handleLogout(): Promise<void> {
        await signOut({ callbackUrl: '/' });
    }

    const menuItems = [
        { icon: House, label: text.global_menu.home, path: '/', current: pathname === '/' },
        { icon: Map, label: text.global_menu.map, path: '/quartiers', current: pathname === '/quartiers' },
        { icon: Image, label: text.global_menu.interior, path: '/galery?type=1', current: pathname === '/galery' },
        { icon: Business, label: text.global_menu.pro_space, path: '/pro', current: pathname === '/pro' }
    ];

    return (
        <>
            {/* Menu Desktop (>= 1000px) */}
            {!isMobile && (
                <>
                    <div className="fixed top-5 right-5 flex flex-col gap-4 opacity-90" style={{zIndex: 1000}}>
                        {menuItems.map((item, index) => {
                            const IconComponent = item.icon;
                            return (
                                <Tooltip 
                                    key={index}
                                    title={item.label} 
                                    placement={"left"} 
                                    arrow
                                    componentsProps={{
                                        tooltip: { sx: tooltipStyles.tooltip },
                                        arrow: { sx: tooltipStyles.arrow }
                                    }}
                                >
                                    <IconButton
                                        sx={{color: item.current ? color : 'white'}}
                                        onClick={() => handleNavigation(item.path)}>
                                        <IconComponent fontSize={'medium'}/>
                                    </IconButton>
                                </Tooltip>
                            );
                        })}

                        {/* Logout icon - uniquement si connecté */}
                        {session && status === "authenticated" && (
                            <>
                                <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
                                <Tooltip 
                                    title="Déconnexion" 
                                    placement={"left"} 
                                    arrow
                                    componentsProps={{
                                        tooltip: { sx: tooltipStyles.tooltip },
                                        arrow: { sx: tooltipStyles.arrow }
                                    }}
                                >
                                    <IconButton
                                        onClick={handleLogout}
                                        sx={{
                                            color: '#ef4444',
                                            '&:hover': { color: '#f87171' }
                                        }}
                                        aria-label="Déconnexion"
                                    >
                                        <LogoutIcon fontSize={'medium'} />
                                    </IconButton>
                                </Tooltip>
                            </>
                        )}
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
                </>
            )}

            {/* Menu Mobile (< 1000px) */}
            {isMobile && (
                <>
                    {/* Bouton Burger */}
                    <div className="fixed top-5 right-5 z-50">
                        <IconButton
                            onClick={() => setIsMobileMenuOpen(true)}
                            sx={{
                                color: 'white',
                                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                backdropFilter: 'blur(10px)',
                                border: `2px solid ${color}`,
                                borderRadius: '12px',
                                padding: '12px',
                                '&:hover': {
                                    backgroundColor: 'rgba(244, 181, 63, 0.2)',
                                    transform: 'scale(1.05)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <MenuIcon fontSize="large" />
                        </IconButton>
                    </div>

                    {/* Drawer Mobile */}
                    <Drawer
                        anchor="right"
                        open={isMobileMenuOpen}
                        onClose={() => setIsMobileMenuOpen(false)}
                        PaperProps={{
                            sx: {
                                backgroundColor: 'rgba(0, 0, 0, 0.95)',
                                backdropFilter: 'blur(20px)',
                                border: `1px solid ${color}`,
                                borderRadius: '20px 0 0 20px',
                                width: '280px',
                                padding: '20px'
                            }
                        }}
                    >
                        <div className="flex flex-col h-full">
                            {/* Header avec bouton close */}
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold text-white">Menu</h2>
                                <IconButton
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    sx={{ color: color }}
                                >
                                    <Close fontSize="large" />
                                </IconButton>
                            </div>

                            {/* Menu Items */}
                            <div className="flex flex-col space-y-4 mb-8">
                                {menuItems.map((item, index) => {
                                    const IconComponent = item.icon;
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => handleNavigation(item.path)}
                                            className={`flex items-center space-x-4 p-4 rounded-lg transition-all duration-300 ${
                                                item.current 
                                                    ? 'bg-amber-500/20 border border-amber-400' 
                                                    : 'bg-white/5 hover:bg-white/10 border border-transparent'
                                            }`}
                                        >
                                            <IconComponent 
                                                fontSize="medium" 
                                                sx={{ color: item.current ? color : 'white' }}
                                            />
                                            <span className={`text-lg font-medium ${
                                                item.current ? 'text-amber-400' : 'text-white'
                                            }`}>
                                                {item.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* FAQ et Contact */}
                            <div className="mt-auto space-y-3">
                                <div className="h-px bg-gray-600 my-4"></div>
                                
                                <button
                                    onClick={() => {
                                        setIsFAQOpen(true);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="flex items-center space-x-4 p-4 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 w-full transition-all"
                                >
                                    <QuestionAnswer sx={{ color: color }} />
                                    <span className="text-amber-400 font-medium">Questions Fréquentes</span>
                                </button>

                                <button
                                    onClick={() => {
                                        setIsContactOpen(true);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="flex items-center space-x-4 p-4 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 w-full transition-all"
                                >
                                    <ContactMail sx={{ color: color }} />
                                    <span className="text-amber-400 font-medium">Contact</span>
                                </button>

                                {/* Logout - uniquement si connecté */}
                                {session && status === "authenticated" && (
                                    <>
                                        <div className="h-px bg-gray-600 my-2"></div>
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="flex items-center space-x-4 p-4 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 w-full transition-all"
                                        >
                                            <LogoutIcon sx={{ color: '#ef4444' }} />
                                            <span className="text-red-400 font-medium">Déconnexion</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </Drawer>
                </>
            )}

            {/* Modals */}
            <FAQModal open={isFAQOpen} onClose={() => setIsFAQOpen(false)} />
            <ContactModal open={isContactOpen} onClose={() => setIsContactOpen(false)} />
        </>
    );
}

export default NavMenu;