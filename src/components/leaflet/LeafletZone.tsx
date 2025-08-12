import React, { useState, useRef, useEffect } from 'react';
import { FeatureGroup, Polygon, Tooltip, useMap, Marker } from 'react-leaflet';
import { EditControl } from "react-leaflet-draw";
import L, { LatLng, LeafletEvent, PathOptions, LatLngBounds, divIcon } from 'leaflet';
import { createZone, ExtendedZone, getAllZones, ZoneInput } from '@/actions/db/zone.action';
import { createPin, ExtendedPin, getAllPins, PinInput } from '@/actions/db/pin.action';
import { useSession } from 'next-auth/react';
import Diamond from '@mui/icons-material/Diamond';
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

const LeafletZone: React.FC<LeafletZoneProps> = ({ onZonesChange, onPinsChange }) => {
    const [zones, setZones] = useState<Zone[]>([]);
    const [pins, setPins] = useState<Pin[]>([]);
    const [currentZone, setCurrentZone] = useState<Zone | null>(null);
    const [currentPin, setCurrentPin] = useState<Pin | null>(null);
    const [zoneName, setZoneName] = useState<string>('');
    const [zoneColor, setZoneColor] = useState<string>('#3388ff');
    const [showNames, setShowNames] = useState<boolean>(true);
    const [showPins, setShowPins] = useState<boolean>(true);
    const featureGroupRef = useRef<L.FeatureGroup | null>(null);
    const [currentLayer, setCurrentLayer] = useState<L.Layer | null>(null);
    const map = useMap();
    const { data: session, status } = useSession();

    const isAdmin = session?.user?.role === 'ADMIN';

    const diamondIcon = createDiamondIcon();

    useEffect(() => {
        if (currentLayer && featureGroupRef.current) {
            if (currentLayer instanceof L.Path && typeof currentLayer.setStyle === 'function') {
                currentLayer.setStyle({ color: zoneColor });
            }
        }
    }, [zoneColor, currentLayer]);

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
                lng: pin.lng
            }));
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
        if (currentZone && zoneName) {
            try {
                const zoneInput: ZoneInput = {
                    name: zoneName,
                    coordinates: currentZone.coordinates.map(coord => ({ lat: coord.lat, lng: coord.lng })),
                    color: zoneColor
                };
                const savedZone = await createZone(zoneInput);
                const newZone: Zone = {
                    id: savedZone.id,
                    name: savedZone.name,
                    coordinates: (savedZone.coordinates as { lat: number; lng: number }[]).map(coord => new LatLng(coord.lat, coord.lng)),
                    color: savedZone.color
                };
                const newZones = [...zones, newZone];
                setZones(newZones);
                setCurrentZone(null);
                setZoneName('');
                setCurrentLayer(null);

                if (featureGroupRef.current) {
                    featureGroupRef.current.clearLayers();
                }

                onZonesChange(newZones);
            } catch (error) {
                console.error("Erreur lors de la sauvegarde de la zone:", error);
            }
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
        }
    };

    return (
        <>
            {isAdmin && (
                <FeatureGroup ref={featureGroupRef}>
                    {/* @ts-ignore */}
                    <EditControl
                        {...editControlOptions}
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
                >
                    {showNames && (
                        <Tooltip permanent direction="center" className="custom-tooltip">
                            <span style={{ color: 'black', textShadow: 'none', fontSize: '10px', fontWeight: 'bold' }}>{zone.name}</span>
                        </Tooltip>
                    )}
                </Polygon>
            ))}
            {showPins && pins.map((pin) => (
                <Marker
                    key={pin.id}
                    position={[pin.lat, pin.lng]}
                    icon={diamondIcon}
                />
            ))}
            {isAdmin && (
                <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'white',
                    padding: '10px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    zIndex: 1000
                }}>
                    {currentZone && (
                        <>
                            <input
                                type="text"
                                value={zoneName}
                                onChange={handleZoneNameChange}
                                placeholder="Nom de la zone"
                                style={{
                                    padding: '8px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    flex: 1,
                                    color: '#333'
                                }}
                            />
                            <input
                                type="color"
                                value={zoneColor}
                                onChange={handleZoneColorChange}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    padding: '0',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            />
                            <button
                                onClick={saveZone}
                                disabled={!currentZone || !zoneName}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: (!currentZone || !zoneName) ? '#ddd' : '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: (!currentZone || !zoneName) ? 'not-allowed' : 'pointer'
                                }}
                            >
                                Sauvegarder la zone
                            </button>
                        </>
                    )}
                    {currentPin && (
                        <button
                            onClick={savePin}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Sauvegarder le pin
                        </button>
                    )}
                </div>
            )}

            <style jsx global>{`
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