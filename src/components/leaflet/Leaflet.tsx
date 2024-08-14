import React from 'react';
import { MapContainer, ImageOverlay } from 'react-leaflet';
import LeafletZone from './LeafletZone';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

interface Zone {
    id: number;
    name: string;
    coordinates: L.LatLng[];
    color: string;
}

interface Pin {
    id: number;
    lat: number;
    lng: number;
}

const Leaflet: React.FC = () => {
    const handleZonesChange = (newZones: Zone[]) => {
        console.log(JSON.stringify(newZones));
    };

    const handlePinsChange = (newPins: Pin[]) => {
        console.log(JSON.stringify(newPins));
    };

    return (
        <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
            <MapContainer
                style={{ height: '100%', width: '100%', backgroundColor: '#0fa8d2' }}
                center={[65, 85]}
                zoom={3}
                maxZoom={6}
                attributionControl={false}
                doubleClickZoom={false}
                zoomControl={false}
            >
                <ImageOverlay
                    url="/img/GTAV-MAP.jpg"
                    bounds={[[0, 0], [180, 180]]}
                    interactive={false}
                />
                <LeafletZone
                    onZonesChange={handleZonesChange}
                    onPinsChange={handlePinsChange}
                />
            </MapContainer>
            <style jsx global>{`
                .leaflet-tooltip.custom-tooltip {
                    background-color: transparent;
                    border: none;
                    box-shadow: none;
                    color: white;
                    font-weight: bold;
                    text-shadow: 0 0 3px rgba(0,0,0,0.75);
                    font-size: 14px;
                }
            `}</style>
        </div>
    );
};

export default Leaflet;