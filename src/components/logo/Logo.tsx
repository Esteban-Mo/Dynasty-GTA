import Image from 'next/image';
import {text} from '@/lib/text';

interface TextFooter {
    text: string;
}

export const Logo = () => {

    return (
        <div
            className="absolute top-1/2 left-1/2 transform z-10 w-5/6 sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-1/3 2xl:w-1/4 -translate-x-1/2 -translate-y-1/2 rounded-lg flex flex-col items-center h-60 sm:h-72 lg:h-80">
                <Image 
                    src={"/img/logo.webp"} 
                    alt="Logo" 
                    width={400}
                    height={300}
                    style={{height: "auto", width: '100%', padding: '20px'}}
                    className="p-4 sm:p-6 lg:p-8"
                />
            <div className="flex flex-row justify-center border-t border-amber-50"
                 style={{height: "15%", width: '100%', minWidth: '200px'}}>
                    <div style={{height: "100%", width: '100%'}} className="flex flex-col justify-center items-center">
                        <span className="text-sm sm:text-base lg:text-lg text-center text-white">
                            {text.logo_sub_text}
                        </span>
                    </div>
            </div>
        </div>
    )
}