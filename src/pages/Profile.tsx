import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Building2, LogOut, Home, User, Mail, Lock, Save, ChevronRight,
  Phone, Plus, Key, ShoppingBag, Pencil, Trash2, X, BedDouble,
  Bath, MapPin, TrendingUp, CheckCircle2,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const Sclient = createClient(supabaseUrl, supabaseKey);

// ─── Types ────────────────────────────────────────────────────────────────────
type Property = {
  pid: string;
  title: string;
  address: string;
  city: string;
  price: number;
  ptype: string;
  rooms: number;
  bath: number;
  description?: string;
  status?: string;
};

type EditForm = Omit<Property, "pid">;
type ActiveTab = "listings" | "purchased" | "profile" | "password";

const PROPERTY_TYPES = ["apartment", "house", "villa", "studio", "penthouse", "commercial"];

const STATUS_COLORS: Record<string, string> = {
  available:   "#4ade80",
  rented:      "#facc15",
  sold:        "#7dd3fc",
  maintenance: "#f87171",
};

// ─── Inline Edit Modal ────────────────────────────────────────────────────────
const EditPropertyModal = ({
  property,
  onClose,
  onSave,
}: {
  property: Property;
  onClose: () => void;
  onSave: (pid: string, form: EditForm) => Promise<void>;
}) => {
  const [form, setForm] = useState<EditForm>({
    title:       property.title,
    address:     property.address,
    city:        property.city,
    price:       property.price,
    ptype:       property.ptype,
    rooms:       property.rooms,
    bath:        property.bath,
    description: property.description ?? "",
    status:      property.status ?? "available",
  });
  const [saving, setSaving] = useState(false);
  const set = (k: keyof EditForm, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    await onSave(property.pid, form);
    setSaving(false);
    onClose();
  };

  return (
    <div className="ep-backdrop" onClick={onClose}>
      <div className="ep-panel" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="ep-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="ep-icon-wrap">
              <Pencil style={{ width: 15, height: 15, color: "#4ade80" }} />
            </div>
            <div>
              <p className="ep-title">Edit Property</p>
              <p className="ep-sub">Update your listing details</p>
            </div>
          </div>
          <button className="ep-close" onClick={onClose}>
            <X style={{ width: 15, height: 15 }} />
          </button>
        </div>

        {/* Body */}
        <div className="ep-body">
          <div className="ep-grid">

            <div className="ep-field ep-full">
              <label className="label-dark">Property Title</label>
              <input className="input-dark" value={form.title}
                onChange={(e) => set("title", e.target.value)} placeholder="e.g. Sunlit 2BHK in Koramangala" />
            </div>

            <div className="ep-field">
              <label className="label-dark">Address</label>
              <input className="input-dark" value={form.address}
                onChange={(e) => set("address", e.target.value)} placeholder="Street address" />
            </div>

            <div className="ep-field">
              <label className="label-dark">City</label>
              <input className="input-dark" value={form.city}
                onChange={(e) => set("city", e.target.value)} placeholder="e.g. Bengaluru" />
            </div>

            <div className="ep-field">
              <label className="label-dark">Price (₹ / month)</label>
              <input className="input-dark" type="number" value={form.price}
                onChange={(e) => set("price", Number(e.target.value))} min={0} />
            </div>

            <div className="ep-field">
              <label className="label-dark">Property Type</label>
              <select className="input-dark ep-select" value={form.ptype}
                onChange={(e) => set("ptype", e.target.value)}>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>

            <div className="ep-field">
              <label className="label-dark">Bedrooms</label>
              <input className="input-dark" type="number" value={form.rooms}
                onChange={(e) => set("rooms", Number(e.target.value))} min={0} />
            </div>

            <div className="ep-field">
              <label className="label-dark">Bathrooms</label>
              <input className="input-dark" type="number" value={form.bath}
                onChange={(e) => set("bath", Number(e.target.value))} min={0} />
            </div>

            <div className="ep-field">
              <label className="label-dark">Status</label>
              <select className="input-dark ep-select" value={form.status}
                onChange={(e) => set("status", e.target.value)}>
                <option value="available">Available</option>
                <option value="rented">Rented</option>
                <option value="sold">Sold</option>
                <option value="maintenance">Under Maintenance</option>
              </select>
            </div>

            <div className="ep-field ep-full">
              <label className="label-dark">Description</label>
              <textarea className="input-dark ep-textarea" rows={3} value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Describe amenities, nearby landmarks…" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="ep-footer">
          <button className="ep-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}
            style={{ gap: 7, fontSize: 13 }}>
            {saving ? (
              <><span className="spinner-sm" /> Saving…</>
            ) : (
              <><Save style={{ width: 13, height: 13 }} /> Save Changes</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
const DeleteConfirmModal = ({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => void;
}) => (
  <div className="ep-backdrop" onClick={onClose}>
    <div className="del-panel" onClick={(e) => e.stopPropagation()}>
      <div className="del-icon-wrap">
        <Trash2 style={{ width: 22, height: 22, color: "#f87171" }} />
      </div>
      <p className="del-title">Delete Property?</p>
      <p className="del-sub">This will permanently remove the listing and cannot be undone.</p>
      <div className="del-actions">
        <button className="ep-btn-cancel" onClick={onClose}>Cancel</button>
        <button className="del-btn-confirm" onClick={onConfirm}>Yes, Delete</button>
      </div>
    </div>
  </div>
);

// ─── Owner Property Row ───────────────────────────────────────────────────────
const OwnerPropertyRow = ({
  p,
  onEdit,
  onDelete,
}: {
  p: Property;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const status = p.status ?? "available";
  const color  = STATUS_COLORS[status] ?? "#4ade80";
  return (
    <div className="property-row" style={{ flexDirection: "column", alignItems: "stretch", gap: 0 }}>
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: 14.5, color: "#fff", margin: 0 }}>{p.title}</p>
          <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.4)", margin: "3px 0 0",
            display: "flex", alignItems: "center", gap: 4 }}>
            <MapPin style={{ width: 11, height: 11 }} />{p.address}, {p.city}
          </p>
          <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.3)", margin: "4px 0 0",
            textTransform: "capitalize", display: "flex", alignItems: "center", gap: 8 }}>
            <BedDouble style={{ width: 12, height: 12 }} /> {p.rooms} bed
            <Bath style={{ width: 12, height: 12 }} /> {p.bath} bath
            · {p.ptype}
          </p>
        </div>

        {/* Price + status */}
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ fontWeight: 800, fontSize: 15, color: "#4ade80", margin: 0 }}>
            ₹{Number(p.price).toLocaleString()}
          </p>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            marginTop: 5, padding: "2px 9px", borderRadius: 999,
            fontSize: 10.5, fontWeight: 700, letterSpacing: "0.04em",
            textTransform: "capitalize",
            background: `${color}18`, color, border: `1px solid ${color}44`,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, display: "inline-block" }} />
            {status}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 8, marginTop: 12, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 12 }}>
        <button
          onClick={onEdit}
          style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
            gap: 6, padding: "7px 0", borderRadius: 9,
            background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.15)",
            color: "#4ade80", fontSize: 12, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(74,222,128,0.12)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(74,222,128,0.06)")}
        >
          <Pencil style={{ width: 12, height: 12 }} /> Edit
        </button>
        <button
          onClick={onDelete}
          style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
            gap: 6, padding: "7px 0", borderRadius: 9,
            background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.12)",
            color: "#f87171", fontSize: 12, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(248,113,113,0.12)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(248,113,113,0.05)")}
        >
          <Trash2 style={{ width: 12, height: 12 }} /> Delete
        </button>
      </div>
    </div>
  );
};

// ─── Main Profile Component ───────────────────────────────────────────────────
const Profile = () => {
  const [fullName, setFullName]             = useState("");
  const [email, setEmail]                   = useState("");
  const [contact, setContact]               = useState("");
  const [role, setRole]                     = useState<string | null>(null);
  const [newPassword, setNewPassword]       = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingLogout, setLoadingLogout]   = useState(false);
  const [properties, setProperties]         = useState<Property[]>([]);
  const [purchasedProperties, setPurchasedProperties] = useState<Property[]>([]);
  const [activeTab, setActiveTab]           = useState<ActiveTab>("listings");

  // Edit / delete state
  const [editTarget, setEditTarget]         = useState<Property | null>(null);
  const [deleteTarget, setDeleteTarget]     = useState<string | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  // ── Load ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }
      setEmail(user.email ?? "");

      const { data: userData } = await Sclient
        .from("users").select("role, uname").eq("uid", user.id).single();

      if (userData) {
        setRole(userData.role);
        setFullName(userData.uname ?? "");
      }

      if (userData?.role === "Owner") {
        const { data: ownerData } = await Sclient
          .from("owners").select("contact").eq("uid", user.id).maybeSingle();
        if (ownerData) setContact(ownerData.contact ?? "");

        const { data: props } = await Sclient
          .from("property")
          .select("pid, title, address, city, price, ptype, rooms, bath, description, status")
          .eq("uid", user.id)
          .order("pid", { ascending: false });
        setProperties(props ?? []);

        const { data: tenantData } = await Sclient
          .from("tenants").select("tid").eq("uid", user.id).maybeSingle();
        if (tenantData) {
          const { data: txns } = await Sclient
            .from("transactions").select("pid")
            .eq("tid", tenantData.tid).eq("status", "active");
          if (txns?.length) {
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
          .from("tenants").select("tid, contact").eq("uid", user.id).maybeSingle();
        if (tenantData) {
          setContact(tenantData.contact ?? "");
          const { data: txns } = await Sclient
            .from("transactions").select("pid")
            .eq("tid", tenantData.tid).eq("status", "active");
          if (txns?.length) {
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

  // ── Profile update ──────────────────────────────────────────────────────────
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");
      const { error: userError } = await Sclient
        .from("users").update({ uname: fullName }).eq("uid", user.id);
      if (userError) throw userError;
      if (role === "Owner")
        await Sclient.from("owners").update({ contact, name: fullName }).eq("uid", user.id);
      else if (role === "Tenant")
        await Sclient.from("tenants").update({ contact, Name: fullName }).eq("uid", user.id);
      await supabase.auth.updateUser({ data: { full_name: fullName } });
      toast({ title: "Profile updated!", className: "bg-green-50 text-green-900 border-green-200" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoadingProfile(false);
    }
  };

  // ── Password change ─────────────────────────────────────────────────────────
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

  // ── Logout ──────────────────────────────────────────────────────────────────
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

  // ── Property update ─────────────────────────────────────────────────────────
  const handlePropertySave = async (pid: string, form: EditForm) => {
    const { error } = await Sclient
      .from("property")
      .update({
        title:       form.title,
        address:     form.address,
        city:        form.city,
        price:       form.price,
        ptype:       form.ptype,
        rooms:       form.rooms,
        bath:        form.bath,
        description: form.description,
        status:      form.status,
      })
      .eq("pid", pid);

    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      setProperties((prev) => prev.map((p) => (p.pid === pid ? { ...p, ...form } : p)));
      toast({
        title: "Property updated!",
        description: "Your listing has been saved.",
        className: "bg-green-50 text-green-900 border-green-200",
      });
    }
  };

  // ── Property delete ─────────────────────────────────────────────────────────
  const handlePropertyDelete = async (pid: string) => {
    const { error } = await Sclient.from("property").delete().eq("pid", pid);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      setProperties((prev) => prev.filter((p) => p.pid !== pid));
      toast({ title: "Property removed.", className: "bg-red-50 text-red-900 border-red-200" });
    }
    setDeleteTarget(null);
  };

  // ── Derived ─────────────────────────────────────────────────────────────────
  const initials = fullName
    ? fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : email.slice(0, 2).toUpperCase();

  const availableCount = properties.filter((p) => (p.status ?? "available") === "available").length;
  const rentedCount    = properties.filter((p) => p.status === "rented").length;
  const totalValue     = properties.reduce((s, p) => s + Number(p.price), 0);

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-8" style={{
      background: "linear-gradient(135deg, #0a0a0f 0%, #0d0d1a 50%, #0a0f0a 100%)",
      fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    }}>
      <style>{`
        /* ── Base ── */
        .profile-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; backdrop-filter: blur(20px); overflow: hidden; }
        .nav-btn { display: flex; width: 100%; align-items: center; gap: 10px; border-radius: 10px; padding: 10px 14px; font-size: 13.5px; font-family: 'Segoe UI', sans-serif; font-weight: 400; transition: all 0.2s ease; background: transparent; border: none; cursor: pointer; color: rgba(255,255,255,0.4); letter-spacing: 0.01em; }
        .nav-btn:hover { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.85); }
        .nav-btn.active { background: rgba(134,239,172,0.08); color: #86efac; font-weight: 600; }
        .nav-btn.active-blue { background: rgba(125,211,252,0.08); color: #7dd3fc; font-weight: 600; }

        /* ── Stat cards ── */
        .stat-card-full { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 20px; text-align: center; width: 100%; }
        .stat-cards-row { display: flex; gap: 10px; flex-wrap: wrap; }
        .stat-card-half { flex: 1; min-width: 70px; background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 14px 10px; text-align: center; }

        /* ── Right card ── */
        .right-card { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; overflow: hidden; }

        /* ── Property rows ── */
        .property-row { display: flex; align-items: center; justify-content: space-between; padding: 16px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.05); background: rgba(255,255,255,0.02); transition: all 0.2s ease; margin-bottom: 10px; }
        .property-row:hover { background: rgba(255,255,255,0.04); border-color: rgba(134,239,172,0.12); }
        .property-row-blue:hover { border-color: rgba(125,211,252,0.2); }

        /* ── Inputs ── */
        .input-dark { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 10px 14px; color: rgba(255,255,255,0.85); font-family: 'Segoe UI', sans-serif; font-size: 14px; outline: none; transition: border-color 0.2s ease; box-sizing: border-box; }
        .input-dark:focus { border-color: rgba(134,239,172,0.4); }
        .input-dark:disabled { opacity: 0.45; cursor: not-allowed; }
        .input-with-icon { position: relative; }
        .input-with-icon .icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.3); pointer-events: none; display: flex; align-items: center; }
        .input-with-icon input { padding-left: 38px; }
        .label-dark { display: block; font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.4); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 8px; }

        /* ── Buttons ── */
        .btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; background: linear-gradient(135deg, #4ade80, #22c55e); color: #052e16; font-family: 'Segoe UI', sans-serif; font-weight: 700; font-size: 13.5px; border: none; border-radius: 12px; cursor: pointer; transition: all 0.2s ease; }
        .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(74,222,128,0.25); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        /* ── Avatar / misc ── */
        .avatar-ring { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #4ade80, #16a34a); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 20px; color: #052e16; margin: 0 auto 14px; box-shadow: 0 0 0 4px rgba(74,222,128,0.12), 0 0 30px rgba(74,222,128,0.15); }
        .top-bar { height: 3px; background: linear-gradient(90deg, #4ade80, #22d3ee, #a78bfa); width: 100%; }
        .role-badge { display: inline-block; padding: 3px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; margin-top: 8px; }
        .divider { height: 1px; background: rgba(255,255,255,0.06); margin: 4px 0; }
        .empty-state { padding: 64px 0; text-align: center; color: rgba(255,255,255,0.3); }
        .purchased-badge { display: inline-flex; align-items: center; gap: 5px; padding: 2px 10px; border-radius: 999px; font-size: 10.5px; font-weight: 700; letter-spacing: 0.04em; background: rgba(125,211,252,0.1); color: #7dd3fc; border: 1px solid rgba(125,211,252,0.2); margin-top: 5px; }

        /* ── Edit modal ── */
        .ep-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 999; padding: 20px; }
        .ep-panel { background: #0f1420; border: 1px solid rgba(255,255,255,0.1); border-radius: 22px; width: 100%; max-width: 580px; overflow: hidden; animation: slideUp 0.2s ease; }
        @keyframes slideUp { from { transform: translateY(14px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .ep-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; border-bottom: 1px solid rgba(255,255,255,0.07); }
        .ep-icon-wrap { width: 32px; height: 32px; border-radius: 9px; background: rgba(74,222,128,0.1); border: 1px solid rgba(74,222,128,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .ep-title { font-weight: 700; font-size: 16px; color: #fff; margin: 0; }
        .ep-sub { font-size: 11.5px; color: rgba(255,255,255,0.35); margin: 2px 0 0; }
        .ep-close { width: 30px; height: 30px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); cursor: pointer; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.4); transition: all 0.15s; }
        .ep-close:hover { background: rgba(255,255,255,0.08); color: #fff; }
        .ep-body { padding: 22px; max-height: 58vh; overflow-y: auto; }
        .ep-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .ep-field { display: flex; flex-direction: column; gap: 7px; }
        .ep-full { grid-column: 1 / -1; }
        .ep-select { cursor: pointer; appearance: none; }
        .ep-textarea { resize: vertical; min-height: 68px; }
        .ep-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 14px 22px; border-top: 1px solid rgba(255,255,255,0.07); }
        .ep-btn-cancel { padding: 9px 18px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 11px; color: rgba(255,255,255,0.5); font-family: 'Segoe UI', sans-serif; font-weight: 600; font-size: 13px; cursor: pointer; transition: all 0.15s; }
        .ep-btn-cancel:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.8); }

        /* ── Delete modal ── */
        .del-panel { background: #0f1420; border: 1px solid rgba(248,113,113,0.2); border-radius: 20px; width: 100%; max-width: 360px; padding: 28px 24px; text-align: center; animation: slideUp 0.2s ease; }
        .del-icon-wrap { width: 50px; height: 50px; border-radius: 50%; background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.25); display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; }
        .del-title { font-weight: 700; font-size: 17px; color: #fff; margin: 0 0 7px; }
        .del-sub { font-size: 13px; color: rgba(255,255,255,0.4); margin: 0 0 22px; line-height: 1.5; }
        .del-actions { display: flex; gap: 10px; }
        .del-btn-confirm { flex: 1; padding: 10px; background: linear-gradient(135deg, #f87171, #ef4444); color: #fff; border: none; border-radius: 11px; font-family: 'Segoe UI', sans-serif; font-weight: 700; font-size: 13px; cursor: pointer; transition: all 0.15s; }
        .del-btn-confirm:hover { opacity: 0.9; }

        /* ── Spinner ── */
        .spinner-sm { width: 12px; height: 12px; border: 2px solid rgba(5,46,22,0.3); border-top-color: #052e16; border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 md:flex-row md:items-start">

        {/* ── LEFT PANEL ─────────────────────────────────────────────────────── */}
        <div className="flex w-full flex-col gap-4 md:w-72 md:shrink-0">
          <div className="profile-card">
            <div className="top-bar" />
            <div style={{ padding: "24px 20px 16px", textAlign: "center" }}>
              <div className="avatar-ring">{initials}</div>
              <h2 style={{ fontWeight: 800, fontSize: 19, color: "#fff", margin: 0 }}>
                {fullName || "Your Name"}
              </h2>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{email}</p>
              {contact && (
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                  <Phone style={{ width: 12, height: 12 }} /> {contact}
                </p>
              )}
              {role && (
                <span className="role-badge" style={
                  role === "Owner"
                    ? { background: "rgba(74,222,128,0.1)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.25)" }
                    : { background: "rgba(34,211,238,0.1)", color: "#22d3ee", border: "1px solid rgba(34,211,238,0.25)" }
                }>{role}</span>
              )}
            </div>

            <div style={{ padding: "4px 10px 8px" }}>
              {role === "Owner" && (
                <button onClick={() => setActiveTab("listings")}
                  className={`nav-btn${activeTab === "listings" ? " active" : ""}`}>
                  <Home style={{ width: 15, height: 15 }} />
                  My Listings
                  <span style={{ marginLeft: "auto", fontSize: 11, padding: "1px 7px",
                    borderRadius: 999, background: "rgba(134,239,172,0.1)", color: "#86efac", fontWeight: 700 }}>
                    {properties.length}
                  </span>
                </button>
              )}

              {role === "Tenant" && (
                <button onClick={() => setActiveTab("listings")}
                  className={`nav-btn${activeTab === "listings" ? " active" : ""}`}>
                  <Key style={{ width: 15, height: 15 }} />
                  Rented Properties
                  <span style={{ marginLeft: "auto", fontSize: 11, padding: "1px 7px",
                    borderRadius: 999, background: "rgba(134,239,172,0.1)", color: "#86efac", fontWeight: 700 }}>
                    {properties.length}
                  </span>
                </button>
              )}

              {role === "Owner" && (
                <button onClick={() => setActiveTab("purchased")}
                  className={`nav-btn${activeTab === "purchased" ? " active-blue" : ""}`}>
                  <ShoppingBag style={{ width: 15, height: 15 }} />
                  Purchased
                  <span style={{ marginLeft: "auto", fontSize: 11, padding: "1px 7px",
                    borderRadius: 999, background: "rgba(125,211,252,0.1)", color: "#7dd3fc", fontWeight: 700 }}>
                    {purchasedProperties.length}
                  </span>
                </button>
              )}

              <button onClick={() => setActiveTab("profile")}
                className={`nav-btn${activeTab === "profile" ? " active" : ""}`}>
                <User style={{ width: 15, height: 15 }} /> Edit Profile
                <ChevronRight style={{ marginLeft: "auto", width: 13, height: 13 }} />
              </button>
              <button onClick={() => setActiveTab("password")}
                className={`nav-btn${activeTab === "password" ? " active" : ""}`}>
                <Lock style={{ width: 15, height: 15 }} /> Change Password
                <ChevronRight style={{ marginLeft: "auto", width: 13, height: 13 }} />
              </button>
            </div>

            <div className="divider" />
            <div style={{ padding: "8px 10px 12px" }}>
              <button onClick={handleLogout} disabled={loadingLogout}
                className="nav-btn" style={{ color: "rgba(248,113,113,0.7)" }}>
                <LogOut style={{ width: 15, height: 15 }} />
                {loadingLogout ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          </div>

          {/* STAT CARDS */}
          {role === "Owner" ? (
            <>
              {/* Row 1: listed + purchased */}
              <div className="stat-cards-row">
                <div className="stat-card-half">
                  <p style={{ fontWeight: 800, fontSize: 26, color: "#4ade80", margin: 0 }}>{properties.length}</p>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 4,
                    letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 700 }}>Listed</p>
                </div>
                <div className="stat-card-half">
                  <p style={{ fontWeight: 800, fontSize: 26, color: "#7dd3fc", margin: 0 }}>{purchasedProperties.length}</p>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 4,
                    letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 700 }}>Purchased</p>
                </div>
              </div>
              {/* Row 2: available + rented */}
              <div className="stat-cards-row">
                <div className="stat-card-half">
                  <p style={{ fontWeight: 800, fontSize: 26, color: "#86efac", margin: 0 }}>{availableCount}</p>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 4,
                    letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 700 }}>Available</p>
                </div>
                <div className="stat-card-half">
                  <p style={{ fontWeight: 800, fontSize: 26, color: "#facc15", margin: 0 }}>{rentedCount}</p>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 4,
                    letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 700 }}>Rented</p>
                </div>
              </div>
              {/* Row 3: portfolio value */}
              <div className="stat-card-full">
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.05em",
                  textTransform: "uppercase", fontWeight: 700, marginBottom: 6,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                  <TrendingUp style={{ width: 11, height: 11 }} /> Portfolio Value
                </p>
                <p style={{ fontWeight: 800, fontSize: 20, color: "#a5f3fc", margin: 0 }}>
                  ₹{totalValue.toLocaleString()}
                </p>
              </div>
            </>
          ) : (
            <div className="stat-card-full">
              <p style={{ fontWeight: 800, fontSize: 32, color: "#4ade80", margin: 0 }}>{properties.length}</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4,
                letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 700 }}>Total Rented</p>
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL ────────────────────────────────────────────────────── */}
        <div style={{ flex: 1 }}>

          {/* MY LISTINGS tab */}
          {activeTab === "listings" && (
            <div className="right-card">
              <div style={{ padding: "20px 24px 16px", display: "flex", alignItems: "center",
                justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <h3 style={{ fontWeight: 800, fontSize: 18, color: "#fff", margin: 0,
                  display: "flex", alignItems: "center", gap: 8 }}>
                  {role === "Owner"
                    ? <><Home style={{ width: 18, height: 18, color: "#4ade80" }} /> My Listings</>
                    : <><Key  style={{ width: 18, height: 18, color: "#4ade80" }} /> Rented Properties</>
                  }
                </h3>
                {role === "Owner" && (
                  <button className="btn-primary" style={{ padding: "8px 14px", fontSize: 12 }}
                    onClick={() => navigate("/add-property")}>
                    <Plus style={{ width: 14, height: 14 }} /> Add New
                  </button>
                )}
              </div>

              <div style={{ padding: 20 }}>
                {properties.length === 0 ? (
                  <div className="empty-state">
                    <Building2 style={{ width: 40, height: 40 }} />
                    <p style={{ fontSize: 14 }}>
                      {role === "Owner"
                        ? "You haven't listed any properties yet."
                        : "You haven't rented any properties yet."}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Owner gets editable rows; Tenant gets read-only rows */}
                    {properties.map((p) =>
                      role === "Owner" ? (
                        <OwnerPropertyRow
                          key={p.pid}
                          p={p}
                          onEdit={() => setEditTarget(p)}
                          onDelete={() => setDeleteTarget(p.pid)}
                        />
                      ) : (
                        <div key={p.pid} className="property-row">
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 700, fontSize: 14.5, color: "#fff", margin: 0 }}>{p.title}</p>
                            <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.4)", margin: "3px 0 0" }}>
                              {p.address}, {p.city}
                            </p>
                            <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.3)", margin: "3px 0 0",
                              textTransform: "capitalize" }}>
                              {p.ptype} · {p.rooms} rooms · {p.bath} bath
                            </p>
                          </div>
                          <div style={{ marginLeft: 16, textAlign: "right", flexShrink: 0 }}>
                            <p style={{ fontWeight: 700, fontSize: 15, color: "#4ade80", margin: 0 }}>
                              ₹{Number(p.price).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* PURCHASED tab — Owner only */}
          {activeTab === "purchased" && role === "Owner" && (
            <div className="right-card">
              <div style={{ padding: "20px 24px 16px", display: "flex", alignItems: "center",
                justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <h3 style={{ fontWeight: 800, fontSize: 18, color: "#fff", margin: 0,
                  display: "flex", alignItems: "center", gap: 8 }}>
                  <ShoppingBag style={{ width: 18, height: 18, color: "#7dd3fc" }} /> Purchased Properties
                </h3>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>
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
                  purchasedProperties.map((p) => (
                    <div key={p.pid} className="property-row property-row-blue">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: 14.5, color: "#fff", margin: 0 }}>{p.title}</p>
                        <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.4)", margin: "3px 0 0" }}>
                          {p.address}, {p.city}
                        </p>
                        <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.3)", margin: "3px 0 0",
                          textTransform: "capitalize" }}>
                          {p.ptype} · {p.rooms} rooms · {p.bath} bath
                        </p>
                        <span className="purchased-badge">
                          <ShoppingBag style={{ width: 10, height: 10 }} /> Purchased
                        </span>
                      </div>
                      <div style={{ marginLeft: 16, textAlign: "right", flexShrink: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: 15, color: "#7dd3fc", margin: 0 }}>
                          ₹{Number(p.price).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* EDIT PROFILE tab */}
          {activeTab === "profile" && (
            <div className="right-card">
              <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <h3 style={{ fontWeight: 800, fontSize: 18, color: "#fff", margin: 0,
                  display: "flex", alignItems: "center", gap: 8 }}>
                  <User style={{ width: 18, height: 18, color: "#4ade80" }} /> Edit Profile
                </h3>
              </div>
              <div style={{ padding: 24 }}>
                <form onSubmit={handleUpdateProfile}
                  style={{ maxWidth: 420, display: "flex", flexDirection: "column", gap: 20 }}>
                  <div>
                    <label className="label-dark">Full Name</label>
                    <input className="input-dark" value={fullName}
                      onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" required />
                  </div>
                  <div>
                    <label className="label-dark">Contact</label>
                    <div className="input-with-icon">
                      <span className="icon"><Phone style={{ width: 14, height: 14 }} /></span>
                      <input className="input-dark" value={contact}
                        onChange={(e) => setContact(e.target.value)} placeholder="+91 98765 43210" />
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
                    <Save style={{ width: 14, height: 14 }} />
                    {loadingProfile ? "Saving..." : "Save Changes"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* CHANGE PASSWORD tab */}
          {activeTab === "password" && (
            <div className="right-card">
              <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <h3 style={{ fontWeight: 800, fontSize: 18, color: "#fff", margin: 0,
                  display: "flex", alignItems: "center", gap: 8 }}>
                  <Lock style={{ width: 18, height: 18, color: "#4ade80" }} /> Change Password
                </h3>
              </div>
              <div style={{ padding: 24 }}>
                <form onSubmit={handleChangePassword}
                  style={{ maxWidth: 420, display: "flex", flexDirection: "column", gap: 20 }}>
                  <div>
                    <label className="label-dark">New Password</label>
                    <input className="input-dark" type="password" value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••" required minLength={6} />
                  </div>
                  <div>
                    <label className="label-dark">Confirm Password</label>
                    <input className="input-dark" type="password" value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••" required minLength={6} />
                  </div>
                  <button type="submit" className="btn-primary" disabled={loadingPassword}>
                    <Lock style={{ width: 14, height: 14 }} />
                    {loadingPassword ? "Updating..." : "Update Password"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Edit Modal ────────────────────────────────────────────────────────── */}
      {editTarget && (
        <EditPropertyModal
          property={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handlePropertySave}
        />
      )}

      {/* ── Delete Confirm Modal ──────────────────────────────────────────────── */}
      {deleteTarget && (
        <DeleteConfirmModal
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => handlePropertyDelete(deleteTarget)}
        />
      )}
    </div>
  );
};

export default Profile;
