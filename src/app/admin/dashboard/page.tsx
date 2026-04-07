"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Activity, TrendingUp, List, CheckCircle, AlertCircle, Users, Truck, Navigation, MapPin } from 'lucide-react';
import SimulationMap from '@/components/LiveTrackerWrapper';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('NETWORK'); 
  const [stats, setStats] = useState<any>(null);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [allSuppliers, setAllSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
        const [statsRes, usersRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/users')
        ]);
        const sData = await statsRes.json();
        const uData = await usersRes.json();
        
        setStats(sData.stats);
        setRecentRequests(sData.requests);
        setAllSuppliers(uData.filter((u: any) => u.role === 'PROVIDER'));
    } catch (err) {
        console.error('Admin Fetch Error:', err);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Poll every 15 seconds, but don't force a reset loading state
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    
    // 1. Optimistic Lock-In: Update UI instantly
    setAllSuppliers(prev => prev.map(s => 
        s.id === userId ? { ...s, isApproved: nextStatus } : s
    ));

    try {
        const res = await fetch('/api/admin/approve', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, isApproved: nextStatus })
        });
        const data = await res.json();
        
        if (!data.success) {
            throw new Error(data.error);
        }
    } catch (err) {
        alert('Kericho Core Error: Check Prisma Logs.');
        fetchData(); // Rollback to actual DB status if failed
    }
  };

  if (loading || !stats) return <div style={{ padding: '8rem' }}>Kericho Core Hub: High-Speed Link Established...</div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'hsl(var(--bg))' }}>
      <aside style={{ width: '280px', borderRight: '1px solid hsl(var(--glass-border))', padding: '2rem', background: 'hsl(var(--secondary) / 0.1)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '2.5rem' }}>
            <span style={{ fontWeight: 900, color: 'hsl(var(--primary))' }}>KERICHO HUB</span>
            <span style={{ fontSize: '0.65rem', opacity: 0.6, fontWeight: 900, letterSpacing: '0.1em' }}>ADMINISTRATIVE CENTER</span>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 700 }}>
            <TabItem active={activeTab === 'NETWORK'} label="Network Hub" icon={<Activity size={18} />} onClick={() => setActiveTab('NETWORK')} />
            <TabItem active={activeTab === 'REVENUE'} label="Revenue Center" icon={<TrendingUp size={18} />} onClick={() => setActiveTab('REVENUE')} />
            <TabItem active={activeTab === 'AUDIT'} label="Audit Registry" icon={<List size={18} />} onClick={() => setActiveTab('AUDIT')} />
        </nav>
      </aside>

      <main style={{ flex: 1, padding: '3rem' }}>
        <header style={{ marginBottom: '3.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
          <div>
            <h1 className="font-heading" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Full Governance</h1>
            <p className="text-muted">Direct Control Hub | Kericho Demand Roadside</p>
          </div>
          <div className="glass-panel" style={{ padding: '1rem 2rem' }}>
             <p style={{ fontSize: '0.75rem', fontWeight: 800, opacity: 0.6 }}>SYSTEM NET VOLUME</p>
             <h3 className="font-gradient" style={{ fontSize: '1.5rem', fontWeight: 900 }}>KES {stats?.netVolume?.toLocaleString() || '0'}</h3>
          </div>
        </header>

        {activeTab === 'NETWORK' && (
            <div className="animate-fade-up">
                <div className="grid-auto" style={{ gap: '1.5rem', marginBottom: '3.5rem' }}>
                    <StatCard label="Approved Supplies" value={allSuppliers.filter(s => s.isApproved).length} grow="Network Active" />
                    <StatCard label="Profit Tracker" value={`KES ${stats?.totalCommission?.toLocaleString() || '0'}`} grow="+10% / Dispatch" />
                    <StatCard label="Manual Override" value={allSuppliers.length} grow="Total Kericho Network" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '2.5rem' }}>
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <h3 className="font-heading" style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Service Dispatch Registry</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ opacity: 0.5, fontSize: '0.75rem', borderBottom: '1px solid hsl(var(--glass-border))' }}>
                                <tr>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>MOTORIST</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>SUPPLIER</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>STATUS</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>FEE (KES)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentRequests.map((req: any) => (
                                    <React.Fragment key={req.id}>
                                        <tr style={{ borderBottom: '1px solid hsl(var(--glass-border) / 0.3)' }}>
                                            <td style={{ padding: '1rem', fontWeight: 700 }}>{req.user?.name || 'Local Driver'}</td>
                                            <td style={{ padding: '1rem' }}>{req.provider?.businessName || req.provider?.name || '---'}</td>
                                            <td style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 900, color: req.status === 'EN_ROUTE' ? 'hsl(var(--success))' : 'inherit' }}>{req.status}</td>
                                            <td style={{ padding: '1rem', fontWeight: 800 }}>{req.deliveryFee?.toLocaleString() || '0'}</td>
                                        </tr>
                                        {(req.status === 'ACCEPTED' || req.status === 'EN_ROUTE') && (
                                            <tr key={`${req.id}-map`}>
                                                <td colSpan={4} style={{ padding: '1rem' }}>
                                                    <SimulationMap 
                                                        userLat={req.latitude} 
                                                        userLon={req.longitude} 
                                                        providerLat={req.provider?.latitude} 
                                                        providerLon={req.provider?.longitude} 
                                                        status={req.status}
                                                    />
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="glass-panel" style={{ padding: '2rem', border: '1.5px solid hsla(var(--primary) / 0.2)' }}>
                        <h3 className="font-heading" style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Platform Providers</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {allSuppliers.map(s => (
                                <div key={s.id} style={{ padding: '1.25rem', borderRadius: '20px', background: s.isApproved ? 'transparent' : 'hsla(var(--primary) / 0.05)', border: '1px solid hsla(var(--glass-border) / 0.5)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ fontWeight: 800, fontSize: '0.9rem' }}>{s.businessName || s.name}</p>
                                            <p style={{ fontSize: '0.65rem', opacity: 0.6 }}>{s.isApproved ? 'APPROVED & LIVE' : 'WAITING'}</p>
                                        </div>
                                        <button 
                                            onClick={() => handleToggleStatus(s.id, s.isApproved)}
                                            className={`btn-premium ${s.isApproved ? 'btn-outline' : 'btn-primary'}`} 
                                            style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', borderRadius: 'var(--radius-full)' }}>
                                            {s.isApproved ? 'Suspend' : 'Approve'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}

function TabItem({ active, label, icon, onClick }: any) {
    return (
        <div onClick={onClick} style={{ 
            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1.25rem', borderRadius: '15px', cursor: 'pointer',
            background: active ? 'hsla(var(--primary) / 0.15)' : 'transparent',
            color: active ? 'hsl(var(--primary))' : 'inherit',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>{icon} {label}</div>
    );
}

function StatCard({ label, value, grow, danger = false }: any) {
  return (
    <div className="glass-panel" style={{ padding: '1.5rem', border: danger ? '1.5px solid hsla(var(--danger) / 0.3)' : '1px solid hsla(var(--glass-border) / 0.5)' }}>
      <p style={{ opacity: 0.6, fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem' }}>{label}</p>
      <h3 style={{ fontSize: '1.75rem', fontWeight: 900 }}>{value}</h3>
      <p style={{ color: danger ? 'hsl(var(--danger))' : 'hsl(var(--success))', fontSize: '0.7rem', fontWeight: 900 }}>{grow}</p>
    </div>
  );
}
