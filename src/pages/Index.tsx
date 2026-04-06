import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building2, Search, PlusCircle, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: Search, title: "Smart Search", desc: "Filter properties by type, status, location and more." },
  { icon: PlusCircle, title: "Easy Listings", desc: "Add new properties with all details in seconds." },
  { icon: ShieldCheck, title: "Secure Access", desc: "Role-based authentication keeps your data safe." },
];

const Index = () => {
return (
    <div className="flex flex-col min-h-screen relative overflow-hidden" style={{
      /* Highly Dynamic Aura Background */
      background: `
        radial-gradient(at 0% 0%, rgba(74, 222, 128, 0.08) 0px, transparent 50%),
        radial-gradient(at 100% 0%, rgba(59, 130, 246, 0.08) 0px, transparent 50%),
        radial-gradient(at 50% 50%, rgba(13, 13, 26, 1) 0px, transparent 100%),
        radial-gradient(at 80% 80%, rgba(74, 222, 128, 0.05) 0px, transparent 40%),
        #050508
      `,
      /* Updated to Segoe UI */
      fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    }}>
      
      {/* Moving Ambient Light Layers */}
      <div className="absolute inset-0 pointer-events-none opacity-60">
        <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-[#4ade80]/5 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(24px);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .glass-card:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(74, 222, 128, 0.25);
          transform: translateY(-8px);
          box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.5);
        }
        .btn-primary {
          background: #4ade80;
          color: #052e16;
          font-weight: 700;
          padding: 14px 36px;
          border-radius: 12px;
          font-size: 14px;
          transition: all 0.3s ease;
          letter-spacing: 0.02em;
        }
        .btn-primary:hover {
          background: #22c55e;
          transform: scale(1.03);
          box-shadow: 0 0 30px rgba(74, 222, 128, 0.3);
        }
        .btn-outline {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          font-weight: 600;
          padding: 14px 36px;
          border-radius: 12px;
          font-size: 14px;
          transition: all 0.3s ease;
        }
        .btn-outline:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative flex min-h-[85vh] items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 max-w-4xl"
        >
          <div className="mx-auto mb-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#4ade80]/20 bg-[#4ade80]/5"
               style={{ animation: 'float 5s ease-in-out infinite' }}>
            <Building2 className="h-8 w-8 text-[#4ade80]" />
          </div>

          <h1 className="mb-6 text-white leading-[1.1] tracking-tight" style={{ 
            fontSize: 'clamp(2.8rem, 7vw, 4.8rem)', 
            fontWeight: 900 
          }}>
            Manage Your <br />
            <span className="text-[#4ade80]" style={{ textShadow: '0 0 40px rgba(74, 222, 128, 0.15)' }}>
              Real Estate
            </span> Portfolio
          </h1>

          {/* Line updated as requested */}
          <p className="mx-auto mb-12 max-w-2xl text-lg sm:text-xl text-white/90 font-medium">
             A powerful DBMS to search, list, and manage properties — all in one place.
          </p>

          <div className="flex flex-col items-center justify-center gap-5 sm:flex-row">
            <Link to="/auth">
              <button className="btn-primary uppercase tracking-widest">Get Started</button>
            </Link>
            <Link to="/properties">
              <button className="btn-outline uppercase tracking-widest">Browse Assets</button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-24 relative z-10">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          {features.map((f) => (
            <motion.div
              key={f.title}
              className="glass-card p-12 rounded-[32px] text-center"
            >
              <div className="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/5 bg-white/5">
                <f.icon className="h-7 w-7 text-[#4ade80]" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-white tracking-tight">{f.title}</h3>
              <p className="text-sm sm:text-base leading-relaxed text-white/30 font-medium">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
