import Link from 'next/link';
import { ShieldCheck, Truck, Droplet, ArrowRight, Zap, MapPin, Gauge, Shield, Clock } from 'lucide-react';

export default function Home() {
  return (
    <main style={{ paddingTop: '8rem', paddingBottom: '6rem', flexDirection: 'column' }} className="flex-center">

      {/* Hero Section */}
      <section className="container" style={{ textAlign: 'center', marginBottom: '8rem' }}>
        <div className="glass-panel animate-fade-up" style={{ padding: '5rem 2rem', maxWidth: '1000px', margin: '0 auto', position: 'relative', overflow: 'hidden' }}>
          {/* Decorative Elements */}
          <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'hsl(var(--primary) / 0.1)', borderRadius: '50%', filter: 'blur(80px)' }} />

          <div className="flex-center animate-float" style={{ marginBottom: '2.5rem' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', inset: '-25px', background: 'hsl(var(--primary) / 0.3)', borderRadius: '50%', filter: 'blur(30px)' }} />
              <ShieldCheck size={80} color="hsl(var(--primary))" style={{ position: 'relative' }} />
            </div>
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 8vw, 4rem)', marginBottom: '1.5rem', lineHeight: 1.1, letterSpacing: '-0.04em' }}>
            <span className="text-gradient">On Demand</span> <br />
            Roadside Assistance <br />
            <span style={{ fontSize: '0.6em', opacity: 0.8 }}>Kericho County</span>
          </h1>

          <p className="text-muted" style={{ fontSize: '1.35rem', marginBottom: '3.5rem', maxWidth: '700px', margin: '0 auto 3.5rem auto', lineHeight: 1.5 }}>
            Instant, professional-grade assistance is one tap away. Our AI-driven dispatch system connects you to top-tier providers in minutes.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem', maxWidth: '600px', margin: '0 auto' }}>
            <Link href="/user/dashboard" style={{ flex: '1 1 250px' }}>
              <button className="btn-premium btn-primary pulse-primary" style={{ width: '100%', padding: '1.5rem', fontSize: '1.25rem' }}>
                Get Immediate Help <ArrowRight size={22} />
              </button>
            </Link>
            <Link href="/provider/dashboard" style={{ flex: '1 1 250px' }}>
              <button className="btn-premium btn-outline" style={{ width: '100%', padding: '1.5rem', fontSize: '1.25rem' }}>
                Join as Provider
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="container" style={{ marginBottom: '10rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 className="font-heading" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Our <span className="text-gradient">Expertise</span></h2>
          <p className="text-muted" style={{ fontSize: '1.1rem' }}>Specialized emergency services designed for modern Driverss.</p>
        </div>

        <div className="grid-auto">
          <div className="premium-card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'hsl(var(--primary) / 0.1)', display: 'inline-flex', borderRadius: '20px' }}>
              <Truck size={40} color="hsl(var(--primary))" />
            </div>
            <h3 className="font-heading" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Precision Towing</h3>
            <p className="text-muted">Flatbed and wheel-lift options for luxury, EV, and standard vehicles. Handled by certified specialists.</p>
          </div>

          <div className="premium-card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'hsl(var(--accent) / 0.1)', display: 'inline-flex', borderRadius: '20px' }}>
              <Droplet size={40} color="hsl(var(--accent))" />
            </div>
            <h3 className="font-heading" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Fluid Logistics</h3>
            <p className="text-muted">High-grade fuel delivery including Premium, Diesel, and Unleaded. Direct to your stranded location.</p>
          </div>

          <div className="premium-card animate-fade-up" style={{ padding: '3rem 2rem', textAlign: 'center', transitionDelay: '300ms' }}>
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'hsl(var(--success) / 0.1)', display: 'inline-flex', borderRadius: '20px' }}>
              <Zap size={40} color="hsl(var(--success))" />
            </div>
            <h3 className="font-heading" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Rapid Recovery</h3>
            <p className="text-muted">Battery jump-starts, tire changes, and lockout services. Minimizing downtime through rapid response.</p>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section style={{ width: '100%', background: 'hsl(var(--secondary) / 0.3)', padding: '8rem 0', marginBottom: '10rem', borderTop: '1px solid hsl(var(--glass-border))', borderBottom: '1px solid hsl(var(--glass-border))' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 className="font-heading animate-fade-up" style={{ fontSize: '3rem', marginBottom: '1rem' }}>The <span className="text-gradient">Experience</span></h2>
            <p className="text-muted" style={{ fontSize: '1.1rem' }}>Seamless resolution from the moment you tap to the moment help arrives.</p>
          </div>

          <div className="grid-auto" style={{ gap: '3rem' }}>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <div style={{
                fontSize: '3rem', fontWeight: 900, opacity: 0.1, lineHeight: 1,
                fontFamily: 'Outfit'
              }}>01</div>
              <div>
                <h4 className="font-heading" style={{ fontSize: '1.5rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Gauge size={20} color="hsl(var(--primary))" /> Instant Alert
                </h4>
                <p className="text-muted">Request help via our intuitive dashboard. Your location and vehicle details are encrypted and broadcasted to nearby responders.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem' }}>
              <div style={{
                fontSize: '3rem', fontWeight: 900, opacity: 0.1, lineHeight: 1,
                fontFamily: 'Outfit'
              }}>02</div>
              <div>
                <h4 className="font-heading" style={{ fontSize: '1.5rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Shield size={20} color="hsl(var(--accent))" /> Verified Dispatch
                </h4>
                <p className="text-muted">Our smart algorithm assigns the most qualified, highly-rated provider within your immediate vicinity.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem' }}>
              <div style={{
                fontSize: '3rem', fontWeight: 900, opacity: 0.1, lineHeight: 1,
                fontFamily: 'Outfit'
              }}>03</div>
              <div>
                <h4 className="font-heading" style={{ fontSize: '1.5rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Clock size={20} color="hsl(var(--success))" /> Precision Track
                </h4>
                <p className="text-muted">Monitor your responder in real-time with precise GPS tracking and accurate ETA updates until the resolution is complete.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Quote */}
      <section className="container" style={{ textAlign: 'center', marginBottom: '10rem' }}>
        <div className="glass-panel" style={{ padding: '6rem 3rem', background: 'linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--accent) / 0.05))' }}>
          <h2 className="font-heading" style={{ fontSize: '2.5rem', fontStyle: 'italic', maxWidth: '800px', margin: '0 auto 2rem auto', fontWeight: 600 }}>
            "In a moment of vulnerability, RoadSafe provided the speed and professionalism I didn't think was possible in roadside assistance."
          </h2>
          <div className="flex-center" style={{ gap: '1rem' }}>
            <div style={{ width: '40px', height: '1px', background: 'hsl(var(--primary))' }} />
            <span style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Precious Atamba  EV Owner </span>
            <div style={{ width: '40px', height: '1px', background: 'hsl(var(--primary))' }} />
          </div>
        </div>
      </section>

    </main>
  );
}
