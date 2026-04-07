export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ flex: 1, padding: '7rem 1.5rem 4rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="container" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {children}
      </div>
    </div>
  );
}
