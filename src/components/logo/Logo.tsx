import Image from 'next/image';
import {text} from '@/lib/text';

interface TextFooter {
    text: string;
}

export const Logo = () => {

    return (
        <div
            className="absolute top-1/2 left-1/2 transform z-10 w-1/4 -translate-x-1/2 -translate-y-1/2 rounded-lg flex flex-col items-center h-80">
                <Image 
                    src={"/img/logo.webp"} 
                    alt="Logo" 
                    width={400}
                    height={300}
                    style={{height: "auto", width: '100%', padding: '30px'}}
                />
            <div className="flex flex-row justify-center border-t border-amber-50"
                 style={{height: "15%", width: '100%', minWidth: '250px'}}>
                    <div style={{height: "100%", width: '100%'}} className="flex flex-col justify-center items-center">
                        {text.logo_sub_text}
                    </div>
            </div>
        </div>
    )
}