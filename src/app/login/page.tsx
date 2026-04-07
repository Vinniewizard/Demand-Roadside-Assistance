"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, User as UserIcon } from 'lucide-react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (data.error) alert(data.error);
      else {
        // CRITICAL: Successfully save the persistent session
        localStorage.setItem('user', JSON.stringify(data));
        window.location.href = data.role === 'Drivers' ? '/user/dashboard' : '/provider/dashboard';
      }
    } catch (err) {
      alert('Kericho Hub Authentication Error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', padding: '8rem 2rem', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel animate-fade-up" style={{ width: '100%', maxWidth: '480px', padding: '4rem 3rem' }}>
        <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', background: 'hsl(var(--primary) / 0.1)', borderRadius: '20px', marginBottom: '1.5rem' }}>
            <ShieldCheck size={40} color="hsl(var(--primary))" />
          </div>
          <h1 className="font-heading" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Kericho Hub</h1>
          <p className="text-muted">Enter your secure Drivers or supplier key</p>
        </header>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'hsl(var(--primary))', marginBottom: '0.5rem', display: 'block' }}>Email Address</label>
            <input
              type="email"
              required
              placeholder="name@kericho.com"
              className="input-elegant"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'hsl(var(--primary))', marginBottom: '0.5rem', display: 'block' }}>Access Key</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="input-elegant"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            disabled={loading}
            className="btn-premium btn-primary"
            style={{ width: '100%', padding: '1.25rem', marginTop: '1rem', justifyContent: 'center' }}>
            {loading ? 'AUTHENTICATING...' : <>SECURE LOGIN <ArrowRight size={20} /></>}
          </button>
        </form>

        <footer style={{ marginTop: '3rem', textAlign: 'center', paddingTop: '2rem', borderTop: '1px solid hsl(var(--glass-border))' }}>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>
            New to the Platform? <Link href="/register" style={{ color: 'hsl(var(--primary))', fontWeight: 700, textDecoration: 'none' }}>Join Network</Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
