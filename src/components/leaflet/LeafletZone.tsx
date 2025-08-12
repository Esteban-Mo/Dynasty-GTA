import React, { useState, useRef, useEffect } from 'react';
import { FeatureGroup, Polygon, Tooltip, useMap, Marker } from 'react-leaflet';
import { EditControl } from "react-leaflet-draw";
import L, { LatLng, LeafletEvent, PathOptions, divIcon } from 'leaflet';
import { createZone, ExtendedZone, getAllZones, ZoneInput, deleteZone, updateZone } from '@/actions/db/zone.action';
import { createPin, ExtendedPin, getAllPins, PinInput, deletePin, updatePinType } from '@/actions/db/pin.action';
import { useSession } from 'next-auth/react';
import Diamond from '@mui/icons-material/Diamond';
import CloseIcon from '@mui/icons-material/Close';
import { renderToString } from 'react-dom/server';

interface Zone {
    id: number;
    name: string;
    coordinates: LatLng[];
    color: string;
}

interface Pin {
    id: number;
    lat: number;
    lng: number;
}

interface LeafletZoneProps {
    onZonesChange: (zones: Zone[]) => void;
    onPinsChange: (pins: Pin[]) => void;
}

type PinType = 'DEFAULT' | 'PRESTIGE' | 'UNAVAILABLE';

const createDiamondIcon = () => {
    const iconHtml = renderToString(
        <Diamond style={{
            color: '#29c9ce',
            fontSize: '24px',
            filter: 'drop-shadow(3px 3px 2px rgba(0,0,0,0.7))',
        }} />
    );
    return divIcon({
        html: iconHtml,
        className: 'diamond-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });
};

const createCrossIcon = () => {
    const iconHtml = renderToString(
        <CloseIcon style={{
            color: '#ef4444',
            fontSize: '24px',
            filter: 'drop-shadow(3px 3px 2px rgba(0,0,0,0.7))',
            fontWeight: 800,
        }} />
    );
    return divIcon({
        html: iconHtml,
        className: 'diamond-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });
};

const LeafletZone: React.FC<LeafletZoneProps> = ({ onZonesChange, onPinsChange }) => {
    const [zones, setZones] = useState<Zone[]>([]);
    const [pins, setPins] = useState<Pin[]>([]);
    const [currentZone, setCurrentZone] = useState<Zone | null>(null);
    const [currentPin, setCurrentPin] = useState<Pin | null>(null);
    const [zoneName, setZoneName] = useState<string>('');
    const [zoneColor, setZoneColor] = useState<string>('#3388ff');
    const [showNames, setShowNames] = useState<boolean>(true);
    const [showPins, setShowPins] = useState<boolean>(true);
    const [pinTypeById, setPinTypeById] = useState<Record<number, PinType>>({});
    const featureGroupRef = useRef<L.FeatureGroup | null>(null);
    const [currentLayer, setCurrentLayer] = useState<L.Layer | null>(null);
    const map = useMap();
    const { data: session, status } = useSession();

    const isAdmin = session?.user?.role === 'ADMIN';

    const diamondIcon = createDiamondIcon();
    const crossIcon = createCrossIcon();

    useEffect(() => {
        if (currentLayer && featureGroupRef.current) {
            if (currentLayer instanceof L.Path && typeof currentLayer.setStyle === 'function') {
                currentLayer.setStyle({ color: zoneColor });
            }
        }
    }, [zoneColor, currentLayer]);

    // Types des pins désormais chargés depuis la BDD via getAllPins

    const fetchZones = async () => {
        try {
            const fetchedZones = await getAllZones();
            const formattedZones: Zone[] = fetchedZones.map((zone: ExtendedZone) => ({
                id: zone.id,
                name: zone.name,
                coordinates: (zone.coordinates as { lat: number; lng: number }[]).map(coord => new LatLng(coord.lat, coord.lng)),
                color: zone.color
            }));
            setZones(formattedZones);
            onZonesChange(formattedZones);
        } catch (error) {
            console.error("Erreur lors de la récupération des zones:", error);
        }
    };

    const fetchPins = async () => {
        try {
            const fetchedPins = await getAllPins();
            const formattedPins: Pin[] = fetchedPins.map((pin: ExtendedPin) => ({
                id: pin.id,
                lat: pin.lat,
                lng: pin.lng,
            }));
            // hydrate types into local state map for rendering
            const typeMap: Record<number, PinType> = {};
            for (const p of fetchedPins as unknown as Array<ExtendedPin & { type?: PinType }>) {
                typeMap[p.id] = (p as any).type ?? 'DEFAULT';
            }
            setPinTypeById(typeMap);
            setPins(formattedPins);
            onPinsChange(formattedPins);
        } catch (error) {
            console.error("Erreur lors de la récupération des pins:", error);
        }
    };

    useEffect(() => {
        void fetchZones();
        void fetchPins();
    }, []);

    const handleCreated = (e: LeafletEvent) => {
        const layer = e.layer;
        setCurrentLayer(layer);

        if (layer instanceof L.Polygon) {
            const newZone: Zone = {
                id: Date.now(),
                name: '',
                coordinates: layer.getLatLngs()[0] as LatLng[],
                color: zoneColor
            };
            setCurrentZone(newZone);
        } else if (layer instanceof L.Marker) {
            const latlng = layer.getLatLng();
            const newPin: Pin = {
                id: Date.now(),
                lat: latlng.lat,
                lng: latlng.lng
            };
            setCurrentPin(newPin);
        }
    };

    const handleEdited = (e: LeafletEvent) => {
        const layers = e.layer;
        layers.eachLayer((layer: L.Layer) => {
            if (layer instanceof L.Polygon && currentZone) {
                setCurrentZone({
                    ...currentZone,
                    coordinates: (layer as L.Polygon).getLatLngs()[0] as LatLng[]
                });
            } else if (layer instanceof L.Marker && currentPin) {
                const latlng = layer.getLatLng();
                setCurrentPin({
                    ...currentPin,
                    lat: latlng.lat,
                    lng: latlng.lng
                });
            }
        });
    };

    const handleZoneNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setZoneName(e.target.value);
    };

    const handleZoneColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setZoneColor(e.target.value);
        if (currentZone) {
            setCurrentZone({ ...currentZone, color: e.target.value });
        }
    };

    const saveZone = async () => {
        if (!currentZone || !zoneName) return;
        try {
            const exists = zones.some(z => z.id === currentZone.id);
            if (exists) {
                // Update existing
                const updated = await updateZone(currentZone.id, {
                    name: zoneName,
                    color: zoneColor,
                    // keep coordinates as-is unless a new drawing layer is active
                    coordinates: currentZone.coordinates.map(coord => ({ lat: coord.lat, lng: coord.lng })),
                });
                const updatedZone: Zone = {
                    id: updated.id,
                    name: updated.name,
                    coordinates: (updated.coordinates as { lat: number; lng: number }[]).map(coord => new LatLng(coord.lat, coord.lng)),
                    color: updated.color,
                };
                const newZones = zones.map(z => (z.id === updatedZone.id ? updatedZone : z));
                setZones(newZones);
                onZonesChange(newZones);
            } else {
                // Create new
                const zoneInput: ZoneInput = {
                    name: zoneName,
                    coordinates: currentZone.coordinates.map(coord => ({ lat: coord.lat, lng: coord.lng })),
                    color: zoneColor,
                };
                const savedZone = await createZone(zoneInput);
                const newZone: Zone = {
                    id: savedZone.id,
                    name: savedZone.name,
                    coordinates: (savedZone.coordinates as { lat: number; lng: number }[]).map(coord => new LatLng(coord.lat, coord.lng)),
                    color: savedZone.color,
                };
                const newZones = [...zones, newZone];
                setZones(newZones);
                onZonesChange(newZones);
            }

            setCurrentZone(null);
            setZoneName('');
            setCurrentLayer(null);
            if (featureGroupRef.current) {
                featureGroupRef.current.clearLayers();
            }
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de la zone:', error);
        }
    };

    const savePin = async () => {
        if (currentPin) {
            try {
                const pinInput: PinInput = {
                    lat: currentPin.lat,
                    lng: currentPin.lng
                };
                const savedPin = await createPin(pinInput);
                const newPin: Pin = {
                    id: savedPin.id,
                    lat: savedPin.lat,
                    lng: savedPin.lng
                };
                const newPins = [...pins, newPin];
                setPins(newPins);
                setCurrentPin(null);
                setCurrentLayer(null);

                if (featureGroupRef.current) {
                    featureGroupRef.current.clearLayers();
                }

                onPinsChange(newPins);
            } catch (error) {
                console.error("Erreur lors de la sauvegarde du pin:", error);
            }
        }
    };

    const handleDeleteZone = async () => {
        if (!currentZone) return;
        try {
            await deleteZone(currentZone.id);
            const remaining = zones.filter(z => z.id !== currentZone.id);
            setZones(remaining);
            setCurrentZone(null);
            onZonesChange(remaining);
        } catch (e) {
            console.error('Erreur suppression zone:', e);
        }
    };

    const handleDeletePin = async () => {
        if (!currentPin) return;
        try {
            await deletePin(currentPin.id);
            const remaining = pins.filter(p => p.id !== currentPin.id);
            setPins(remaining);
            setCurrentPin(null);
            onPinsChange(remaining);
        } catch (e) {
            console.error('Erreur suppression pin:', e);
        }
    };

    const setPinType = (id: number, type: PinType) => {
        setPinTypeById(prev => ({ ...prev, [id]: type }));
    };



    const editControlOptions = {
        position: 'topleft',
        draw: {
            rectangle: false,
            circle: false,
            circlemarker: false,
            marker: {
                icon: diamondIcon
            },
            polyline: false,
            polygon: {
                shapeOptions: {
                    color: zoneColor
                }
            }
        },
    } as const;

    return (
        <>
            {isAdmin && (
                <FeatureGroup ref={featureGroupRef}>
                    {/* @ts-ignore */}
                    <EditControl
                        position={editControlOptions.position}
                        draw={editControlOptions.draw}
                        edit={{ edit: false, remove: false }}
                        onCreated={handleCreated}
                        onEdited={handleEdited}
                    />
                </FeatureGroup>
            )}
            {zones.map((zone) => (
                <Polygon
                    key={zone.id}
                    positions={zone.coordinates}
                    pathOptions={{
                        color: zone.color,
                        fillOpacity: 0.6,
                        weight: 2
                    } as PathOptions}
                    eventHandlers={isAdmin ? {
                        click: (e: any) => {
                            setCurrentZone(zone);
                            setZoneName(zone.name);
                            setZoneColor(zone.color);
                            setCurrentLayer(e.target as any);
                        }
                    } : undefined}
                >
                    {showNames && (
                        <Tooltip permanent direction="center" className="custom-tooltip">
                            <span style={{ color: 'black', textShadow: 'none', fontSize: '10px', fontWeight: 'bold' }}>{zone.name}</span>
                        </Tooltip>
                    )}
                </Polygon>
            ))}
            {showPins && pins.map((pin) => {
                const t = pinTypeById[pin.id] ?? 'DEFAULT';
                const icon = t === 'UNAVAILABLE' ? crossIcon : diamondIcon;
                return (
                    <Marker
                        key={pin.id}
                        position={[pin.lat, pin.lng]}
                        icon={icon}
                        eventHandlers={isAdmin ? {
                            click: () => setCurrentPin(pin)
                        } : undefined}
                    />
                );
            })}
            {isAdmin && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[3000] w-[95vw] max-w-3xl">
                    {(currentZone || currentPin) && (
                        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 bg-black/70 backdrop-blur-md border border-amber-400/40 rounded-xl px-4 py-3">
                            {currentZone && (
                                <>
                                    <input
                                        type="text"
                                        value={zoneName}
                                        onChange={handleZoneNameChange}
                                        placeholder="Nom de la zone"
                                        className="px-3 py-2 rounded-md bg-black/50 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-400 w-full sm:w-auto"
                                    />
                                    <input
                                        type="color"
                                        value={zoneColor}
                                        onChange={handleZoneColorChange}
                                        className="w-10 h-10 rounded-md cursor-pointer border border-gray-600 bg-transparent flex-shrink-0"
                                    />
                                    <button
                                        onClick={saveZone}
                                        disabled={!currentZone || !zoneName}
                                        className={`px-4 py-2 rounded-md text-white w-full sm:w-auto ${(!currentZone || !zoneName) ? 'bg-gray-600 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-500'}`}
                                    >
                                        Sauvegarder
                                    </button>
                                    <button
                                        onClick={handleDeleteZone}
                                        className="px-3 py-2 rounded-md text-white bg-red-600 hover:bg-red-500 w-full sm:w-auto"
                                    >
                                        Supprimer
                                    </button>
                                </>
                            )}
                            {currentPin && (
                                <>
                                    <button
                                        onClick={handleDeletePin}
                                        className="px-3 py-2 rounded-md text-white bg-red-600 hover:bg-red-500 w-full sm:w-auto"
                                    >
                                        Supprimer le pin
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white/80 text-sm">Type:</span>
                                        <button
                                            onClick={async () => {
                                                const next: PinType = 'PRESTIGE';
                                                setPinType(currentPin.id, next);
                                                await updatePinType(currentPin.id, next as any);
                                            }}
                                            className={`px-3 py-1 rounded-md border w-full sm:w-auto ${ (pinTypeById[currentPin.id] ?? 'DEFAULT') === 'PRESTIGE' ? 'border-amber-400 text-amber-300' : 'border-gray-600 text-white/80'}`}
                                        >Diamant</button>
                                        <button
                                            onClick={async () => {
                                                const next: PinType = 'UNAVAILABLE';
                                                setPinType(currentPin.id, next);
                                                await updatePinType(currentPin.id, next as any);
                                            }}
                                            className={`px-3 py-1 rounded-md border w-full sm:w-auto ${ (pinTypeById[currentPin.id] ?? 'DEFAULT') === 'UNAVAILABLE' ? 'border-red-400 text-red-300' : 'border-gray-600 text-white/80'}`}
                                        >Croix rouge</button>
                                    </div>
                                </>
                            )}
                            <button
                                onClick={() => { setCurrentZone(null); setCurrentPin(null); }}
                                className="px-3 py-2 rounded-md text-white bg-gray-700 hover:bg-gray-600 w-full sm:w-auto"
                            >
                                Fermer
                            </button>
                        </div>
                    )}
                </div>
            )}

            <style jsx global>{`
                /* Toolbar minimaliste: uniquement l'icône, pas de box ni contour */
                .leaflet-bar,
                .leaflet-draw-toolbar {
                    background-color: transparent !important;
                    box-shadow: none !important;
                    border: none !important;
                }
                .leaflet-bar a,
                .leaflet-bar a:hover,
                .leaflet-draw-toolbar a,
                .leaflet-draw-toolbar a:hover {
                    background-color: transparent !important; /* ne pas utiliser 'background' pour ne pas effacer le sprite */
                    border: none !important;
                    box-shadow: none !important;
                }
                /* Icônes: garder le sprite, juste atténuer */
                .leaflet-draw-toolbar a {
                    width: 30px;
                    height: 30px;
                    opacity: 0.8;
                }
                .leaflet-draw-toolbar a:hover {
                    transform: scale(1.06);
                    opacity: 1;
                }
                .diamond-icon {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    overflow: visible !important;
                }
                .diamond-icon > svg {
                    overflow: visible;
                }
            `}</style>
        </>
    );
};

export default LeafletZone;