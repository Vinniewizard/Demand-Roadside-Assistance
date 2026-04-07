"use client";

import { useEffect, useState } from 'react';
import { Truck, MapPin, Clock, CreditCard, Navigation, Activity, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';
import SimulationMap from '@/components/LiveTrackerWrapper';

export default function ProviderDashboard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  const activeJob = jobs.find(j => j.status === 'ACCEPTED' || j.status === 'EN_ROUTE');

  const fetchJobs = async () => {
    try {
        const res = await fetch('/api/admin/stats'); 
        const data = await res.json();
        setJobs((data.requests || []).filter((r: any) => r.status !== 'CANCELLED'));
    } catch (err) {
        console.error('Supplier Feed Error:', err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('user');
    let uid = '';
    if (saved) {
        const u = JSON.parse(saved);
        setUser(u);
        uid = u.id;
    }
    fetchJobs();
    const interval = setInterval(fetchJobs, 10000);

    let trackInterval: any;
    if (navigator.geolocation && uid) {
        trackInterval = setInterval(() => {
            navigator.geolocation.getCurrentPosition((pos) => {
                fetch('/api/user/profile', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: uid, latitude: pos.coords.latitude, longitude: pos.coords.longitude })
                }).then(r => r.json()).then(data => {
                    if (data.user) {
                        setUser(data.user);
                        localStorage.setItem('user', JSON.stringify(data.user));
                    }
                }).catch(() => {});
            }, () => {}, { enableHighAccuracy: true });
        }, 8000); // 8-second rapid background ping similar to Uber
    }

    return () => {
        clearInterval(interval);
        if (trackInterval) clearInterval(trackInterval);
    };
  }, []);

  const handleUpdateStatus = async (id: string, status: string, isPaid: boolean = false) => {
    try {
        await fetch(`/api/requests/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, isPaid })
        });
        fetchJobs(); 
    } catch (err) {
        alert('Kericho Hub Sync Error');
    }
  };

  if (loading) return <div style={{ padding: '8rem' }}>Kericho Hub: Synchronizing...</div>;

  return (
    <div className="container-main" style={{ padding: '4rem 2rem', maxWidth: '1600px', margin: '0 auto' }}>
      <header className="header-mobile" style={{ marginBottom: '4rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem' }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h1 className="font-heading text-gradient" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, lineHeight: 1.1 }}>Supplier Center</h1>
          <p className="text-muted" style={{ fontSize: 'clamp(0.85rem, 2vw, 1.1rem)', marginTop: '0.5rem', fontWeight: 600, letterSpacing: '0.05em' }}>{user?.businessName || user?.name} | Kericho Cluster Hub</p>
        </div>
      </header>

      {/* MASTER ACTIVE JOB RADAR */}
      {activeJob && (
          <div className="glass-panel animate-fade-up" style={{ padding: '2.5rem', marginBottom: '4rem', border: '2px solid hsla(var(--success) / 0.3)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <div>
                      <h2 className="font-heading" style={{ fontSize: '1.75rem' }}>Active Dispatch Radar</h2>
                      <p className="text-muted" style={{ fontWeight: 600 }}>Responding to {activeJob.user?.name || 'Local Driver'} • Status: {activeJob.status}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 900 }}>MISSION ID</p>
                      <p style={{ fontWeight: 900, fontSize: '1rem', color: 'hsl(var(--success))' }}>#{activeJob.id.slice(-8).toUpperCase()}</p>
                  </div>
              </div>

              <div style={{ height: '600px', borderRadius: '30px', overflow: 'hidden', border: '1px solid hsla(var(--glass-border) / 0.8)', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.25)', marginBottom: '2.5rem' }}>
                  <SimulationMap 
                      userLat={activeJob.latitude} 
                      userLon={activeJob.longitude} 
                      providerLat={user?.latitude} 
                      providerLon={user?.longitude} 
                      status={activeJob.status} 
                  />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                  <div className="glass-panel" style={{ padding: '1.5rem', background: 'hsl(var(--bg))' }}>
                      <p style={{ fontSize: '0.7rem', opacity: 0.5, fontWeight: 900 }}>REVENUE POTENTIAL</p>
                      <p style={{ fontSize: '1.8rem', fontWeight: 900, color: 'hsl(var(--success))' }}>KES {activeJob.deliveryFee?.toLocaleString()}</p>
                  </div>
                  <div className="glass-panel" style={{ padding: '1.5rem', background: 'hsl(var(--bg))' }}>
                      <p style={{ fontSize: '0.7rem', opacity: 0.5, fontWeight: 900 }}>INCIDENT TYPE</p>
                      <p style={{ fontSize: '1.8rem', fontWeight: 900 }}>{activeJob.serviceType}</p>
                  </div>
                  {activeJob.status === 'ACCEPTED' && (
                    <button onClick={() => handleUpdateStatus(activeJob.id, 'EN_ROUTE')} className="btn-premium btn-primary" style={{ height: '100%', justifyContent: 'center', fontSize: '1rem' }}>
                        <Truck size={24} /> START JOURNEY
                    </button>
                  )}
              </div>
          </div>
      )}

      <div className="grid-responsive" style={{ alignItems: 'start' }}>
          <section className="glass-panel" style={{ padding: '2.5rem' }}>
             <h2 className="font-heading" style={{ marginBottom: '2rem', fontSize: '1.25rem' }}>Dispatch & Revenue Stream</h2>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {jobs.map(job => (
                    <div key={job.id} style={{ padding: '2rem', background: job.status === 'COMPLETED' ? 'transparent' : 'hsla(var(--primary) / 0.05)', borderRadius: '24px', border: job.status === 'COMPLETED' ? '1px solid hsla(var(--glass-border) / 0.5)' : '1px solid hsla(var(--primary) / 0.3)' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div style={{ flex: '1', minWidth: '200px' }}>
                                <h3 className="font-heading" style={{ fontSize: '1.2rem' }}>{job.user?.name || 'Local Driver'}</h3>
                                <p style={{ fontSize: '0.75rem', color: 'hsl(var(--primary))', fontWeight: 900 }}>PLATE: {job.user?.vehiclePlate || '---'}</p>
                                <p style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '0.4rem' }}>Phone: {job.user?.phone || 'Not Shared'} | Licence: {job.user?.licenseNumber || '---'}</p>
                                <p style={{ fontSize: '0.7rem', opacity: 0.8 }}>Motorist ID: {job.user?.idNumber || 'Not Verified'}</p>
                                <p style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '0.6rem', borderLeft: '2px solid hsl(var(--primary))', paddingLeft: '0.5rem' }}>Location: {job.address || `GPS [${job.latitude?.toFixed(4)}, ${job.longitude?.toFixed(4)}]`}</p>
                            </div>
                            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.6rem' }}>
                                <h3 className="font-gradient" style={{ fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', fontWeight: 900, textShadow: '0 5px 15px hsla(var(--primary) / 0.3)' }}>KES {job.deliveryFee?.toLocaleString()}</h3>
                                <div style={{ padding: '0.4rem 0.8rem', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 900, background: job.isPaid ? 'hsla(var(--success) / 0.1)' : 'hsla(var(--danger) / 0.1)', color: job.isPaid ? 'hsl(var(--success))' : 'hsl(var(--danger))' }}>
                                    {job.isPaid ? 'PAYMENT CLEARED' : 'PAYMENT PENDING'}
                                </div>
                            </div>
                        </div>

                        {/* Map moved to Master Radar at top for better visibility */}

                        {job.status === 'PENDING' && (
                            <button onClick={() => handleUpdateStatus(job.id, 'ACCEPTED')} className="btn-premium btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                                <Navigation size={20} /> ACCEPT MISSION
                            </button>
                        )}

                        {job.status === 'ACCEPTED' && (
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={() => handleUpdateStatus(job.id, 'EN_ROUTE', false)} className="btn-premium btn-outline" style={{ flex: 1, justifyContent: 'center', color: 'hsl(var(--success))', borderColor: 'hsla(var(--success) / 0.3)' }}>
                                    <Truck size={20} /> START JOURNEY (EN ROUTE)
                                </button>
                            </div>
                        )}

                        {job.status === 'EN_ROUTE' && (
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', padding: '1rem', border: '1px dashed hsla(var(--primary) / 0.5)', borderRadius: '12px' }}>
                                <p style={{ fontSize: '0.8rem', opacity: 0.8 }}><Activity size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem' }} /> En route to incident. Waiting for motorist to confirm arrival and completion.</p>
                            </div>
                        )}

                        <div style={{ marginTop: '1.5rem', opacity: 0.6, fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Incident: {job.serviceType}</span>
                            <span>Status: {job.status}</span>
                        </div>
                    </div>
                ))}
             </div>
          </section>

          <section>
             <div className="glass-panel" style={{ padding: '2.5rem', background: 'linear-gradient(135deg, hsl(var(--primary) / 0.1), transparent)' }}>
                <DollarSign size={32} color="hsl(var(--primary))" style={{ marginBottom: '1rem' }} />
                <h3 className="font-heading" style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Business Hub Wallet</h3>
                <p style={{ fontSize: 'clamp(2rem, 5vw, 2.75rem)', fontWeight: 900 }}>KES {jobs.filter(j=>j.isPaid).reduce((acc, curr) => acc + (curr.deliveryFee - curr.commissionAmount), 0).toLocaleString()}</p>
                <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>Total net revenue (Cleared After Admin 10%)</p>
             </div>
          </section>
      </div>
    </div>
  );
}
