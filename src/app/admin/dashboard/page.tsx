"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Activity, TrendingUp, List, CheckCircle, AlertCircle, Users, Truck, Navigation, MapPin, Plus, Phone, Calendar, Mail, Shield, UserPlus, X, Edit } from 'lucide-react';
import SimulationMap from '@/components/LiveTrackerWrapper';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('NETWORK');
    const [stats, setStats] = useState<any>(null);
    const [recentRequests, setRecentRequests] = useState<any[]>([]);
    const [allSuppliers, setAllSuppliers] = useState<any[]>([]);
    const [allMotorists, setAllMotorists] = useState<any[]>([]);
    const [listType, setListType] = useState('PROVIDERS');
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newUser, setNewUser] = useState({ 
        name: '', email: '', password: '', role: 'Drivers', 
        phone: '', businessName: '', serviceType: 'TOWING' 
    });
    const [editingUserId, setEditingUserId] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const [statsRes, usersRes] = await Promise.all([
                fetch('/api/admin/stats'),
                fetch('/api/admin/users')
            ]);
            const sData = await statsRes.json();
            const uData = await usersRes.json();

            setStats(sData.stats);
            setRecentRequests(Array.isArray(sData.requests) ? sData.requests : []);
            
            const usersArray = Array.isArray(uData) ? uData : [];
            setAllSuppliers(usersArray.filter((u: any) => u.role === 'PROVIDER'));
            setAllMotorists(usersArray.filter((u: any) => u.role !== 'PROVIDER' && u.role !== 'ADMIN'));
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

    const handleToggleSuspend = async (userId: string, currentStatus: boolean, role: string) => {
        const nextStatus = !currentStatus;

        // Optimistic UI update
        if (role === 'PROVIDER') {
            setAllSuppliers(prev => prev.map(s => s.id === userId ? { ...s, isSuspended: nextStatus } : s));
        } else {
            setAllMotorists(prev => prev.map(m => m.id === userId ? { ...m, isSuspended: nextStatus } : m));
        }

        try {
            const res = await fetch('/api/admin/suspend', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, isSuspended: nextStatus })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
        } catch (err) {
            alert('Core Error: Suspend action failed.');
            fetchData();
        }
    };

    const handleSaveUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingUserId ? '/api/admin/users' : '/api/admin/users';
            const method = editingUserId ? 'PATCH' : 'POST';
            const body = editingUserId ? { userId: editingUserId, ...newUser } : newUser;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (data.success) {
                alert(editingUserId ? 'Account details updated successfully!' : 'Account securely registered in Kericho Hub!');
                setShowAddForm(false);
                setEditingUserId(null);
                setNewUser({ name: '', email: '', password: '', role: 'Drivers', phone: '', businessName: '', serviceType: 'TOWING' });
                fetchData();
            } else {
                alert(data.error || 'Operation failed');
            }
        } catch (err) {
            alert('System Link Error.');
        }
    };

    const startEditing = (u: any) => {
        setEditingUserId(u.id);
        setNewUser({
            name: u.name,
            email: u.email,
            password: '', // Leave empty for edits unless you want to support pwd resets here
            role: u.role,
            phone: u.phone || '',
            businessName: u.businessName || '',
            serviceType: u.serviceType || 'TOWING'
        });
        setShowAddForm(true);
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
                            <StatCard label="Waiting Motorists" value={stats?.pendingRequests || 0} grow="Users currently in need or waiting" />
                            <StatCard label="Profit Tracker" value={`KES ${stats?.totalCommission?.toLocaleString() || '0'}`} grow="+10% / Dispatch" />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '2.5rem' }}>
                            <div className="glass-panel" style={{ padding: '2rem' }}>
                                <h3 className="font-heading" style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Service Dispatch Registry</h3>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ opacity: 0.5, fontSize: '0.75rem', borderBottom: '1px solid hsl(var(--glass-border))' }}>
                                        <tr>
                                            <th style={{ padding: '1rem', textAlign: 'left' }}>Drivers</th>
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

                            <div className="glass-panel" style={{ padding: '2rem', border: '1.5px solid hsla(var(--primary) / 0.2)', maxHeight: '800px', overflowY: 'auto' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 className="font-heading" style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        Core Registry 
                                        <button onClick={() => setShowAddForm(true)} className="btn-premium btn-primary" style={{ padding: '0.4rem', borderRadius: '50%' }}>
                                            <Plus size={16} />
                                        </button>
                                    </h3>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => setListType('PROVIDERS')} className={`btn-premium ${listType === 'PROVIDERS' ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem' }}>Providers</button>
                                        <button onClick={() => setListType('MOTORISTS')} className={`btn-premium ${listType === 'MOTORISTS' ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem' }}>Motorists</button>
                                    </div>
                                </div>

                                {showAddForm && (
                                    <div className="glass-panel animate-fade-up" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid hsl(var(--primary))' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <h4 style={{ fontWeight: 900, fontSize: '0.8rem' }}>{editingUserId ? 'EDIT REGISTRY ACCOUNT' : 'DIRECT ACCOUNT REGISTRATION'}</h4>
                                            <button onClick={() => { setShowAddForm(false); setEditingUserId(null); }}><X size={16} /></button>
                                        </div>
                                        <form onSubmit={handleSaveUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <input className="input-elegant" placeholder="Full Name" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} required />
                                            <input className="input-elegant" placeholder="Email Address" type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required />
                                            {!editingUserId && <input className="input-elegant" placeholder="Security Password" type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required />}
                                            <input className="input-elegant" placeholder="Phone Link" value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} />
                                            <select className="input-elegant" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                                                <option value="Drivers">Motorist (Driver)</option>
                                                <option value="PROVIDER">Service Provider (Supplier)</option>
                                            </select>
                                            {newUser.role === 'PROVIDER' && (
                                                <>
                                                    <input className="input-elegant" placeholder="Business Name" value={newUser.businessName} onChange={e => setNewUser({...newUser, businessName: e.target.value})} />
                                                    <select className="input-elegant" value={newUser.serviceType} onChange={e => setNewUser({...newUser, serviceType: e.target.value})}>
                                                        <option value="TOWING">Towing</option>
                                                        <option value="FUEL">Fuel Support</option>
                                                        <option value="MECHANICAL">Mechanical</option>
                                                        <option value="TYRE">Tyre Fix</option>
                                                        <option value="BATTERY">Battery Jump</option>
                                                        <option value="BOTH">Full Support</option>
                                                    </select>
                                                </>
                                            )}
                                            <button type="submit" className="btn-premium btn-primary" style={{ gridColumn: 'span 2' }}>{editingUserId ? 'COMMIT CHANGES' : 'ENABLE SYSTEM ACCESS'}</button>
                                        </form>
                                    </div>
                                )}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {listType === 'PROVIDERS' ? allSuppliers.map(s => (
                                        <div key={s.id} style={{ padding: '1.25rem', borderRadius: '20px', background: s.isApproved ? (s.isSuspended ? 'hsla(var(--danger) / 0.1)' : 'transparent') : 'hsla(var(--primary) / 0.05)', border: `1px solid ${s.isSuspended ? 'hsl(var(--danger))' : 'hsla(var(--glass-border) / 0.5)'}` }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <p style={{ fontWeight: 800, fontSize: '0.9rem', color: s.isSuspended ? 'hsl(var(--danger))' : 'inherit', textDecoration: s.isSuspended ? 'line-through' : 'none' }}>{s.businessName || s.name}</p>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.3rem' }}>
                                                        <p style={{ fontSize: '0.65rem', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Mail size={10} /> {s.email}</p>
                                                        <p style={{ fontSize: '0.65rem', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Phone size={10} /> {s.phone || '---'}</p>
                                                        <p style={{ fontSize: '0.65rem', opacity: 0.8, fontWeight: 700, color: 'hsl(var(--primary))' }}>Joined: {new Date(s.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button onClick={() => startEditing(s)} className="btn-premium btn-outline" style={{ padding: '0.4rem', borderRadius: '50%', color: 'hsl(var(--primary))' }} title="Edit Details"><Edit size={12} /></button>
                                                    <button
                                                        onClick={() => handleToggleSuspend(s.id, s.isSuspended, 'PROVIDER')}
                                                        className="btn-premium btn-outline"
                                                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.65rem', borderRadius: 'var(--radius-full)', color: s.isSuspended ? 'var(--fg)' : 'hsl(var(--danger))', borderColor: s.isSuspended ? 'var(--glass-border)' : 'hsla(var(--danger)/0.5)' }}>
                                                        {s.isSuspended ? 'Unsuspend' : 'Ban'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(s.id, s.isApproved)}
                                                        className={`btn-premium ${s.isApproved ? 'btn-outline' : 'btn-primary'}`}
                                                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.65rem', borderRadius: 'var(--radius-full)' }}>
                                                        {s.isApproved ? 'Revoke' : 'Approve'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )) : allMotorists.map(m => (
                                        <div key={m.id} style={{ padding: '1.25rem', borderRadius: '20px', background: m.isSuspended ? 'hsla(var(--danger) / 0.1)' : 'transparent', border: `1px solid ${m.isSuspended ? 'hsl(var(--danger))' : 'hsla(var(--glass-border) / 0.5)'}` }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <p style={{ fontWeight: 800, fontSize: '0.9rem', color: m.isSuspended ? 'hsl(var(--danger))' : 'inherit', textDecoration: m.isSuspended ? 'line-through' : 'none' }}>{m.name}</p>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.3rem' }}>
                                                        <p style={{ fontSize: '0.65rem', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Mail size={10} /> {m.email}</p>
                                                        <p style={{ fontSize: '0.65rem', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Phone size={10} /> {m.phone || '---'}</p>
                                                        <p style={{ fontSize: '0.65rem', opacity: 0.8, fontWeight: 700, color: 'hsl(var(--primary))' }}>Joined: {new Date(m.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <button onClick={() => startEditing(m)} className="btn-premium btn-outline" style={{ padding: '0.4rem', borderRadius: '50%', color: 'hsl(var(--primary))' }} title="Edit Details"><Edit size={12} /></button>
                                                    <button
                                                        onClick={() => handleToggleSuspend(m.id, m.isSuspended, 'MOTORIST')}
                                                        className="btn-premium btn-outline"
                                                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.65rem', borderRadius: 'var(--radius-full)', color: m.isSuspended ? 'var(--fg)' : 'hsl(var(--danger))', borderColor: m.isSuspended ? 'var(--glass-border)' : 'hsla(var(--danger)/0.5)' }}>
                                                        {m.isSuspended ? 'Unsuspend' : 'Ban'}
                                                    </button>
                                                </div>
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
