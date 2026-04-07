import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'Kericho Rescue: On Demand Roadside Assistance',
  description: 'Instant, professional-grade roadside rescue specifically tailored for Kericho Driverss. Rapid dispatch, transparent pricing, and verified providers.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className={inter.className}>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <div className="hero-gradient" />
          <Navbar />
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
