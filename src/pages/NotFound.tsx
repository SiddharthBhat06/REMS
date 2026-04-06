import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Building2 } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{
      background: 'linear-gradient(135deg, #0a0a0f 0%, #0d0d1a 50%, #0a0f0a 100%)',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Syne:wght@700;800&display=swap');

        .glass-panel {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 24px;
          backdrop-filter: blur(20px);
          padding: 60px 40px;
          max-width: 400px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
        }

        .btn-home {
          display: inline-block;
          margin-top: 24px;
          padding: 12px 32px;
          background: linear-gradient(135deg, #4ade80, #22c55e);
          color: #052e16;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: 14px;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .btn-home:hover {
          opacity: 0.9;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(74, 222, 128, 0.2);
        }

        .error-code {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 80px;
          line-height: 1;
          background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.4) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
        }

        .glow-icon {
          width: 60px;
          height: 60px;
          background: rgba(74, 222, 128, 0.1);
          border: 1px solid rgba(74, 222, 128, 0.2);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          color: #4ade80;
        }
      `}</style>

      <div className="glass-panel">
        <div className="glow-icon">
          <Building2 className="h-8 w-8" />
        </div>
        
        <h1 className="error-code">404</h1>
        
        <h2 style={{ 
          fontFamily: "'Syne', sans-serif", 
          fontSize: '20px', 
          color: '#fff', 
          marginTop: '16px',
          fontWeight: 700 
        }}>
          Lost in Space?
        </h2>
        
        <p style={{ 
          color: 'rgba(255,255,255,0.35)', 
          fontSize: '14px', 
          lineHeight: 1.6,
          marginTop: '8px'
        }}>
          The page you're looking for doesn't exist or has been moved to a different coordinate.
        </p>

        <a href="/" className="btn-home">
          Return to Earth
        </a>
      </div>
    </div>
  );
};

export default NotFound;
