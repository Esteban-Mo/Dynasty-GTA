import React, { useState, useRef, useEffect } from 'react';
import { FeatureGroup, Polygon, Tooltip, useMap } from 'react-leaflet';
import { EditControl } from "react-leaflet-draw";
import { LatLng, LeafletEvent, PathOptions, LatLngBounds } from 'leaflet';
import { createZone, ExtendedZone, getAllZones, ZoneInput } from '@/actions/db/zone.action';
import { useSearchParams } from 'next/navigation';
import { Switch, FormControlLabel } from '@mui/material';

interface Zone {
    id: number;
    name: string;
    coordinates: LatLng[];
    color: string;
}

interface LeafletZoneProps {
    onZonesChange: (zones: Zone[]) => void;
}

const LeafletZone: React.FC<LeafletZoneProps> = ({ onZonesChange }) => {
    const [zones, setZones] = useState<Zone[]>([]);
    const [currentZone, setCurrentZone] = useState<Zone | null>(null);
    const [zoneName, setZoneName] = useState<string>('');
    const [zoneColor, setZoneColor] = useState<string>('#3388ff');
    const [highlightedZoneId, setHighlightedZoneId] = useState<number | null>(null);
    const [showNames, setShowNames] = useState<boolean>(false);
    const featureGroupRef = useRef<L.FeatureGroup | null>(null);
    const [currentLayer, setCurrentLayer] = useState<L.Layer | null>(null);
    const searchParams = useSearchParams();
    const map = useMap();

    const isAdmin = searchParams.get('r') === 'nGsxvM4ABSbBg965e020rKwyWjG2n8nUJtBeTh9lxLrw0hAgx3';

    useEffect(() => {
        if (currentLayer && featureGroupRef.current) {
            (currentLayer as L.Path).setStyle({ color: zoneColor });
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

    useEffect(() => {
        void fetchZones();
    }, [fetchZones]);

    const handleCreated = (e: LeafletEvent) => {
        const layer = e.layer as L.Polygon;
        setCurrentLayer(layer);
        const newZone: Zone = {
            id: Date.now(),
            name: '',
            coordinates: layer.getLatLngs()[0] as LatLng[],
            color: zoneColor
        };
        setCurrentZone(newZone);
    };

    const handleEdited = (e: LeafletEvent) => {
        // @ts-ignore
        const layers = e.layers;
        // @ts-ignore
        layers.eachLayer((layer) => {
            if (currentZone) {
                setCurrentZone({
                    ...currentZone,
                    coordinates: (layer as L.Polygon).getLatLngs()[0] as LatLng[]
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

    const handleZoomToZone = (zone: Zone) => {
        // @ts-ignore
        const bounds = new LatLngBounds(zone.coordinates);
        map.fitBounds(bounds, { padding: [50, 50] });
    };

    const handleToggleNames = (event: React.ChangeEvent<HTMLInputElement>) => {
        setShowNames(event.target.checked);
    };

    return (
        <>
            {isAdmin && (
                <FeatureGroup ref={featureGroupRef}>
                    <EditControl
                        position="topleft"
                        onCreated={handleCreated}
                        onEdited={handleEdited}
                        draw={{
                            rectangle: false,
                            circle: false,
                            circlemarker: false,
                            marker: false,
                            polyline: false,
                            polygon: {
                                shapeOptions: {
                                    color: zoneColor
                                }
                            }
                        }}
                    />
                </FeatureGroup>
            )}
            {zones.map((zone) => (
                <Polygon
                    key={zone.id}
                    positions={zone.coordinates}
                    pathOptions={{
                        color: zone.color,
                        fillOpacity: highlightedZoneId === zone.id ? 0.8 : 0.6,
                        weight: highlightedZoneId === zone.id ? 3 : 2
                    } as PathOptions}
                >
                    {showNames && (
                        <Tooltip permanent direction="center" className="custom-tooltip">
                            <span style={{ color: 'black', textShadow: 'none', fontSize: '10px', fontWeight: 'bold' }}>{zone.name}</span>
                        </Tooltip>
                    )}
                </Polygon>
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
                        Sauvegarder
                    </button>
                </div>
            )}
            <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                backgroundColor: '#333333',
                padding: '10px',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                zIndex: 1000
            }}>
                <h3 style={{ marginBottom: '10px', fontWeight: 'bold', color: 'white' }}>Légende</h3>
                <FormControlLabel
                    control={
                        <Switch
                            checked={showNames}
                            onChange={handleToggleNames}
                            name="showNames"
                            color="primary"
                        />
                    }
                    label="Afficher les noms"
                    style={{ color: 'white', marginBottom: '10px' }}
                />
                {zones.map((zone) => (
                    <div
                        key={zone.id}
                        onMouseEnter={() => setHighlightedZoneId(zone.id)}
                        onMouseLeave={() => setHighlightedZoneId(null)}
                        onClick={() => handleZoomToZone(zone)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '5px',
                            cursor: 'pointer',
                            color: 'white'
                        }}
                    >
                        <div style={{
                            width: '20px',
                            height: '20px',
                            backgroundColor: zone.color,
                            marginRight: '10px',
                            border: '1px solid white'
                        }}></div>
                        <span>{zone.name}</span>
                    </div>
                ))}
            </div>
        </>
    );
};

export default LeafletZone;