import React from 'react';
import { MapPin, Truck } from 'lucide-react';

interface MapProps {
    userLat: number;
    userLon: number;
    providerLat?: number;
    providerLon?: number;
    status?: string;
}

export default function SimulationMap({ userLat, userLon, providerLat, providerLon, status }: MapProps) {
    const isEnRoute = status === 'EN_ROUTE';

    // Default centers user if no active relative matching
    let uX = 50;
    let uY = 50;
    let pX = 50;
    let pY = 50;

    // Create proportional bounds if supplier coordinates exist and differ
    if (providerLat && providerLon && Math.abs(userLat - providerLat) > 0.0001) {
        const minLat = Math.min(userLat, providerLat);
        const maxLat = Math.max(userLat, providerLat);
        const minLon = Math.min(userLon, providerLon);
        const maxLon = Math.max(userLon, providerLon);

        // 50% Padding scalar
        const latRange = (maxLat - minLat) * 2;
        const lonRange = (maxLon - minLon) * 2;

        const midLat = (minLat + maxLat) / 2;
        const midLon = (minLon + maxLon) / 2;

        uX = 50 + ((userLon - midLon) / lonRange) * 100;
        uY = 50 - ((userLat - midLat) / latRange) * 100; // SVG Y is inverted
        pX = 50 + ((providerLon - midLon) / lonRange) * 100;
        pY = 50 - ((providerLat - midLat) / latRange) * 100;
    } else if (providerLat && providerLon) {
        // They are at exactly the same location
        pX = 52;
        pY = 52;
    }

    return (
        <div style={{ position: 'relative', width: '100%', height: '180px', background: 'hsl(var(--bg))', borderRadius: '12px', border: '1px solid hsla(var(--glass-border) / 0.5)', overflow: 'hidden', backgroundImage: 'radial-gradient(circle at 50% 50%, hsla(var(--primary) / 0.2) 1px, transparent 1px)', backgroundSize: '15px 15px', marginTop: '1rem', marginBottom: '1rem' }}>

            {/* Dashed Tracking Line */}
            {isEnRoute && providerLat && providerLon && (
                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                    <line x1={`${uX}%`} y1={`${uY}%`} x2={`${pX}%`} y2={`${pY}%`} stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="6,6" style={{ opacity: 0.6 }} />
                </svg>
            )}

            {/* Simulated Supplier Marker */}
            {providerLat && providerLon && (
                <div style={{ position: 'absolute', left: `${pX}%`, top: `${pY}%`, transform: 'translate(-50%, -50%)', transition: 'all 2s ease-out' }}>
                    <div style={{ background: 'hsl(var(--success))', padding: '0.5rem', borderRadius: '50%', boxShadow: '0 0 20px hsla(var(--success) / 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Truck size={18} color="white" />
                    </div>
                </div>
            )}

            {/* Drivers Incident Marker */}
            <div style={{ position: 'absolute', left: `${uX}%`, top: `${uY}%`, transform: 'translate(-50%, -50%)', transition: 'all 2s ease-out' }}>
                <div style={{ background: 'hsl(var(--danger))', padding: '0.4rem', borderRadius: '50%', border: '2px solid white', boxShadow: '0 0 25px hsla(var(--danger) / 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MapPin size={16} color="white" />
                </div>
            </div>

            {/* Overlay Indicator */}
            <div style={{ position: 'absolute', bottom: '0.6rem', left: '0.6rem', background: 'hsla(var(--bg) / 0.9)', padding: '0.4rem 0.6rem', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 900, border: '1px solid hsla(var(--glass-border) / 0.5)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isEnRoute ? 'hsl(var(--success))' : 'hsl(var(--danger))' }} />
                {isEnRoute ? 'LIVE RADAR TRACKING ACTIVE' : 'AWAITING RESPONSE'}
            </div>
        </div>
    );
}
