import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Building2, LogOut, Home, User, Mail, Lock, Save, ChevronRight, Phone, Plus, Key, ShoppingBag,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const Sclient = createClient(supabaseUrl, supabaseKey);

type Property = {
  pid: string;
  title: string;
  address: string;
  city: string;
  price: number;
  ptype: string;
  rooms: number;
  bath: number;
};

type ActiveTab = "listings" | "purchased" | "profile" | "password";

const Profile = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [purchasedProperties, setPurchasedProperties] = useState<Property[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>("listings");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }
      setEmail(user.email ?? "");

      const { data: userData } = await Sclient
        .from("users")
        .select("role, uname")
        .eq("uid", user.id)
        .single();

      if (userData) {
        setRole(userData.role);
        setFullName(userData.uname ?? "");
      }

      if (userData?.role === "Owner") {
        // Owner's listed properties
        const { data: ownerData } = await Sclient
          .from("owners")
          .select("contact")
          .eq("uid", user.id)
          .maybeSingle();
        if (ownerData) setContact(ownerData.contact ?? "");

        const { data: props } = await Sclient
          .from("property")
          .select("pid, title, address, city, price, ptype, rooms, bath")
          .eq("uid", user.id);
        setProperties(props ?? []);

        // Owner's PURCHASED properties (as a buyer via tenants → transactions)
        const { data: tenantData } = await Sclient
          .from("tenants")
          .select("tid")
          .eq("uid", user.id)
          .maybeSingle();

        if (tenantData) {
          const { data: txns } = await Sclient
            .from("transactions")
            .select("pid")
            .eq("tid", tenantData.tid)
            .eq("status", "active");

          if (txns && txns.length > 0) {
            const pids = txns.map((t: any) => t.pid);
            const { data: boughtProps } = await Sclient
              .from("property")
              .select("pid, title, address, city, price, ptype, rooms, bath")
              .in("pid", pids);
            setPurchasedProperties(boughtProps ?? []);
          }
        }

      } else if (userData?.role === "Tenant") {
        const { data: tenantData } = await Sclient
          .from("tenants")
          .select("tid, contact")
          .eq("uid", user.id)
          .maybeSingle();

        if (tenantData) {
          setContact(tenantData.contact ?? "");

          const { data: txns } = await Sclient
            .from("transactions")
            .select("pid")
            .eq("tid", tenantData.tid)
            .eq("status", "active");

          if (txns && txns.length > 0) {
            const pids = txns.map((t: any) => t.pid);
            const { data: rentedProps } = await Sclient
              .from("property")
              .select("pid, title, address, city, price, ptype, rooms, bath")
              .in("pid", pids);
            setProperties(rentedProps ?? []);
          }
        }
      }
    };
    init();
  }, [navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const { error: userError } = await Sclient
        .from("users").update({ uname: fullName }).eq("uid", user.id);
      if (userError) throw userError;

      if (role === "Owner") {
        await Sclient.from("owners").update({ contact, name: fullName }).eq("uid", user.id);
      } else if (role === "Tenant") {
        await Sclient.from("tenants").update({ contact, Name: fullName }).eq("uid", user.id);
      }

      await supabase.auth.updateUser({ data: { full_name: fullName } });
      toast({ title: "Profile updated!", className: "bg-green-50 text-green-900 border-green-200" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setLoadingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: "Password changed!", className: "bg-green-50 text-green-900 border-green-200" });
      setNewPassword(""); setConfirmPassword("");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleLogout = async () => {
    setLoadingLogout(true);
    try {
      await supabase.auth.signOut();
      navigate("/auth");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoadingLogout(false);
    }
  };

  const initials = fullName
    ? fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : email.slice(0, 2).toUpperCase();

  // Reusable property list renderer
  const PropertyList = ({ items, emptyText }: { items: Property[]; emptyText: string }) => (
    <div style={{ padding: 20 }}>
      {items.length === 0 ? (
        <div className="empty-state">
          <Building2 style={{ width: 40, height: 40 }} />
          <p style={{ fontSize: 14 }}>{emptyText}</p>
        </div>
      ) : (
        <div>
          {items.map((p) => (
            <div key={p.pid} className="property-row">
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: 14.5, color: '#fff', margin: 0 }}>{p.title}</p>
                <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.4)', margin: '3px 0 0' }}>{p.address}, {p.city}</p>
                <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.3)', margin: '3px 0 0', textTransform: 'capitalize' }}>
                  {p.ptype} · {p.rooms} rooms · {p.bath} bath
                </p>
              </div>
              <div style={{ marginLeft: 16, textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontWeight: 700, fontSize: 15, color: '#4ade80', margin: 0 }}>₹{Number(p.price).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-8" style={{
      background: 'linear-gradient(135deg, #0a0a0f 0%, #0d0d1a 50%, #0a0f0a 100%)',
      fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    }}>
      <style>{`
        .profile-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          backdrop-filter: blur(20px);
          overflow: hidden;
        }
        .nav-btn {
          display: flex;
          width: 100%;
          align-items: center;
          gap: 10px;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13.5px;
          font-family: 'Segoe UI', sans-serif;
          font-weight: 400;
          transition: all 0.2s ease;
          background: transparent;
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.01em;
        }
        .nav-btn:hover { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.85); }
        .nav-btn.active { background: rgba(134,239,172,0.08); color: #86efac; font-weight: 600; }
        .nav-btn.active-blue { background: rgba(125,211,252,0.08); color: #7dd3fc; font-weight: 600; }
        .stat-card-full {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 20px;
          text-align: center;
          width: 100%;
        }
        .stat-cards-row {
          display: flex;
          gap: 10px;
        }
        .stat-card-half {
          flex: 1;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 16px;
          text-align: center;
        }
        .right-card { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; overflow: hidden; }
        .property-row { display: flex; align-items: center; justify-content: space-between; padding: 16px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.05); background: rgba(255,255,255,0.02); transition: all 0.2s ease; margin-bottom: 10px; }
        .property-row:hover { background: rgba(255,255,255,0.05); border-color: rgba(134,239,172,0.15); }
        .property-row-blue:hover { background: rgba(255,255,255,0.05); border-color: rgba(125,211,252,0.2); }
        .input-dark { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 10px 14px; color: rgba(255,255,255,0.85); font-family: 'Segoe UI', sans-serif; font-size: 14px; outline: none; transition: border-color 0.2s ease; box-sizing: border-box; }
        .input-dark:focus { border-color: rgba(134,239,172,0.4); }
        .input-with-icon { position: relative; }
        .input-with-icon .icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.3); pointer-events: none; display: flex; align-items: center; }
        .input-with-icon input { padding-left: 38px; }
        .label-dark { display: block; font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.4); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 8px; }
        .btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; background: linear-gradient(135deg, #4ade80, #22c55e); color: #052e16; font-family: 'Segoe UI', sans-serif; font-weight: 700; font-size: 13.5px; border: none; border-radius: 12px; cursor: pointer; transition: all 0.2s ease; }
        .avatar-ring { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #4ade80, #16a34a); display: flex; align-items: center; justify-content: center; font-family: 'Segoe UI', sans-serif; font-weight: 800; font-size: 20px; color: #052e16; margin: 0 auto 14px; box-shadow: 0 0 0 4px rgba(74,222,128,0.12), 0 0 30px rgba(74,222,128,0.15); }
        .top-bar { height: 3px; background: linear-gradient(90deg, #4ade80, #22d3ee, #a78bfa); width: 100%; }
        .role-badge { display: inline-block; padding: 3px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; margin-top: 8px; }
        .divider { height: 1px; background: rgba(255,255,255,0.06); margin: 4px 0; }
        .empty-state { padding: 64px 0; text-align: center; color: rgba(255,255,255,0.3); }
        .purchased-badge { display: inline-flex; align-items: center; gap: 5px; padding: 2px 10px; border-radius: 999px; font-size: 10.5px; font-weight: 700; letter-spacing: 0.04em; background: rgba(125,211,252,0.1); color: #7dd3fc; border: 1px solid rgba(125,211,252,0.2); margin-top: 5px; }
      `}</style>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 md:flex-row md:items-start">
        {/* LEFT PANEL */}
        <div className="flex w-full flex-col gap-4 md:w-72 md:shrink-0">
          <div className="profile-card">
            <div className="top-bar" />
            <div style={{ padding: '24px 20px 16px', textAlign: 'center' }}>
              <div className="avatar-ring">{initials}</div>
              <h2 style={{ fontWeight: 800, fontSize: 19, color: '#fff', margin: 0 }}>{fullName || "Your Name"}</h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{email}</p>
              {contact && (
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                  <Phone style={{ width: 12, height: 12 }} /> {contact}
                </p>
              )}
              {role && (
                <span className="role-badge" style={
                  role === 'Owner'
                    ? { background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.25)' }
                    : { background: 'rgba(34,211,238,0.1)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.25)' }
                }>{role}</span>
              )}
            </div>

            <div style={{ padding: '4px 10px 8px' }}>
              {/* My Listings — shown for Owner */}
              {role === "Owner" && (
                <button onClick={() => setActiveTab("listings")} className={`nav-btn${activeTab === "listings" ? " active" : ""}`}>
                  <Home style={{ width: 15, height: 15 }} />
                  My Listings
                  <span style={{ marginLeft: 'auto', fontSize: 11, padding: '1px 7px', borderRadius: 999, background: 'rgba(134,239,172,0.1)', color: '#86efac', fontWeight: 700 }}>
                    {properties.length}
                  </span>
                </button>
              )}

              {/* Rented Properties — shown for Tenant */}
              {role === "Tenant" && (
                <button onClick={() => setActiveTab("listings")} className={`nav-btn${activeTab === "listings" ? " active" : ""}`}>
                  <Key style={{ width: 15, height: 15 }} />
                  Rented Properties
                  <span style={{ marginLeft: 'auto', fontSize: 11, padding: '1px 7px', borderRadius: 999, background: 'rgba(134,239,172,0.1)', color: '#86efac', fontWeight: 700 }}>
                    {properties.length}
                  </span>
                </button>
              )}

              {/* Purchased Properties — shown for Owner */}
              {role === "Owner" && (
                <button onClick={() => setActiveTab("purchased")} className={`nav-btn${activeTab === "purchased" ? " active-blue" : ""}`}>
                  <ShoppingBag style={{ width: 15, height: 15 }} />
                  Purchased
                  <span style={{ marginLeft: 'auto', fontSize: 11, padding: '1px 7px', borderRadius: 999, background: 'rgba(125,211,252,0.1)', color: '#7dd3fc', fontWeight: 700 }}>
                    {purchasedProperties.length}
                  </span>
                </button>
              )}

              <button onClick={() => setActiveTab("profile")} className={`nav-btn${activeTab === "profile" ? " active" : ""}`}>
                <User style={{ width: 15, height: 15 }} /> Edit Profile
                <ChevronRight style={{ marginLeft: 'auto', width: 13, height: 13 }} />
              </button>
              <button onClick={() => setActiveTab("password")} className={`nav-btn${activeTab === "password" ? " active" : ""}`}>
                <Lock style={{ width: 15, height: 15 }} /> Change Password
                <ChevronRight style={{ marginLeft: 'auto', width: 13, height: 13 }} />
              </button>
            </div>

            <div className="divider" />
            <div style={{ padding: '8px 10px 12px' }}>
              <button onClick={handleLogout} disabled={loadingLogout} className="nav-btn" style={{ color: 'rgba(248,113,113,0.7)' }}>
                <LogOut style={{ width: 15, height: 15 }} />
                {loadingLogout ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          </div>

          {/* STAT CARDS */}
          {role === "Owner" ? (
            <div className="stat-cards-row">
              <div className="stat-card-half">
                <p style={{ fontWeight: 800, fontSize: 28, color: '#4ade80', margin: 0 }}>{properties.length}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 4, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 700 }}>Listed</p>
              </div>
              <div className="stat-card-half">
                <p style={{ fontWeight: 800, fontSize: 28, color: '#7dd3fc', margin: 0 }}>{purchasedProperties.length}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 4, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 700 }}>Purchased</p>
              </div>
            </div>
          ) : (
            <div className="stat-card-full">
              <p style={{ fontWeight: 800, fontSize: 32, color: '#4ade80', margin: 0 }}>{properties.length}</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 4, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 700 }}>Total Rented</p>
            </div>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div style={{ flex: 1 }}>

          {/* MY LISTINGS tab */}
          {activeTab === "listings" && (
            <div className="right-card">
              <div style={{ padding: '20px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ fontWeight: 800, fontSize: 18, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {role === "Owner"
                    ? <><Home style={{ width: 18, height: 18, color: '#4ade80' }} /> My Listings</>
                    : <><Key style={{ width: 18, height: 18, color: '#4ade80' }} /> Rented Properties</>
                  }
                </h3>
                {role === "Owner" && (
                  <button className="btn-primary" style={{ padding: '8px 14px', fontSize: 12 }} onClick={() => navigate("/add-property")}>
                    <Plus style={{ width: 14, height: 14 }} /> Add New
                  </button>
                )}
              </div>
              <PropertyList
                items={properties}
                emptyText={role === "Owner" ? "You haven't listed any properties yet." : "You haven't rented any properties yet."}
              />
            </div>
          )}

          {/* PURCHASED tab — Owner only */}
          {activeTab === "purchased" && role === "Owner" && (
            <div className="right-card">
              <div style={{ padding: '20px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ fontWeight: 800, fontSize: 18, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShoppingBag style={{ width: 18, height: 18, color: '#7dd3fc' }} /> Purchased Properties
                </h3>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>
                  {purchasedProperties.length} {purchasedProperties.length === 1 ? "property" : "properties"}
                </span>
              </div>
              <div style={{ padding: 20 }}>
                {purchasedProperties.length === 0 ? (
                  <div className="empty-state">
                    <ShoppingBag style={{ width: 40, height: 40 }} />
                    <p style={{ fontSize: 14 }}>You haven't purchased any properties yet.</p>
                  </div>
                ) : (
                  <div>
                    {purchasedProperties.map((p) => (
                      <div key={p.pid} className="property-row property-row-blue">
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 700, fontSize: 14.5, color: '#fff', margin: 0 }}>{p.title}</p>
                          <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.4)', margin: '3px 0 0' }}>{p.address}, {p.city}</p>
                          <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.3)', margin: '3px 0 0', textTransform: 'capitalize' }}>
                            {p.ptype} · {p.rooms} rooms · {p.bath} bath
                          </p>
                          <span className="purchased-badge">
                            <ShoppingBag style={{ width: 10, height: 10 }} /> Purchased
                          </span>
                        </div>
                        <div style={{ marginLeft: 16, textAlign: 'right', flexShrink: 0 }}>
                          <p style={{ fontWeight: 700, fontSize: 15, color: '#7dd3fc', margin: 0 }}>₹{Number(p.price).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* EDIT PROFILE tab */}
          {activeTab === "profile" && (
            <div className="right-card">
              <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ fontWeight: 800, fontSize: 18, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <User style={{ width: 18, height: 18, color: '#4ade80' }} /> Edit Profile
                </h3>
              </div>
              <div style={{ padding: 24 }}>
                <form onSubmit={handleUpdateProfile} style={{ maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <label className="label-dark">Full Name</label>
                    <input className="input-dark" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" required />
                  </div>
                  <div>
                    <label className="label-dark">Contact</label>
                    <div className="input-with-icon">
                      <span className="icon"><Phone style={{ width: 14, height: 14 }} /></span>
                      <input className="input-dark" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="+91 98765 43210" />
                    </div>
                  </div>
                  <div>
                    <label className="label-dark">Email</label>
                    <div className="input-with-icon">
                      <span className="icon"><Mail style={{ width: 14, height: 14 }} /></span>
                      <input className="input-dark" value={email} disabled />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary" disabled={loadingProfile}>
                    <Save style={{ width: 14, height: 14 }} /> {loadingProfile ? "Saving..." : "Save Changes"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* CHANGE PASSWORD tab */}
          {activeTab === "password" && (
            <div className="right-card">
              <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ fontWeight: 800, fontSize: 18, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Lock style={{ width: 18, height: 18, color: '#4ade80' }} /> Change Password
                </h3>
              </div>
              <div style={{ padding: 24 }}>
                <form onSubmit={handleChangePassword} style={{ maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <label className="label-dark">New Password</label>
                    <input className="input-dark" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
                  </div>
                  <div>
                    <label className="label-dark">Confirm Password</label>
                    <input className="input-dark" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
                  </div>
                  <button type="submit" className="btn-primary" disabled={loadingPassword}>
                    <Lock style={{ width: 14, height: 14 }} /> {loadingPassword ? "Updating..." : "Update Password"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
