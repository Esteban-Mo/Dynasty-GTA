"use client";

import {
    House,
    Map,
    Image
} from '@mui/icons-material';
import {IconButton, Tooltip} from '@mui/material';
import {usePathname, useRouter} from 'next/navigation';
import {text} from '@/lib/text';

const NavMenu = () => {
    const router = useRouter();
    const pathname = usePathname();
    const color = '#f4b53f'

    async function handleNavigation(path: string): Promise<void> {
        router.push(path);
    }

    return (
        <>
            <div className="fixed top-5 right-5 flex flex-col gap-4 opacity-90" style={{zIndex: 1000}}>
                <Tooltip title={text.global_menu.home} placement={"left"} arrow>
                    <IconButton
                        sx={{color: pathname === '/' ? color : 'white'}}
                        onClick={() => handleNavigation('/')}>
                        <House fontSize={'medium'}/>
                    </IconButton>
                </Tooltip>

                <Tooltip title={text.global_menu.map} placement={"left"} arrow>
                    <IconButton
                        sx={{color: pathname === '/quartiers' ? color : 'white'}}
                        onClick={() => handleNavigation('/quartiers')}>
                        <Map fontSize={'medium'}/>
                    </IconButton>
                </Tooltip>

                <Tooltip title={text.global_menu.interior} placement={"left"} arrow>
                    <IconButton
                        sx={{color: pathname === '/interior' ? color : 'white'}}
                        onClick={() => handleNavigation('/interior')}>
                        <Image fontSize={'medium'}/>
                    </IconButton>
                </Tooltip>
            </div>
        </>
    );
}

export default NavMenu;