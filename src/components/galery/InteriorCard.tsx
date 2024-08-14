import React, { useState } from 'react';
import { Parallax } from 'react-parallax';
import { Chip, Tooltip } from '@mui/material';
import { AlignHorizontalLeft, Bed, Chair, DirectionsCar, Inventory, MeetingRoom, Home, Apartment } from '@mui/icons-material';
import { ExtendedInterior } from '@/actions/db/interior.action';
import { Prisma } from '@prisma/client';

// Utility functions
const isStringArray = (value: Prisma.JsonValue): value is string[] => {
    return Array.isArray(value) && value.every(item => typeof item === 'string');
};

const shouldRenderChip = (value: number | undefined | null): boolean => {
    return value !== undefined && value !== null && value !== 0;
};

// Chip styles
const commonChipStyle = {
    width: 'auto',
    height: '35px',
    paddingLeft: '15px',
    paddingRight: '15px',
    WebkitBoxShadow: '0px 0px 21px 6px rgba(0,0,0,0.54)',
    boxShadow: '0px 0px 21px 6px rgba(0,0,0,0.54)',
    backgroundColor: '#efefef'
};

// Chip components
const ParkingChip: React.FC<{ spots: number }> = ({ spots }) => (
    <Chip
        style={{ ...commonChipStyle, border: '2px solid #0891b2', cursor: 'pointer', borderRadius: '5px' }}
        icon={<DirectionsCar style={{color: "#0891b2"}}/>}
        label={`${spots} ${spots > 1 ? "Places de parking" : "Place de parking"}`}
    />
);

const StorageChip: React.FC<{ storage: number }> = ({ storage }) => (
    <Chip
        style={{ ...commonChipStyle, border: '2px solid #a2500f', borderRadius: '5px' }}
        icon={<Inventory style={{color: "#a2500f"}}/>}
        label={`${storage} Kg`}
    />
);

const FloorChip: React.FC<{ floor: number }> = ({ floor }) => (
    <Chip
        style={{ ...commonChipStyle, border: '2px solid #a2310f', borderRadius: '5px' }}
        icon={<AlignHorizontalLeft style={{color: "#a2310f"}}/>}
        label={floor > 1 ? `${floor} Étages` : "Plein pied"}
    />
);

const RoomsChip: React.FC<{ rooms: number }> = ({ rooms }) => (
    <Chip
        style={{ ...commonChipStyle, border: '2px solid #bb4c4c', borderRadius: '5px' }}
        icon={<MeetingRoom style={{color: "#bb4c4c"}}/>}
        label={`${rooms} ${rooms > 1 ? "Pièces" : "Pièce"}`}
    />
);

const BedroomsChip: React.FC<{ bedrooms: number }> = ({ bedrooms }) => (
    <Chip
        style={{ ...commonChipStyle, border: '2px solid #e7a364', borderRadius: '5px' }}
        icon={<Bed style={{color: "#e7a364"}}/>}
        label={`${bedrooms} ${bedrooms > 1 ? "Chambres" : "Chambre"}`}
    />
);

const FurnitureChip: React.FC<{ furniture: boolean, unfurnished: boolean }> = ({ furniture, unfurnished }) => {
    let label = "Meublé uniquement";
    if (unfurnished && !furniture) label = "Non meublé uniquement";
    if (furniture && unfurnished) label = "Meublé ou non meublé";

    return (
        <Chip
            style={{ ...commonChipStyle, border: '2px solid #303434', borderRadius: '5px' }}
            icon={<Chair style={{color: "#303434"}}/>}
            label={label}
        />
    );
};

const PriceChip: React.FC<{ type: 'rent' | 'buy', min?: number | null, max?: number | null }> = ({ type, min, max }) => {
    if (!min && !max) return null;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
    };

    let label: string;
    let icon: JSX.Element;
    let borderColor: string;
    let tooltipText: string;

    if (type === 'rent') {
        label = 'Location';
        icon = <Apartment style={{color: "#4caf50"}}/>;
        borderColor = '#4caf50';
        tooltipText = "Tarif de location hebdomadaire - Ce montant est indicatif et peut varier. Il représente une moyenne et non un prix fixe.";
    } else {
        label = 'Achat';
        icon = <Home style={{color: "#2196f3"}}/>;
        borderColor = '#2196f3';
        tooltipText = "Tarif d'achat du bien - Ce montant est indicatif et peut varier. Il représente une moyenne et non un prix fixe.";
    }

    const priceLabel = min && max
        ? `Entre ${formatPrice(min)} et ${formatPrice(max)}`
        : min
            ? `À partir de ${formatPrice(min)}`
            : `Jusqu'à ${formatPrice(max!)}`;

    return (
        <Tooltip title={tooltipText} arrow>
            <Chip
                style={{
                    ...commonChipStyle,
                    border: `2px solid ${borderColor}`,
                    borderRadius: '5px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    padding: '5px',
                    height: 'auto',
                }}
                icon={icon}
                label={
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1px' }}>
                        <div style={{fontSize: '12px', fontWeight: 'normal'}}>{label}</div>
                        <div>{priceLabel}</div>
                    </div>
                }
            />
        </Tooltip>
    );
};

// Main component
export const InteriorCard: React.FC<{ data: ExtendedInterior }> = ({ data }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    if (!isStringArray(data.listImages)) {
        console.error('listImages is not a string array');
        return null;
    }

    return (
        <div style={{
            fontFamily: "sans-serif",
            textAlign: "center",
            width: "100%",
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <div style={{width: 'calc(100% - 160px)', height: '100%'}}>
                <Parallax
                    bgImage={data.listImages[selectedIndex]}
                    strength={250}
                    bgImageStyle={{
                        position: 'absolute',
                        top: '-35%',
                        left: '50%',
                        transform: 'translate(-50%,-50%)',
                        width: 'auto',
                        height: '150%',
                        objectFit: 'cover',
                    }}
                >
                    <div style={{height: 800}} className="flex flex-col justify-between items-center">
                        <div style={{
                            padding: 20,
                            position: "absolute",
                            top: "2%",
                            left: "2%",
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "3em",
                            textShadow: "0px 0px 6px #222222",
                        }}>{data.title}</div>

                        {/* Price chips at the top */}
                        <div className="flex flex-row justify-center items-center mt-6 gap-5 font-bold">
                            <PriceChip type="rent" min={data.minRentalPrice} max={data.maxRentalPrice} />
                            <PriceChip type="buy" min={data.minPurchasePrice} max={data.maxPurchasePrice} />
                        </div>

                        {/* Other chips at the bottom */}
                        <div className="flex flex-row justify-center items-center m-5 gap-5 font-bold">
                            {shouldRenderChip(data.parkingSpots) && (
                                <ParkingChip spots={data.parkingSpots!} />
                            )}

                            {data.type.name !== 'GARAGE' && (
                                <>
                                    {shouldRenderChip(data.stockage) && <StorageChip storage={data.stockage!} />}
                                    {shouldRenderChip(data.floor) && <FloorChip floor={data.floor!} />}
                                    {shouldRenderChip(data.rooms) && <RoomsChip rooms={data.rooms!} />}
                                    {shouldRenderChip(data.bedRooms) && <BedroomsChip bedrooms={data.bedRooms!} />}
                                    <FurnitureChip furniture={data.furniture} unfurnished={data.unfurnished} />
                                </>
                            )}
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'start',
                            flexDirection: 'column',
                            position: 'absolute',
                            right: '0',
                            height: '800px',
                            width: '30%',
                            gap: '20px',
                            background: 'linear-gradient(to left, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0))',
                        }}/>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'start',
                            flexDirection: 'column',
                            position: 'absolute',
                            top: '2%',
                            right: '2%',
                            gap: '20px',
                            maxHeight: '80vh',
                            overflowY: 'auto',
                            padding: '10px',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '10px',
                        }}>
                            {data.listImages.map((image: string, index: number) => (
                                <div
                                    key={index}
                                    onClick={() => setSelectedIndex(index)}
                                    style={{
                                        height: '50px',
                                        width: '100px',
                                        backgroundImage: `url(${image})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        border: index === selectedIndex ? '3px solid #af3434' : '2px solid #a2500f00',
                                        flexShrink: 0,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </Parallax>
            </div>
        </div>
    );
};