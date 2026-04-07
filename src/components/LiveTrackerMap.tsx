"use client";

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { calculateDistance } from '@/lib/utils/geo';

interface MapProps {
    userLat: number;
    userLon: number;
    providerLat?: number;
    providerLon?: number;
    status?: string;
}

// Ensure Leaflet map bounds dynamically adjust
function MapBounds({ userLat, userLon, providerLat, providerLon }: any) {
    const map = import('react-leaflet').then(m => m.useMap()); // workaround, better approach via direct hook if possible? 
    return null;
}

export default function LiveTrackerMap({ userLat, userLon, providerLat, providerLon, status }: MapProps) {
    const isEnRoute = status === 'EN_ROUTE';

    const [mapRef, setMapRef] = useState<L.Map | null>(null);

    useEffect(() => {
        if (mapRef) {
            const bounds = L.latLngBounds([userLat, userLon], [userLat, userLon]);
            if (providerLat && providerLon && isEnRoute) {
                bounds.extend([providerLat, providerLon]);
            }
            mapRef.fitBounds(bounds, { padding: [30, 30], maxZoom: 16 });
        }
    }, [userLat, userLon, providerLat, providerLon, isEnRoute, mapRef]);

    // High quality HTML markers replacing missing webpack assets
    const motoristIcon = L.divIcon({
        html: `<div style="background: hsl(var(--danger)); padding: 0.4rem; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 15px hsla(var(--danger) / 0.8); display: flex; align-items: center; justify-content: center; width: 30px; height: 30px;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>`,
        className: '',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });

    const supplierIcon = L.divIcon({
        html: `<div style="background: hsl(var(--success)); padding: 0.4rem; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 15px hsla(var(--success) / 0.8); display: flex; align-items: center; justify-content: center; width: 34px; height: 34px;"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17h4V5H2v12h3"></path><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5"></path><path d="M14 17h1"></path><circle cx="7.5" cy="17.5" r="2.5"></circle><circle cx="17.5" cy="17.5" r="2.5"></circle></svg></div>`,
        className: '',
        iconSize: [34, 34],
        iconAnchor: [17, 17]
    });

    const centerLat = providerLat && isEnRoute ? (userLat + providerLat) / 2 : userLat;
    const centerLon = providerLon && isEnRoute ? (userLon + providerLon) / 2 : userLon;

    // Smart Distance Calculation for HUD
    const distanceKm = (providerLat && providerLon) 
        ? calculateDistance(userLat, userLon, providerLat, providerLon).toFixed(1) 
        : null;

    return (
        <div className="map-container-spacious" style={{ position: 'relative', width: '100%', overflow: 'hidden', border: '1px solid hsla(var(--glass-border) / 0.8)', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
            <MapContainer 
                center={[centerLat, centerLon]} 
                zoom={14} 
                style={{ width: '100%', height: '100%' }}
                ref={setMapRef}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                />
                
                <Marker position={[userLat, userLon]} icon={motoristIcon}>
                    <Popup>Motorist Incident Location</Popup>
                </Marker>

                {isEnRoute && providerLat && providerLon && (
                    <>
                        <Marker position={[providerLat, providerLon]} icon={supplierIcon}>
                            <Popup>Kericho Hub Rescue Provider</Popup>
                        </Marker>
                        <Polyline 
                            positions={[[userLat, userLon], [providerLat, providerLon]]} 
                            color="hsl(var(--primary))" 
                            dashArray="5, 10" 
                            weight={3} 
                            opacity={0.7} 
                        />
                    </>
                )}
            </MapContainer>
            
            <div className="floating-hud" style={{ position: 'absolute', bottom: '1.25rem', left: '1.25rem', background: 'hsla(var(--glass-bg))', backdropFilter: 'blur(30px)', padding: '0.8rem 1.25rem', borderRadius: '20px', fontSize: '0.75rem', letterSpacing: '0.05em', fontWeight: 900, border: '1px solid hsla(var(--glass-border) / 0.5)', boxShadow: '0 15px 35px rgba(0,0,0,0.2)', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '0.75rem', maxWidth: 'calc(100% - 2.5rem)', color: 'hsl(var(--fg))' }}>
               <div className={isEnRoute ? 'pulse-primary' : ''} style={{ width: '10px', height: '10px', borderRadius: '50%', background: isEnRoute ? 'hsl(var(--success))' : 'hsl(var(--danger))', flexShrink: 0 }} />
               <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {isEnRoute ? `MISSION ACTIVE • ${distanceKm} KM AWAY` : 'AWAITING RESPONSE'}
               </span>
            </div>
        </div>
    );
}
