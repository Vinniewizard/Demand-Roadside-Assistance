"use client";

import dynamic from 'next/dynamic';

const LiveTrackerMap = dynamic(() => import('./LiveTrackerMap'), {
    ssr: false,
    loading: () => (
        <div style={{ width: '100%', height: '240px', background: 'hsl(var(--bg))', borderRadius: '12px', border: '1px solid hsla(var(--glass-border) / 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '1rem 0' }}>
            <div className="animate-spin" style={{ width: '30px', height: '30px', border: '3px solid hsl(var(--primary))', borderTopColor: 'transparent', borderRadius: '50%' }} />
        </div>
    )
});

export default LiveTrackerMap;
