"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LogOut, ShieldCheck, User, Wrench, Navigation, MapPin, Key } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const isUser = pathname.startsWith('/user');
  const isProvider = pathname.startsWith('/provider');
  const isAdmin = pathname.startsWith('/admin');
  const isAuth = pathname === '/login' || pathname === '/register';

  return (
    <header style={{ padding: '1.5rem', display: 'flex', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
      <nav className="glass-panel" style={{ 
        padding: '0.75rem 2rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        maxWidth: '1200px', 
        width: '100%',
        borderRadius: 'var(--radius-full)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${isProvider ? 'hsl(var(--accent) / 0.2)' : 'hsl(var(--glass-border))'}`
      }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ fontWeight: 800, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="font-heading">
            <div style={{ 
              padding: '0.4rem', 
              background: isProvider ? 'hsl(var(--accent) / 0.15)' : 'hsl(var(--primary) / 0.15)', 
              borderRadius: '10px' 
            }}>
              {isProvider ? <Navigation size={20} color="hsl(var(--accent))" /> : <ShieldCheck size={20} color="hsl(var(--primary))" />}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                <span className={isProvider ? "" : "text-gradient"} style={{ fontSize: '1.1rem' }}>Demand Roadside</span>
                <span style={{ fontSize: '0.65rem', opacity: 0.6, letterSpacing: '0.1em', fontWeight: 900 }}>KERICHO REGION</span>
            </div>
          </div>
        </Link>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link href="/">
            <button className={`btn-premium btn-outline ${pathname === '/' ? 'active' : ''}`} style={{ padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-full)', fontSize: '0.9rem' }}>
              <Home size={16} /> <span className="mobile-hide">Home</span>
            </button>
          </Link>
          
          {isAdmin && (
            <Link href="/admin/dashboard">
               <button className={`btn-premium btn-outline active`} style={{ padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-full)', fontSize: '0.9rem' }}>
                  Admin Core
               </button>
            </Link>
          )}

          {!isAuth && !isUser && !isProvider && !isAdmin && (
            <Link href="/login">
               <button className="btn-premium btn-primary" style={{ padding: '0.6rem 1.5rem', borderRadius: 'var(--radius-full)', fontSize: '0.9rem' }}>
                  <Key size={16} /> Login
               </button>
            </Link>
          )}

          {(isUser || isProvider || isAdmin) && (
            <>
               <div style={{ width: '1px', height: '20px', background: 'hsl(var(--glass-border))', margin: '0 0.25rem' }} />
               <Link href="/login">
                  <button className="btn-premium btn-outline" style={{ 
                      padding: '0.6rem 1.25rem', 
                      borderRadius: 'var(--radius-full)', 
                      fontSize: '0.9rem',
                      color: 'hsl(var(--danger))',
                      borderColor: 'hsl(var(--danger) / 0.2)'
                    }}>
                    <LogOut size={16} /> <span className="mobile-hide">Logout</span>
                  </button>
               </Link>
            </>
          )}

          {!isAuth && (
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: 'var(--radius-full)', 
              background: isProvider ? 'hsl(var(--accent))' : 'hsl(var(--primary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: isProvider ? 'var(--shadow-accent)' : 'var(--shadow-primary)'
            }}>
              {isProvider ? <Wrench size={20} /> : <User size={20} />}
            </div>
          )}
        </div>
      </nav>

      <style jsx>{`
        @media (max-width: 640px) {
          .mobile-hide { display: none; }
        }
      `}</style>
    </header>
  );
}
