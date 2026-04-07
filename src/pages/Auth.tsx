import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Building2, Home } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const Sclient = createClient(supabaseUrl, supabaseKey);

async function adduser(uid: string, email: string, fullName: string, role: string, contact: string) {
  const { error: userError } = await Sclient
    .from("users")
    .insert({ 
      uid: uid,
      uname: fullName, 
      email: email, 
      role: role
    });
  
  if (userError) throw userError;

  if (role === "Owner") {
    const { error: ownerError } = await Sclient
      .from("owners")
      .insert({
        uid: uid,
        name: fullName,
        contact: contact || null,
      });
    if (ownerError) throw ownerError;
  } else if (role === "Tenant") {
    const { error: tenantError } = await Sclient
      .from("tenants")
      .insert({
        uid: uid,
        Name: fullName,
        contact: contact || null,
      });
    if (tenantError) throw tenantError;
  }
}

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [contact, setContact] = useState("");
  const [role, setRole] = useState<"Owner" | "Tenant">("Owner");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await Sclient.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/properties");
      } else {
        const { data, error: authError } = await Sclient.auth.signUp({
          email,
          password,
        });

        if (authError) throw authError;

        if (data.user) {
          await adduser(data.user.id, email, fullName, role, contact); 
        }

        toast({ 
          title: "Account created!", 
          description: "You can now sign in.",
          className: "bg-green-500 text-white" 
        });
        setIsLogin(true);
      }
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message, 
        variant: "destructive", 
        className: "bg-red-500 text-white" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4" style={{
      background: 'linear-gradient(135deg, #0a0a0f 0%, #0d0d1a 50%, #0a0f0a 100%)',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@600;700;800&display=swap');

        .glass-panel {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px;
          backdrop-filter: blur(20px);
          overflow: hidden;
        }
        .input-dark {
          width: 100%;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 12px 14px;
          color: rgba(255, 255, 255, 0.9);
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        .input-dark:focus {
          border-color: rgba(134,239,172,0.4);
          background: rgba(255,255,255,0.06);
        }
        .label-dark {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 8px;
          margin-left: 4px;
        }
        .role-btn {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.02);
          color: rgba(255,255,255,0.4);
          transition: all 0.2s ease;
        }
        .role-btn.active {
          border-color: #4ade80;
          background: rgba(74, 222, 128, 0.05);
          color: #4ade80;
          box-shadow: 0 0 15px rgba(74, 222, 128, 0.1);
        }
        .btn-auth {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #4ade80, #22c55e);
          color: #052e16;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 10px;
        }
        .btn-auth:hover { opacity: 0.9; transform: translateY(-1px); }
        .top-line {
          height: 4px;
          background: linear-gradient(90deg, #4ade80, #22d3ee);
          width: 100%;
        }
      `}</style>

      <div className="w-full max-w-md glass-panel shadow-2xl">
        <div className="top-line" />
        
        <div className="p-8">
          <header className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl" style={{
              background: 'rgba(74, 222, 128, 0.1)',
              border: '1px solid rgba(74, 222, 128, 0.2)'
            }}>
              <Building2 className="h-7 w-7 text-[#4ade80]" />
            </div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 28, color: '#fff', margin: 0 }}>
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, marginTop: 6 }}>
              {isLogin ? "Sign in to manage your properties" : "Start managing real estate today"}
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                <div>
                  <label className="label-dark">Full Name</label>
                  <input className="input-dark" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" required />
                </div>

                <div>
                  <label className="label-dark">Contact (Phone)</label>
                  <input className="input-dark" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="+1 234 567 8901" />
                </div>
                
                <div>
                  <label className="label-dark">Select Role</label>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setRole("Owner")} className={`role-btn ${role === "Owner" ? "active" : ""}`}>
                      <Building2 className="h-5 w-5" />
                      <span className="text-xs font-bold uppercase tracking-wider">Owner</span>
                    </button>
                    <button type="button" onClick={() => setRole("Tenant")} className={`role-btn ${role === "Tenant" ? "active" : ""}`}>
                      <Home className="h-5 w-5" />
                      <span className="text-xs font-bold uppercase tracking-wider">Tenant</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="label-dark">Email Address</label>
              <input type="email" className="input-dark" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>

            <div>
              <label className="label-dark">Password</label>
              <input type="password" className="input-dark" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
            </div>

            <button type="submit" disabled={loading} className="btn-auth">
              {loading ? "Authenticating..." : isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button onClick={() => setIsLogin(!isLogin)} className="font-bold text-[#4ade80] hover:underline transition-all">
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
