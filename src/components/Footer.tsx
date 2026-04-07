import Link from 'next/link';
import { ShieldCheck, Globe, GitBranch, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      background: 'hsl(var(--bg) / 0.8)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid hsl(var(--glass-border))',
      padding: '4rem 1.5rem 2rem',
      position: 'relative',
      zIndex: 10
    }}>
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '4rem',
        marginBottom: '4rem',
        maxWidth: '1200px',
        margin: '0 auto 4rem auto'
      }}>
        <div style={{ maxWidth: '300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <ShieldCheck size={28} color="hsl(var(--primary))" />
            <span style={{ fontSize: '1.5rem', fontWeight: 900 }} className="font-heading text-gradient">Drivers Control</span>
          </div>
          <p className="text-muted" style={{ fontSize: '0.95rem', marginBottom: '1.5rem' }}>
            The Kericho Hub emergency response system. Our mission is to ensure no Drivers ever feels stranded in the region.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="#" className="btn-premium btn-outline" style={{ padding: '0.5rem', borderRadius: '10px' }}>
              <Globe size={18} />
            </Link>
            <Link href="#" className="btn-premium btn-outline" style={{ padding: '0.5rem', borderRadius: '10px' }}>
              <GitBranch size={18} />
            </Link>
            <Link href="#" className="btn-premium btn-outline" style={{ padding: '0.5rem', borderRadius: '10px' }}>
              <Mail size={18} />
            </Link>
          </div>
        </div>

        <div>
          <h4 className="font-heading" style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Platform</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li><Link href="/user/dashboard" style={{ color: 'inherit', textDecoration: 'none', fontSize: '0.9rem', opacity: 0.7 }}>Consumer Portal</Link></li>
            <li><Link href="/provider/dashboard" style={{ color: 'inherit', textDecoration: 'none', fontSize: '0.9rem', opacity: 0.7 }}>Provider Interface</Link></li>
            <li><Link href="#" style={{ color: 'inherit', textDecoration: 'none', fontSize: '0.9rem', opacity: 0.7 }}>Real-time Dispatch</Link></li>
            <li><Link href="#" style={{ color: 'inherit', textDecoration: 'none', fontSize: '0.9rem', opacity: 0.7 }}>Enterprise Fleet</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading" style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Support</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li><Link href="#" style={{ color: 'inherit', textDecoration: 'none', fontSize: '0.9rem', opacity: 0.7 }}>Help Center</Link></li>
            <li><Link href="#" style={{ color: 'inherit', textDecoration: 'none', fontSize: '0.9rem', opacity: 0.7 }}>Privacy Policy</Link></li>
            <li><Link href="#" style={{ color: 'inherit', textDecoration: 'none', fontSize: '0.9rem', opacity: 0.7 }}>Terms of Service</Link></li>
            <li><Link href="#" style={{ color: 'inherit', textDecoration: 'none', fontSize: '0.9rem', opacity: 0.7 }}>Safety Guidelines</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading" style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Regional Core</h4>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>Serving the Kericho cluster with precision emergency response.</p>
          <button className="btn-premium btn-primary" style={{ marginTop: '1rem', width: '100%', fontSize: '0.8rem', padding: '0.75rem' }}>HUB STATUS: ONLINE</button>
        </div>
      </div>

      <div style={{ textAlign: 'center', paddingTop: '2rem', borderTop: '1px solid hsl(var(--glass-border) / 0.5)', opacity: 0.5, fontSize: '0.8rem' }}>
        © 2026 Roadside Assistance Platform | Kericho County. All rights reserved.
      </div>
    </footer>
  );
}
