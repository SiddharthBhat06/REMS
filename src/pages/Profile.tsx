import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Building2, LogOut, Home, User, Mail, Lock, Save, ChevronRight, Phone, Plus, Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

type ActiveTab = "listings" | "profile" | "password";

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
  const [activeTab, setActiveTab] = useState<ActiveTab>("listings");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }
      setEmail(user.email ?? "");

      // Fetch role + name from users table
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
        // Fetch contact from owners table
        const { data: ownerData } = await Sclient
          .from("owners")
          .select("contact")
          .eq("uid", user.id)
          .maybeSingle();
        if (ownerData) setContact(ownerData.contact ?? "");

        // Fetch properties from property table where uid = user.id
        const { data: props } = await Sclient
          .from("property")
          .select("pid, title, address, city, price, ptype, rooms, bath")
          .eq("uid", user.id);
        setProperties(props ?? []);

      } else if (userData?.role === "Tenant") {
        // Fetch contact from tenants table
        const { data: tenantData } = await Sclient
          .from("tenants")
          .select("tid, contact")
          .eq("uid", user.id)
          .maybeSingle();

        if (tenantData) {
          setContact(tenantData.contact ?? "");

          // Fetch rented properties via transactions table
          const { data: txns } = await Sclient
            .from("transactions")
            .select("pid")
            .eq("tid", tenantData.tid);

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

      // Update users table
      const { error: userError } = await Sclient
        .from("users")
        .update({ uname: fullName })
        .eq("uid", user.id);
      if (userError) throw userError;

      // Update contact in owners or tenants table
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

  const roleBadgeStyle = role === "Owner"
    ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
    : "bg-blue-500/20 text-blue-400 border-blue-500/30";

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:flex-row md:items-start">

        {/* ── LEFT PANEL ── */}
        <div className="flex w-full flex-col gap-4 md:w-72 md:shrink-0">
          <Card className="shadow-card overflow-hidden">
            <div className="h-2 w-full bg-gradient-accent" />
            <CardContent className="pt-6 pb-4 text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-accent text-xl font-bold text-accent-foreground">
                {initials}
              </div>
              <h2 className="font-display text-xl font-bold text-primary-foreground">
                {fullName || "Your Name"}
              </h2>
              <p className="font-body text-sm text-muted-foreground">{email}</p>
              {contact && (
                <p className="mt-1 font-body text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Phone className="h-3 w-3" /> {contact}
                </p>
              )}
              {role && (
                <span className={`mt-2 inline-block rounded-full border px-3 py-0.5 font-body text-xs font-semibold ${roleBadgeStyle}`}>
                  {role}
                </span>
              )}
            </CardContent>

            <div className="border-t border-border px-2 py-2 space-y-0.5">
              <button
                onClick={() => setActiveTab("listings")}
                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 font-body text-sm transition-colors ${activeTab === "listings" ? "bg-accent/10 text-accent font-semibold" : "text-muted-foreground hover:text-primary-foreground"}`}
              >
                {role === "Owner" ? <Home className="h-4 w-4" /> : <Key className="h-4 w-4" />}
                {role === "Owner" ? "My Listings" : "Rented Properties"}
                <span className="ml-auto rounded-full bg-accent/20 px-2 py-0.5 text-xs text-accent">
                  {properties.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 font-body text-sm transition-colors ${activeTab === "profile" ? "bg-accent/10 text-accent font-semibold" : "text-muted-foreground hover:text-primary-foreground"}`}
              >
                <User className="h-4 w-4" /> Edit Profile
                <ChevronRight className="ml-auto h-3 w-3" />
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 font-body text-sm transition-colors ${activeTab === "password" ? "bg-accent/10 text-accent font-semibold" : "text-muted-foreground hover:text-primary-foreground"}`}
              >
                <Lock className="h-4 w-4" /> Change Password
                <ChevronRight className="ml-auto h-3 w-3" />
              </button>
            </div>

            <div className="border-t border-border px-4 py-3">
              <button
                onClick={handleLogout}
                disabled={loadingLogout}
                className="flex w-full items-center gap-2 font-body text-sm text-destructive hover:opacity-80 disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                {loadingLogout ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="shadow-card py-3 text-center">
              <p className="font-display text-2xl font-bold text-accent">{properties.length}</p>
              <p className="font-body text-xs text-muted-foreground">
                {role === "Owner" ? "Listings" : "Rented"}
              </p>
            </Card>
            <Card className="shadow-card py-3 text-center">
              <p className="font-display text-2xl font-bold text-accent">
                {role === "Owner"
                  ? properties.filter((p: any) => p.status === "available").length
                  : properties.length}
              </p>
              <p className="font-body text-xs text-muted-foreground">
                {role === "Owner" ? "Available" : "Active"}
              </p>
            </Card>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex-1">

          {activeTab === "listings" && (
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-display text-xl text-primary-foreground flex items-center gap-2">
                  {role === "Owner"
                    ? <><Home className="h-5 w-5 text-accent" /> My Listings</>
                    : <><Key className="h-5 w-5 text-accent" /> Rented Properties</>
                  }
                </CardTitle>
                {role === "Owner" && (
                  <Button
                    onClick={() => navigate("/add-property")}
                    size="sm"
                    className="bg-gradient-accent font-body font-semibold text-accent-foreground hover:opacity-90"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add New
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {properties.length === 0 ? (
                  <div className="py-16 text-center">
                    <Building2 className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                    <p className="font-body text-muted-foreground">
                      {role === "Owner"
                        ? "You haven't listed any properties yet."
                        : "You haven't rented any properties yet."}
                    </p>
                    {role === "Owner" && (
                      <Button
                        onClick={() => navigate("/add-property")}
                        className="mt-4 bg-gradient-accent font-body font-semibold text-accent-foreground hover:opacity-90"
                      >
                        Add Your First Property
                      </Button>
                    )}
                    {role === "Tenant" && (
                      <Button
                        onClick={() => navigate("/properties")}
                        className="mt-4 bg-gradient-accent font-body font-semibold text-accent-foreground hover:opacity-90"
                      >
                        Browse Properties
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {properties.map((p) => (
                      <div key={p.pid} className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="font-body font-semibold text-primary-foreground truncate">{p.title}</p>
                          <p className="font-body text-sm text-muted-foreground truncate">{p.address}, {p.city}</p>
                          <p className="font-body text-xs text-muted-foreground capitalize mt-0.5">
                            {p.ptype} · {p.rooms} rooms · {p.bath} bath
                          </p>
                        </div>
                        <div className="ml-4 text-right shrink-0">
                          <p className="font-body font-semibold text-accent">₹{Number(p.price).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "profile" && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-display text-xl text-primary-foreground flex items-center gap-2">
                  <User className="h-5 w-5 text-accent" /> Edit Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label className="font-body text-sm text-primary-foreground">Full Name</Label>
                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" required className="text-primary-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-body text-sm text-primary-foreground">Contact</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="+91 98765 43210" className="pl-9 text-primary-foreground" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-body text-sm text-primary-foreground">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input value={email} disabled className="pl-9 text-primary-foreground opacity-60 cursor-not-allowed" />
                    </div>
                    <p className="font-body text-xs text-muted-foreground">Email cannot be changed.</p>
                  </div>
                  <Button type="submit" disabled={loadingProfile} className="bg-gradient-accent font-body font-semibold text-accent-foreground hover:opacity-90">
                    <Save className="mr-2 h-4 w-4" />
                    {loadingProfile ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === "password" && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-display text-xl text-primary-foreground flex items-center gap-2">
                  <Lock className="h-5 w-5 text-accent" /> Change Password
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label className="font-body text-sm text-primary-foreground">New Password</Label>
                    <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="text-primary-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-body text-sm text-primary-foreground">Confirm Password</Label>
                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="text-primary-foreground" />
                  </div>
                  <Button type="submit" disabled={loadingPassword} className="bg-gradient-accent font-body font-semibold text-accent-foreground hover:opacity-90">
                    <Lock className="mr-2 h-4 w-4" />
                    {loadingPassword ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
};

export default Profile;