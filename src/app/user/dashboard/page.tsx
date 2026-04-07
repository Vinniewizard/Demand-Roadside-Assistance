"use client";

import { useEffect, useState } from 'react';
import { Truck, Clock, MapPin, ShieldAlert, CreditCard, AlertCircle, Zap, ArrowRight, Droplet, User as UserIcon, MessageSquare, Star, Navigation, Wrench, CircleDot, Battery, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import LiveRadar from '@/components/LiveTrackerWrapper';

export default function UserDashboard() {
  const [loading, setLoading] = useState(false);
  const [serviceType, setServiceType] = useState('TOWING');
  const [fuelType, setFuelType] = useState('UNLEADED');
  const [fuelAmount, setFuelAmount] = useState('10L');
  const [mechanicalType, setMechanicalType] = useState('ENGINE');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<{lat: number, lon: number} | null>(null);
  const [address, setAddress] = useState('Auto-Detecting Location...');
  const [user, setUser] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [sessionChecked, setSessionChecked] = useState(false);
  
  const [showProfile, setShowProfile] = useState(false);
  const [profileData, setProfileData] = useState({ phone: '', licenseNumber: '', vehiclePlate: '', idNumber: '' });
  const [nearbyProviders, setNearbyProviders] = useState<any[]>([]);
  const [fetchingNearby, setFetchingNearby] = useState(false);
  
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

  useEffect(() => {
    let watchId: number;
    if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
            (pos) => {
                setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
                setAddress(`Kericho Hub GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
            },
            () => setAddress('Location Access Denied.'),
            { enableHighAccuracy: true }
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
    <div className="container-main" style={{ padding: '4rem 2rem', maxWidth: '1600px', margin: '0 auto' }}>
      <header className="header-mobile" style={{ marginBottom: '4rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem' }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h1 className="font-heading text-gradient" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, lineHeight: 1.1 }}>Motorist Control</h1>
          <p className="text-muted" style={{ fontSize: 'clamp(0.85rem, 2vw, 1rem)', marginTop: '0.5rem' }}>Demand Roadside Assistance | 24/7 Kericho Network</p>
          <div style={{ marginTop: '1.2rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ padding: '0.5rem 1rem', background: 'hsla(var(--success) / 0.1)', borderRadius: '15px', color: 'hsl(var(--success))', fontSize: '0.75rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Navigation size={14} /> {address}
              </div>
              <button onClick={() => setShowProfile(!showProfile)} className="btn-premium btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.75rem', borderRadius: '15px' }}>
                <UserIcon size={14} /> SECURITY PROFILE
              </button>
          </div>
        </div>
        <button onClick={() => { localStorage.removeItem('user'); window.location.href='/login'; }} className="btn-premium btn-outline" style={{ color: 'hsl(var(--danger))', borderColor: 'hsla(var(--danger) / 0.2)', fontSize: '0.8rem' }}>EXIT SYSTEM</button>
      </header>

      {showProfile && (
          <div className="glass-panel animate-fade-up" style={{ padding: '2rem', marginBottom: '3rem', border: '1px solid hsla(var(--primary) / 0.5)' }}>
              <h2 className="font-heading" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Personal Verified Security Profile</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <input type="text" className="input-elegant" placeholder="Phone Number" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} />
                  <input type="text" className="input-elegant" placeholder="License Number" value={profileData.licenseNumber} onChange={e => setProfileData({...profileData, licenseNumber: e.target.value})} />
                  <input type="text" className="input-elegant" placeholder="Vehicle Plate" value={profileData.vehiclePlate} onChange={e => setProfileData({...profileData, vehiclePlate: e.target.value})} />
                  <input type="text" className="input-elegant" placeholder="ID Number" value={profileData.idNumber} onChange={e => setProfileData({...profileData, idNumber: e.target.value})} />
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
          <section className="glass-panel" style={{ padding: '2.5rem' }}>
            <h2 className="font-heading" style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Service Matrix</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <ServiceBox label="TOWING" active={serviceType === 'TOWING'} onClick={() => setServiceType('TOWING')} icon={<Truck size={24} />} />
                <ServiceBox label="FUEL" active={serviceType === 'FUEL'} onClick={() => setServiceType('FUEL')} icon={<Droplet size={24} />} />
                <ServiceBox label="MECHANIC" active={serviceType === 'MECHANICAL'} onClick={() => setServiceType('MECHANICAL')} icon={<Wrench size={24} />} />
                <ServiceBox label="TYRE" active={serviceType === 'TYRE'} onClick={() => setServiceType('TYRE')} icon={<CircleDot size={24} />} />
                <ServiceBox label="BATTERY" active={serviceType === 'BATTERY'} onClick={() => setServiceType('BATTERY')} icon={<Battery size={24} />} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {serviceType === 'FUEL' && (
                    <div className="animate-fade-up" style={{ display: 'flex', gap: '1rem' }}>
                        <select className="input-elegant" style={{ flex: 1 }} onChange={(e) => setFuelType(e.target.value)}>
                            <option value="UNLEADED">Unleaded (Premium)</option>
                            <option value="DIESEL">Diesel (Regular)</option>
                        </select>
                        <select className="input-elegant" style={{ width: '110px' }} onChange={(e) => setFuelAmount(e.target.value)}>
                            <option value="5L">5 Liters</option>
                            <option value="10L">10 Liters</option>
                        </select>
                    </div>
                )}
                
                {serviceType === 'MECHANICAL' && (
                    <div className="animate-fade-up">
                        <select className="input-elegant" onChange={(e) => setMechanicalType(e.target.value)}>
                            <option value="ENGINE">Engine Diagnostics</option>
                            <option value="BRAKES">Brake System Failure</option>
                            <option value="SUSPENSION">Suspension Assistance</option>
                            <option value="OVERHEATING">Engine Overheating</option>
                        </select>
                    </div>
                )}

                <div className="animate-fade-up">
                    <label style={{ fontSize: '0.75rem', fontWeight: 900, color: 'hsl(var(--primary))', display: 'block', marginBottom: '0.5rem' }}>DETAILED PROBLEM</label>
                    <textarea 
                        placeholder="e.g. Broken radiator near Kericho Bypass or Tyre puncture..." 
                        className="input-elegant" 
                        style={{ minHeight: '110px', resize: 'none' }}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={hasActiveRequest}
                    />
                </div>
                
                <div style={{ padding: '1rem', background: 'hsla(var(--success) / 0.1)', borderRadius: '15px', color: 'hsl(var(--success))', fontSize: '0.75rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Navigation size={14} /> GPS LINKED: {address}
                </div>

                <button disabled={loading || hasActiveRequest} onClick={handleRequest} className={`btn-premium ${hasActiveRequest ? 'btn-outline' : 'btn-primary pulse-primary'}`} style={{ width: '100%', padding: '1.5rem', fontSize: 'clamp(1rem, 2vw, 1.4rem)', justifyContent: 'center', opacity: hasActiveRequest ? 0.3 : 1 }}>
                   {loading ? <div className="animate-spin" style={{ width: '28px', height: '28px', border: '3px solid white', borderTopColor: 'transparent', borderRadius: '50%' }} /> : <>{hasActiveRequest ? 'SYSTEM LOCKED: DISPATCH ACTIVE' : 'LAUNCH DISPATCH'}</>}
                </button>
            </div>
          </section>

          {/* New Section: Nearest Support Fleet */}
          <section className="animate-fade-up">
              <h2 className="font-heading" style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <ShieldAlert size={20} color="hsl(var(--success))" /> 
                  Rescue Fleet Nearby
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {nearbyProviders.length === 0 && !fetchingNearby ? (
                      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', opacity: 0.6 }}>
                          <p style={{ fontSize: '0.8rem' }}>Scanning for available suppliers in your radius...</p>
                      </div>
                  ) : (
                      nearbyProviders.map(p => (
                          <div key={p.id} className="glass-panel" style={{ padding: '1.25rem', border: '1px solid hsla(var(--glass-border) / 0.5)', background: 'hsla(var(--success) / 0.03)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                  <h3 style={{ fontWeight: 900, fontSize: '0.9rem' }}>{p.businessName || p.name}</h3>
                                  <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'hsl(var(--success))', background: 'hsla(var(--success) / 0.1)', padding: '0.2rem 0.6rem', borderRadius: '10px' }}>
                                      {p.distance.toFixed(1)} KM
                                  </span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <p className="text-muted" style={{ fontSize: '0.75rem' }}>{p.serviceType} Specialized</p>
                                  <p style={{ fontSize: '0.75rem', fontWeight: 800, opacity: 0.8 }}>Est. KES {p.baseFee?.toLocaleString()}</p>
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

         {/* History Stream */}
         <section>
            <h2 className="font-heading" style={{ marginBottom: '1.5rem' }}>Live Dispatch Tracking</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '720px', overflowY: 'auto', paddingRight: '1rem' }}>
                {requests.map((req: any) => (
                    <div key={req.id} className="glass-panel animate-fade-up" style={{ padding: '2rem', border: req.status === 'ACCEPTED' ? '2px solid hsla(var(--success) / 0.4)' : '1px solid hsl(var(--glass-border))' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', maxWidth: '60%' }}>
                                <div>
                                    <span style={{ fontWeight: 900, fontSize: '1rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.serviceType} RESCUE</span>
                                    {req.provider && (
                                        <span style={{ fontSize: '0.7rem', opacity: 0.8, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.provider.businessName || req.provider.name}</span>
                                    )}
                                </div>
                            </div>
                            <span style={{ fontSize: '0.65rem', fontWeight: 900, background: req.status === 'ACCEPTED' || req.status === 'EN_ROUTE' ? 'hsl(var(--success))' : 'hsla(var(--primary) / 0.1)', color: req.status === 'ACCEPTED' || req.status === 'EN_ROUTE' ? 'white' : 'inherit', padding: '0.3rem 0.6rem', borderRadius: 'var(--radius-full)', textAlign: 'center', alignSelf: 'flex-start' }}>{req.status.replace('_', ' ')}</span>
                        </div>
                        
                        {/* Map removed from history for cleaner UI, moved to Master Tracker above */}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                             <div className="glass-panel" style={{ padding: '1rem', background: 'hsl(var(--bg))' }}>
                                <p style={{ fontSize: '0.6rem', opacity: 0.5, fontWeight: 900 }}>ETA / STATUS</p>
                                <p style={{ fontSize: '1.2rem', fontWeight: 900 }}>
                                    {req.status === 'COMPLETED' ? 'ARRIVED' : 
                                     (req.status === 'EN_ROUTE' && req.acceptedAt) ? 
                                       (Math.max(0, req.estimatedArrival - Math.floor((new Date().getTime() - new Date(req.acceptedAt).getTime()) / 60000)) === 0 ? 'ARRIVING NOW' : `${Math.max(0, req.estimatedArrival - Math.floor((new Date().getTime() - new Date(req.acceptedAt).getTime()) / 60000))} mins`) 
                                     : `${req.estimatedArrival} mins`}
                                </p>
                            </div>
                            <div className="glass-panel" style={{ padding: '1rem', background: 'hsl(var(--bg))' }}>
                                <p style={{ fontSize: '0.6rem', opacity: 0.5, fontWeight: 900 }}>FEE (KES)</p>
                                <p style={{ fontSize: '1.2rem', fontWeight: 900 }}>{req.deliveryFee?.toLocaleString()}</p>
                            </div>
                        </div>

                        {(req.status === 'ACCEPTED' || req.status === 'EN_ROUTE') && (
                            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                                <button onClick={() => handleUpdateLocation(req.id)} className="btn-premium btn-outline" style={{ flex: 1, fontSize: '0.75rem', justifyContent: 'center' }}>
                                    <MapPin size={16} /> SHARE LIVE GPS
                                </button>
                                {req.status === 'EN_ROUTE' && (
                                    <button onClick={() => handleAccomplish(req.id)} className="btn-premium btn-primary" style={{ flex: 1, fontSize: '0.75rem', justifyContent: 'center' }}>
                                        <CheckCircle size={16} /> MARK ARRIVED
                                    </button>
                                )}
                            </div>
                        )}
                        {req.status === 'COMPLETED' && !req.rating && (
                            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '1px solid hsla(var(--glass-border) / 0.5)', paddingTop: '1.5rem' }}>
                                <p style={{ fontSize: '0.75rem', fontWeight: 900 }}>RATE SERVICE:</p>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <Star key={star} size={24} style={{ cursor: 'pointer', fill: 'hsl(var(--primary))', opacity: 0.2 }} onClick={() => handleRating(req.id, star)} />
                                    ))}
                                </div>
                            </div>
                        )}
                        {req.status === 'COMPLETED' && req.rating && (
                            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid hsla(var(--glass-border) / 0.5)', paddingTop: '1.5rem' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 900 }}>RATED: </span>
                                {[...Array(req.rating)].map((_, i) => <Star key={i} size={16} style={{ fill: 'hsl(var(--primary))', color: 'hsl(var(--primary))' }} />)}
                            </div>
                        )}
                    </div>
                ))}
            </div>
         </section>
      </div>
    </div>
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
