import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ExtendedInterior, getAllInteriors } from '@/actions/db/interior.action';
import { InteriorCard } from './InteriorCard';
import CircularLoader from '@/components/loaders/CircularLoader';

export const InteriorCards: React.FC = () => {
    const [interiors, setInteriors] = useState<ExtendedInterior[]>([]);
    const [_, setLoading] = useState<boolean>(true);
    const [showLoader, setShowLoader] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const searchParams = useSearchParams();

    useEffect(() => {
        const fetchInteriors = async () => {
            setShowLoader(true);
            setLoading(true);
            setError(null);
            try {
                const typeIdParam = searchParams.get('type');
                const typeId = typeIdParam ? parseInt(typeIdParam, 10) : undefined;
                const fetchedInteriors = await getAllInteriors(typeId);
                // Filter out interiors where displayed is false
                const displayedInteriors = fetchedInteriors.filter(interior => interior.displayed);
                setInteriors(displayedInteriors);
            } catch (err) {
                console.error('Error fetching interiors:', err);
                setError('Failed to load interiors. Please try again later.');
            } finally {
                setLoading(false);
                // Gardez le loader affiché pendant au moins 1 seconde
                setTimeout(() => {
                    setShowLoader(false);
                }, 1000);
            }
        };

        void fetchInteriors();
    }, [searchParams]);

    if (showLoader) {
        return (
            <div className="flex justify-center items-center h-screen">
                <CircularLoader />
            </div>
        );
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
    }

    if (interiors.length === 0) {
        return <div className="flex justify-center items-center h-screen">No interiors found for this type.</div>;
    }

    return (
        <div className="flex flex-col gap-20 py-10">
            {interiors.map((interior) => (
                <InteriorCard key={interior.id} data={interior} />
            ))}
        </div>
    );
};

export default InteriorCards;