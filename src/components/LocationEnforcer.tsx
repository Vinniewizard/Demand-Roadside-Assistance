"use client";

import { useEffect, useState } from 'react';
import { MapPin, ShieldAlert } from 'lucide-react';

export default function LocationEnforcer({ children }: { children: React.ReactNode }) {
    const [permissionStatus, setPermissionStatus] = useState<'granted' | 'prompt' | 'denied' | 'loading'>('loading');

    const checkPermission = async () => {
        try {
            if (navigator.permissions && navigator.permissions.query) {
                const result = await navigator.permissions.query({ name: 'geolocation' });
                setPermissionStatus(result.state);
                
                result.onchange = () => {
                    setPermissionStatus(result.state);
                };
            } else {
                // Fallback if Permissions API is not natively supported in some browsers
                setPermissionStatus('prompt');
            }
        } catch (err) {
            setPermissionStatus('prompt');
        }
    };

    useEffect(() => {
        checkPermission();
    }, []);

    const requestLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                () => {
                    setPermissionStatus('granted');
                },
                (error) => {
                    if (error.code === error.PERMISSION_DENIED) {
                        setPermissionStatus('denied');
                    } else {
                        setPermissionStatus('prompt');
                    }
                },
                { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
            );
        } else {
            alert('Geolocation is not supported by your browser.');
        }
    };

    if (permissionStatus === 'loading') {
        return null; // Or a stealthy loading spinner
    }

    if (permissionStatus === 'granted') {
        return <>{children}</>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
            <div style={{ background: 'hsl(var(--danger))', color: '#fff', padding: '1rem', textAlign: 'center', zIndex: 9999 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <ShieldAlert size={20} />
                    <span style={{ fontWeight: 800 }}>Exact GPS Location Required for optimal rescue dispatch.</span>
                    {permissionStatus === 'denied' ? (
                        <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>(Permission Blocked in Browser - Please enable lock icon 🔒)</span>
                    ) : (
                        <button onClick={requestLocation} className="btn-premium" style={{ background: '#fff', color: 'hsl(var(--danger))', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                            <MapPin size={16} style={{ marginRight: '0.4rem' }} /> AUTHORIZE GPS
                        </button>
                    )}
                </div>
            </div>
            <div style={{ flex: 1, filter: 'grayscale(0.3)', transition: 'filter 0.3s' }}>
                {children}
            </div>
        </div>
    );
}
