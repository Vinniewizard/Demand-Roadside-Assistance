"use client";

import { useEffect, useState } from 'react';
import { Truck, Clock, MapPin, ShieldAlert, CreditCard, AlertCircle, Zap, ArrowRight, Droplet, User as UserIcon, MessageSquare, Star, Navigation, Wrench, CircleDot, Battery, CheckCircle, Shield } from 'lucide-react';
import Link from 'next/link';
import LiveRadar from '@/components/LiveTrackerWrapper';
import LocationEnforcer from '@/components/LocationEnforcer';

export default function UserDashboard() {
    const SERVICE_PRICES: Record<string, number> = {
        'TOWING': 1500,
        'FUEL': 400,
        'MECHANICAL': 1000,
        'TYRE': 600,
        'BATTERY': 800
    };

    const [loading, setLoading] = useState(false);
    const [serviceType, setServiceType] = useState('TOWING');
    const [fuelType, setFuelType] = useState('UNLEADED');
    const [fuelAmount, setFuelAmount] = useState('10L');
    const [mechanicalType, setMechanicalType] = useState('ENGINE');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState<{ lat: number, lon: number } | null>({ lat: -0.3689, lon: 35.2863 });
    const [address, setAddress] = useState('Detecting Kericho Hub GPS...');
    const [user, setUser] = useState<any>(null);
    const [requests, setRequests] = useState<any[]>([]);
    const [sessionChecked, setSessionChecked] = useState(false);

    const [showProfile, setShowProfile] = useState(false);
    const [profileData, setProfileData] = useState({ phone: '', licenseNumber: '', vehiclePlate: '', idNumber: '' });
    const [nearbyProviders, setNearbyProviders] = useState<any[]>([]);
    const [fetchingNearby, setFetchingNearby] = useState(false);
    const [isLocationConfirmed, setIsLocationConfirmed] = useState(false);

    const hasActiveRequest = requests.some(r => r.status !== 'COMPLETED' && r.status !== 'CANCELLED');
    const activeRequest = requests.find(r => r.status !== 'COMPLETED' && r.status !== 'CANCELLED');

    const fetchHistory = async (uid: string) => {
        try {
            const res = await fetch(`/api/requests?userId=${uid}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setRequests(data);
            }
        } catch (err) { console.error('History Fetch Error:', err); }
    };

    const fetchNearby = async (lat: number, lon: number) => {
        if (fetchingNearby) return;
        setFetchingNearby(true);
        try {
            const res = await fetch(`/api/providers/nearby?lat=${lat}&lon=${lon}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setNearbyProviders(data);
            }
        } catch (err) { console.error('Nearby Fetch Error:', err); }
        finally { setFetchingNearby(false); }
    };

    const requestGPS = () => {
        if (navigator.geolocation) {
            setAddress('Requesting Precise GPS...');
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const newLoc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
                    setLocation(newLoc);
                    setAddress(`Kericho Hub GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
                    fetchNearby(newLoc.lat, newLoc.lon);
                },
                () => setAddress('Location Access Denied or Timed Out.'),
                { enableHighAccuracy: true, timeout: 5000 }
            );
        } else {
            alert('Geolocation not supported.');
        }
    };

    useEffect(() => {
        let watchId: number;
        if (navigator.geolocation) {
            watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
                    setAddress(`Kericho Hub GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
                },
                () => setAddress('Location Access Denied.'),
                { enableHighAccuracy: false, maximumAge: 60000, timeout: 5000 } // Sped up GPS lock
            );
        }
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const u = JSON.parse(savedUser);
            setUser(u);
            setProfileData({ phone: u.phone || '', licenseNumber: u.licenseNumber || '', vehiclePlate: u.vehiclePlate || '', idNumber: u.idNumber || '' });

            // Immediate fetch and then polling
            fetchHistory(u.id);
            const handle = setInterval(() => fetchHistory(u.id), 5000);

            setSessionChecked(true);
            return () => {
                clearInterval(handle);
                if (watchId) navigator.geolocation.clearWatch(watchId);
            };
        } else {
            setSessionChecked(true);
        }
    }, []);

    // Fetch nearby providers when location updates
    useEffect(() => {
        if (location?.lat && location?.lon) {
            fetchNearby(location.lat, location.lon);
        }
    }, [location?.lat, location?.lon]);

    const handleRequest = async () => {
        if (!user?.id) return alert('Session expired.');
        setLoading(true);
        try {
            const res = await fetch('/api/requests', {
                method: 'POST',
                body: JSON.stringify({
                    userId: user.id,
                    serviceType,
                    fuelType: serviceType === 'FUEL' ? fuelType : null,
                    fuelAmount: serviceType === 'FUEL' ? fuelAmount : null,
                    description: serviceType === 'MECHANICAL' ? `${mechanicalType}: ${description}` : description,
                    latitude: location?.lat || -0.3689,
                    longitude: location?.lon || 35.2863,
                    address: address
                })
            });
            const data = await res.json();
            if (data.error) alert(data.error);
            else {
                setDescription('');
                fetchHistory(user.id);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateLocation = async (id: string) => {
        if (!location) return;
        try {
            await fetch(`/api/requests/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ latitude: location.lat, longitude: location.lon })
            });
            alert('GPS Pinged successfully to Supplier!');
        } catch (err) { console.error('Ping Error:', err); }
    };

    const handleAccomplish = async (id: string) => {
        try {
            await fetch(`/api/requests/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'COMPLETED', isPaid: true })
            });
            if (user) fetchHistory(user.id);
        } catch (err) { console.error('Completion Error:', err); }
    };

    const handleRating = async (id: string, rating: number) => {
        try {
            await fetch(`/api/requests/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating })
            });
            if (user) fetchHistory(user.id);
        } catch (err) { console.error(err); }
    };

    const handleProfileUpdate = async () => {
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, ...profileData })
            });
            const data = await res.json();
            if (data.user) {
                setUser(data.user);
                localStorage.setItem('user', JSON.stringify(data.user));
                setShowProfile(false);
                alert('Security Profile Successfully Updated!');
            }
        } catch (err) { alert('Failed updating profile.'); }
    };

    if (sessionChecked && !user) return <div style={{ padding: '8rem' }}>Access Restricted.</div>;

    return (
        <LocationEnforcer>
            <div className="container-main" style={{ padding: '4rem 2rem', maxWidth: '1600px', margin: '0 auto' }}>
                <header className="header-mobile animate-fade-up" style={{ marginBottom: '5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem' }}>
                    <div style={{ flex: '1', minWidth: '300px' }}>
                        <h1 className="font-heading text-gradient" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900, lineHeight: 1.05 }}>Fleet Command</h1>
                        <p className="text-muted" style={{ fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', marginTop: '0.8rem', fontWeight: 600 }}>Kericho Hub • Precision Roadside Response Platform</p>
                        
                        <div style={{ marginTop: '2rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
                            <div className="glass-vibrant" style={{ padding: '0.75rem 1.25rem', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', fontWeight: 900, color: 'hsl(var(--primary))' }}>
                                <div className="pulse-primary" style={{ width: '8px', height: '8px', background: 'hsl(var(--primary))', borderRadius: '50%' }} />
                                {address}
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => setShowProfile(!showProfile)} className="btn-premium btn-primary" style={{ height: '44px', padding: '0 1.5rem', fontSize: '0.75rem' }}>
                                    <Shield size={16} /> SECURITY PROFILE
                                </button>
                                <button onClick={() => { localStorage.removeItem('user'); window.location.href = '/login'; }} className="btn-premium btn-outline" style={{ height: '44px', padding: '0 1.5rem', color: 'hsl(var(--danger))', border: '1px solid hsla(var(--danger) / 0.15)', fontSize: '0.75rem' }}>LOGOUT</button>
                            </div>
                        </div>
                    </div>
                </header>

                {showProfile && (
                    <div className="glass-panel animate-fade-up" style={{ padding: '2rem', marginBottom: '3rem', border: '1px solid hsla(var(--primary) / 0.5)' }}>
                        <h2 className="font-heading" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Personal Verified Security Profile</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <input type="text" className="input-elegant" placeholder="Phone Number" value={profileData.phone} onChange={e => setProfileData({ ...profileData, phone: e.target.value })} />
                            <input type="text" className="input-elegant" placeholder="License Number" value={profileData.licenseNumber} onChange={e => setProfileData({ ...profileData, licenseNumber: e.target.value })} />
                            <input type="text" className="input-elegant" placeholder="Vehicle Plate" value={profileData.vehiclePlate} onChange={e => setProfileData({ ...profileData, vehiclePlate: e.target.value })} />
                            <input type="text" className="input-elegant" placeholder="ID Number" value={profileData.idNumber} onChange={e => setProfileData({ ...profileData, idNumber: e.target.value })} />
                        </div>
                        <button onClick={handleProfileUpdate} className="btn-premium btn-primary">SAVE PROFILE TO CORE</button>
                    </div>
                )}

                {/* MASTER ACTIVE MISSION TRACKER */}
                {activeRequest && (
                    <div className="glass-panel animate-fade-up" style={{ padding: '2.5rem', marginBottom: '4rem', border: '2px solid hsla(var(--primary) / 0.3)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div>
                                <h2 className="font-heading" style={{ fontSize: '1.75rem' }}>Active Mission Radar</h2>
                                <p className="text-muted" style={{ fontWeight: 600 }}>Tracking {activeRequest.serviceType} RESCUE • Status: {activeRequest.status}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 900 }}>SECURE DISPATCH ID</p>
                                <p style={{ fontWeight: 900, fontSize: '1rem', color: 'hsl(var(--primary))' }}>#{activeRequest.id.slice(-8).toUpperCase()}</p>
                            </div>
                        </div>

                        <div style={{ height: 'clamp(380px, 60vh, 700px)', borderRadius: '30px', overflow: 'hidden', border: '1px solid hsla(var(--glass-border) / 0.8)', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.25)', marginBottom: '2.5rem' }}>
                            <LiveRadar
                                userLat={activeRequest.latitude}
                                userLon={activeRequest.longitude}
                                providerLat={activeRequest.provider?.latitude}
                                providerLon={activeRequest.provider?.longitude}
                                status={activeRequest.status}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                            <div className="glass-panel" style={{ padding: '1.5rem', background: 'hsl(var(--bg))' }}>
                                <p style={{ fontSize: '0.7rem', opacity: 0.5, fontWeight: 900 }}>ETA / STATUS</p>
                                <p style={{ fontSize: '1.8rem', fontWeight: 900, color: 'hsl(var(--primary))' }}>
                                    {activeRequest.status === 'EN_ROUTE' ? `${activeRequest.estimatedArrival || '--'} mins` : 'Pending Dispatch'}
                                </p>
                            </div>
                            <div className="glass-panel" style={{ padding: '1.5rem', background: 'hsl(var(--bg))' }}>
                                <p style={{ fontSize: '0.7rem', opacity: 0.5, fontWeight: 900 }}>MISSION COST (KES)</p>
                                <p style={{ fontSize: '1.8rem', fontWeight: 900 }}>{activeRequest.deliveryFee?.toLocaleString()}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={() => handleUpdateLocation(activeRequest.id)} className="btn-premium btn-outline" style={{ flex: 1, justifyContent: 'center', height: '100%', fontSize: '0.85rem' }}>
                                    <MapPin size={20} /> SHARE GPS
                                </button>
                                {activeRequest.status === 'EN_ROUTE' && (
                                    <button onClick={() => handleAccomplish(activeRequest.id)} className="btn-premium btn-primary" style={{ flex: 1, justifyContent: 'center', height: '100%', fontSize: '0.85rem', background: 'hsl(var(--success))' }}>
                                        <CheckCircle size={20} /> I HAVE ARRIVED
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid-responsive" style={{ alignItems: 'start' }}>
                    {/* Enhanced Request Matrix */}
                    <section className="glass-panel" style={{ padding: '3.5rem' }}>
                        <div style={{ marginBottom: '3rem' }}>
                            <h2 className="font-heading" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Mission Specs</h2>
                            <p className="text-muted" style={{ fontSize: '0.85rem' }}>Configure your emergency response parameters</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                            {/* Service Tier Selection */}
                            <div className="card-inner">
                                <label style={{ fontSize: '0.7rem', fontWeight: 900, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem', display: 'block' }}>Emergency Tier</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '0.8rem' }}>
                                    <ServiceBox label="TOWING" active={serviceType === 'TOWING'} onClick={() => setServiceType('TOWING')} icon={<Truck size={22} />} />
                                    <ServiceBox label="FUEL" active={serviceType === 'FUEL'} onClick={() => setServiceType('FUEL')} icon={<Droplet size={22} />} />
                                    <ServiceBox label="MECHANIC" active={serviceType === 'MECHANICAL'} onClick={() => setServiceType('MECHANICAL')} icon={<Wrench size={22} />} />
                                    <ServiceBox label="TYRE" active={serviceType === 'TYRE'} onClick={() => setServiceType('TYRE')} icon={<CircleDot size={22} />} />
                                    <ServiceBox label="BATTERY" active={serviceType === 'BATTERY'} onClick={() => setServiceType('BATTERY')} icon={<Battery size={22} />} />
                                </div>
                            </div>

                            {/* Specific Configuration */}
                            <div className="card-inner animate-fade-up">
                                <label style={{ fontSize: '0.7rem', fontWeight: 900, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', display: 'block' }}>Operational Context</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                    {serviceType === 'FUEL' && (
                                        <div style={{ display: 'flex', gap: '0.8rem' }}>
                                            <select className="input-elegant" style={{ flex: 1 }} onChange={(e) => setFuelType(e.target.value)}>
                                                <option value="UNLEADED">Unleaded (Premium)</option>
                                                <option value="DIESEL">Diesel (Regular)</option>
                                            </select>
                                            <select className="input-elegant" style={{ width: '120px' }} onChange={(e) => setFuelAmount(e.target.value)}>
                                                <option value="5L">5 Liters</option>
                                                <option value="10L">10 Liters</option>
                                            </select>
                                        </div>
                                    )}

                                    {serviceType === 'MECHANICAL' && (
                                        <select className="input-elegant" onChange={(e) => setMechanicalType(e.target.value)}>
                                            <option value="ENGINE">Engine Diagnostics</option>
                                            <option value="BRAKES">Brake System Failure</option>
                                            <option value="SUSPENSION">Suspension Assistance</option>
                                            <option value="OVERHEATING">Engine Overheating</option>
                                        </select>
                                    )}

                                    <textarea
                                        placeholder="Briefly describe the vehicle status or landmark details..."
                                        className="input-elegant"
                                        style={{ minHeight: '130px', resize: 'none' }}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        disabled={hasActiveRequest}
                                    />
                                </div>
                            </div>

                            {/* Geolocation Targeting */}
                            <div className="card-inner animate-fade-up">
                                <label style={{ fontSize: '0.7rem', fontWeight: 900, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', display: 'block' }}>Extraction Point</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input 
                                            type="text" 
                                            className="input-elegant" 
                                            placeholder="Type landmark (optional)..." 
                                            value={address}
                                            style={{ flex: 1 }}
                                            onChange={(e) => setAddress(e.target.value)} 
                                        />
                                        <button onClick={requestGPS} className="btn-premium btn-outline" style={{ padding: '0 1.25rem' }} title="Re-detect GPS">
                                            <Navigation size={20} />
                                        </button>
                                    </div>
                                    {!isLocationConfirmed ? (
                                        <button onClick={() => { setIsLocationConfirmed(true); }} className="btn-premium btn-primary pulse-primary" style={{ width: '100%', justifyContent: 'center' }}>
                                            <MapPin size={18} /> INITIALIZE AND LOCK LOCATION
                                        </button>
                                    ) : (
                                        <button onClick={() => setIsLocationConfirmed(false)} className="btn-premium btn-outline" style={{ width: '100%', justifyContent: 'center', opacity: 0.6 }}>
                                            UNLOCK COORDINATES
                                        </button>
                                    )}
                                </div>
                            </div>

                            <button
                                disabled={loading || hasActiveRequest || !isLocationConfirmed}
                                onClick={handleRequest}
                                className={`btn-premium ${hasActiveRequest || !isLocationConfirmed ? 'btn-outline' : 'btn-primary pulse-primary'}`}
                                style={{ width: '100%', padding: '1.8rem', fontSize: '1.25rem', justifyContent: 'center', opacity: (hasActiveRequest || !isLocationConfirmed) ? 0.3 : 1 }}>
                                {loading ? (
                                    <div className="animate-spin" style={{ width: '28px', height: '28px', border: '3px solid white', borderTopColor: 'transparent', borderRadius: '50%' }} />
                                ) : (
                                    <>{hasActiveRequest ? 'DISPATCH IN PROGRESS' : (isLocationConfirmed ? 'LAUNCH EMERGENCY RESPONSE' : 'CONFIRM LOCATION TO DESPATCH')}</>
                                )}
                            </button>
                        </div>
                    </section>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
                        <section className="animate-fade-up">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h2 className="font-heading" style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <ShieldAlert size={24} color="hsl(var(--success))" />
                                    Rescue Fleet Nearby
                                </h2>
                                <button 
                                    onClick={() => location && fetchNearby(location.lat, location.lon)}
                                    className="btn-premium btn-outline" 
                                    style={{ padding: '0.5rem 1rem', fontSize: '0.7rem' }}
                                    disabled={fetchingNearby}
                                >
                                    <Zap size={14} /> RE-SCAN FLEET
                                </button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {nearbyProviders.length === 0 && !fetchingNearby ? (
                                    <div className="card-inner" style={{ padding: '3rem', textAlign: 'center', opacity: 0.6 }}>
                                        <p style={{ fontSize: '0.9rem' }}>No approved suppliers found in your immediate radius. Scanning wider...</p>
                                        <button onClick={() => location && fetchNearby(location.lat, location.lon)} className="btn-premium btn-primary" style={{ marginTop: '1.5rem', fontSize: '0.75rem' }}>FORCE RE-SCAN</button>
                                    </div>
                                ) : (
                                    nearbyProviders.map(p => (
                                        <div key={p.id} className="card-inner" style={{ borderLeft: '4px solid hsl(var(--success))' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                                                <div>
                                                    <h3 style={{ fontWeight: 900, fontSize: '1rem', marginBottom: '0.25rem' }}>{p.businessName || p.name}</h3>
                                                    <p className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 700 }}>{p.serviceType} Specialized</p>
                                                </div>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'hsl(var(--success))', background: 'hsla(var(--success) / 0.1)', padding: '0.3rem 0.75rem', borderRadius: '12px' }}>
                                                    {p.distance.toFixed(1)} KM
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid hsla(var(--glass-border) / 0.5)', paddingTop: '0.75rem' }}>
                                                <p style={{ fontSize: '0.85rem', fontWeight: 900, color: 'hsl(var(--primary))' }}>
                                                Est. Total: KES {((SERVICE_PRICES[serviceType] || 500) + (p.distance * (p.perKmRate || 50))).toLocaleString()}
                                            </p>
                                                <div style={{ display: 'flex', gap: '0.3rem' }}>
                                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={10} style={{ fill: 'hsl(var(--warning))', color: 'hsl(var(--warning))' }} />)}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                                {fetchingNearby && (
                                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                                        <div className="animate-spin" style={{ width: '20px', height: '20px', border: '2px solid hsl(var(--primary))', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto' }} />
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="animate-fade-up">
                            <h2 className="font-heading" style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Dispatch Feed</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '820px', overflowY: 'auto', paddingRight: '1rem' }}>
                                {requests.map((req: any) => (
                                    <div key={req.id} className="glass-panel" style={{ padding: '2.5rem', border: req.status === 'ACCEPTED' || req.status === 'EN_ROUTE' ? '2px solid hsl(var(--primary))' : '1px solid hsl(var(--glass-border))' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ padding: '0.8rem', background: 'hsla(var(--primary) / 0.1)', borderRadius: '15px', color: 'hsl(var(--primary))' }}>
                                                    {req.serviceType === 'TOWING' && <Truck size={20} />}
                                                    {req.serviceType === 'FUEL' && <Droplet size={20} />}
                                                    {req.serviceType === 'MECHANICAL' && <Wrench size={20} />}
                                                    {req.serviceType === 'TYRE' && <CircleDot size={20} />}
                                                    {req.serviceType === 'BATTERY' && <Battery size={20} />}
                                                </div>
                                                <div>
                                                    <span style={{ fontWeight: 900, fontSize: '1.1rem', display: 'block' }}>{req.serviceType} Assist</span>
                                                    <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 700 }}>#{req.id.slice(-6).toUpperCase()}</span>
                                                </div>
                                            </div>
                                            <span className="badge-status" style={{ 
                                                background: req.status === 'ACCEPTED' || req.status === 'EN_ROUTE' ? 'hsl(var(--success))' : 'hsla(var(--primary) / 0.1)',
                                                color: req.status === 'ACCEPTED' || req.status === 'EN_ROUTE' ? 'white' : 'inherit'
                                            }}>{req.status.replace('_', ' ')}</span>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div className="card-inner">
                                                <p style={{ fontSize: '0.65rem', opacity: 0.5, fontWeight: 900, marginBottom: '0.4rem' }}>EXPECTED ARRIVAL</p>
                                                <p style={{ fontSize: '1.3rem', fontWeight: 900, color: 'hsl(var(--primary))' }}>
                                                    {req.status === 'COMPLETED' ? 'ARRIVED' :
                                                        (req.status === 'EN_ROUTE' && req.acceptedAt) ?
                                                            (Math.max(0, req.estimatedArrival - Math.floor((new Date().getTime() - new Date(req.acceptedAt).getTime()) / 60000)) === 0 ? 'ARRIVING' : `${Math.max(0, req.estimatedArrival - Math.floor((new Date().getTime() - new Date(req.acceptedAt).getTime()) / 60000))}M`)
                                                            : `${req.estimatedArrival}M`}
                                                </p>
                                            </div>
                                            <div className="card-inner">
                                                <p style={{ fontSize: '0.65rem', opacity: 0.5, fontWeight: 900, marginBottom: '0.4rem' }}>SYSTEM FEE</p>
                                                <p style={{ fontSize: '1.3rem', fontWeight: 900 }}>KES {req.deliveryFee?.toLocaleString()}</p>
                                            </div>
                                        </div>

                                        {(req.status === 'ACCEPTED' || req.status === 'EN_ROUTE') && (
                                            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                                                <button onClick={() => handleUpdateLocation(req.id)} className="btn-premium btn-outline" style={{ flex: 1, fontSize: '0.8rem', justifyContent: 'center' }}>
                                                    <MapPin size={18} /> GPS PING
                                                </button>
                                                {req.status === 'EN_ROUTE' && (
                                                    <button onClick={() => handleAccomplish(req.id)} className="btn-premium btn-primary" style={{ flex: 1, fontSize: '0.8rem', justifyContent: 'center' }}>
                                                        <CheckCircle size={18} /> CONFIRM
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        {req.status === 'COMPLETED' && !req.rating && (
                                            <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid hsla(var(--glass-border) / 0.5)', paddingTop: '1.5rem' }}>
                                                <p style={{ fontSize: '0.75rem', fontWeight: 900, opacity: 0.6 }}>RATE YOUR RESCUE:</p>
                                                <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <Star key={star} size={24} style={{ cursor: 'pointer', fill: 'hsl(var(--primary))', opacity: 0.2 }} onClick={() => handleRating(req.id, star)} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {req.status === 'COMPLETED' && req.rating && (
                                            <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid hsla(var(--glass-border) / 0.5)', paddingTop: '1.5rem' }}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 900, opacity: 0.6 }}>MISSION RATING:</span>
                                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                    {[...Array(req.rating)].map((_, i) => <Star key={i} size={14} style={{ fill: 'hsl(var(--primary))', color: 'hsl(var(--primary))' }} />)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </LocationEnforcer>
    );
}

function ServiceBox({ label, active, onClick, icon }: any) {
    return (
        <div onClick={onClick} className="glass-panel" style={{ padding: '1.5rem 0.5rem', textAlign: 'center', cursor: 'pointer', border: active ? '2px solid hsl(var(--primary))' : '1px solid hsla(var(--glass-border) / 0.5)', background: active ? 'hsla(var(--primary) / 0.15)' : 'transparent', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', transform: active ? 'scale(1.03)' : 'scale(1)', boxShadow: active ? '0 10px 25px hsla(var(--primary) / 0.2)' : 'none' }}>
            <div style={{ marginBottom: '0.6rem', color: active ? 'hsl(var(--primary))' : 'hsl(var(--fg))', opacity: active ? 1 : 0.7, display: 'flex', justifyContent: 'center', transform: active ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.3s ease' }}>{icon}</div>
            <p style={{ fontWeight: 900, fontSize: '0.65rem', letterSpacing: '0.05em', color: active ? 'hsl(var(--primary))' : 'inherit' }}>{label}</p>
        </div>
    );
}
