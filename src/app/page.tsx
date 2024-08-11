import {BackgroundBeams} from '@/components/ui/background-beams';
import {Logo} from '@/components/logo/Logo';
import {AnimatedTooltip} from '@/components/ui/animated-tooltip';

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

            <div style={{display: 'flex', position: "absolute", bottom: 40, right: 65, flexDirection: 'row', gap: '10px', opacity: '0.4', justifyContent: 'center', alignItems: 'center'}}>
                <AnimatedTooltip items={[
                    {
                        id: 1,
                        name: "Pitirenard",
                        designation: "Développeur",
                        image: "/img/pitirenard.png"
                    }
                ]}/>
            </div>
        </div>
    );
}
