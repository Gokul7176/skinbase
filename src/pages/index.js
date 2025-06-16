import SkincareStore from './skincare/SkincareStore';

export default function HomePage() {
  return (
    <div style={{ fontFamily: 'Segoe UI', padding: '30px', textAlign: 'center', background: '#f4f9f4', minHeight: '100vh' }}>
      <h1 style={{ color: '#2e7d32' }}>🌿 gokul SKINCARE</h1>
      <SkincareStore />
    </div>
  );
}
