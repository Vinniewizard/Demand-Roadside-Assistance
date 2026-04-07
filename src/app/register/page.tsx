"use client";

import { useState } from 'react';
import Link from 'next/link';
import { User, Mail, Lock, Phone, Car, FileText, ArrowRight, Truck } from 'lucide-react';

export default function RegisterPage() {
  const [role, setRole] = useState('MOTORIST');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
      phone: '',
      licenseNumber: '',
      vehiclePlate: '',
      businessName: ''
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ ...formData, role })
        });
        const data = await res.json();
        
        if (data.error) alert(data.error);
        else {
            localStorage.setItem('user', JSON.stringify(data));
            window.location.href = role === 'MOTORIST' ? '/user/dashboard' : '/provider/dashboard';
        }
    } catch (err) {
        alert('Kericho Hub Connection Error. Try again.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', padding: '8rem 2rem 4rem', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel animate-fade-up" style={{ width: '100%', maxWidth: '600px', padding: '4rem' }}>
        <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 className="font-heading" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Join the Network</h1>
          <p className="text-muted">Register as a Motorist or a Kericho Service Supplier</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
            <div onClick={() => setRole('MOTORIST')} className={`glass-panel`} style={{ padding: '1rem', textAlign: 'center', cursor: 'pointer', border: role === 'MOTORIST' ? '2px solid hsl(var(--primary))' : '1px solid transparent' }}>
                <User size={24} color={role === 'MOTORIST' ? 'hsl(var(--primary))' : 'inherit'} style={{ margin: '0 auto 0.5rem' }} />
                <p style={{ fontWeight: 800, fontSize: '0.8rem' }}>MOTORIST</p>
            </div>
            <div onClick={() => setRole('PROVIDER')} className={`glass-panel`} style={{ padding: '1rem', textAlign: 'center', cursor: 'pointer', border: role === 'PROVIDER' ? '2px solid hsl(var(--primary))' : '1px solid transparent' }}>
                <Truck size={24} color={role === 'PROVIDER' ? 'hsl(var(--primary))' : 'inherit'} style={{ margin: '0 auto 0.5rem' }} />
                <p style={{ fontWeight: 800, fontSize: '0.8rem' }}>SUPPLIER</p>
            </div>
        </div>

        <form onSubmit={handleRegister} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <input placeholder="Full Legal Name" className="input-elegant" required onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <input type="email" placeholder="Email Address" className="input-elegant" required onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          <div>
            <input type="tel" placeholder="Phone Number" className="input-elegant" required onChange={(e) => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <input type="password" placeholder="Access Key / Password" className="input-elegant" required onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>
          
          {role === 'MOTORIST' ? (
              <>
                 <div><input placeholder="Vehicle Number Plate" className="input-elegant" required onChange={(e) => setFormData({...formData, vehiclePlate: e.target.value})} /></div>
                 <div><input placeholder="Driver License Number" className="input-elegant" required onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})} /></div>
              </>
          ) : (
              <div style={{ gridColumn: 'span 2' }}>
                <input placeholder="Business Name (e.g., Total Station Kericho)" className="input-elegant" required onChange={(e) => setFormData({...formData, businessName: e.target.value})} />
              </div>
          )}

          <div style={{ gridColumn: 'span 2' }}>
             <button disabled={loading} className="btn-premium btn-primary" style={{ width: '100%', padding: '1.25rem', justifyContent: 'center' }}>
                {loading ? 'SYNCING...' : <>COMPLETE REGISTRATION <ArrowRight size={20} /></>}
             </button>
          </div>
        </form>

        <footer style={{ marginTop: '3rem', textAlign: 'center' }}>
           <p className="text-muted" style={{ fontSize: '0.9rem' }}>
             Already registered? <Link href="/login" style={{ color: 'hsl(var(--primary))', fontWeight: 700, textDecoration: 'none' }}>Secure Access</Link>
           </p>
        </footer>
      </div>
    </div>
  );
}
