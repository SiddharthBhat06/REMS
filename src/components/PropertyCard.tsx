import { useState } from "react";
import { Bath, BedDouble, Maximize, MapPin, User, Phone, X, HeartHandshake } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const Sclient = createClient(supabaseUrl, supabaseKey);

interface PropertyCardProps {
  pid: string;
  uid: string;
  title: string;
  descri: string;
  price: number;
  address: string;
  city: string;
  state?: string;
  rooms: number;
  bath: number;
  ssqft: number;
  ptype: string;
  iurl?: string | null;
  ownerName?: string;
  ownerContact?: string;
  isSold: boolean;
  currentUserId?: string;
  currentusername?: string;
  onPurchase?: (pid: string) => void;
}

const imager =
  "https://previews.123rf.com/images/lexlinx/lexlinx2012/lexlinx201200011/161240800-property-logo-home-builder-housing-industry-design-template-idea-for-estate-and-architecture.jpg";

// ── Edge function helper ───────────────────────────────────────────────────────
async function invokePropertyInterest(
  email: string,
  fullName: string,
  tname: string,
  propertyName: string
): Promise<void> {
  try {
    const { error } = await Sclient.functions.invoke("property-interest", {
      body: { email, fullName, tname, propertyName },
    });
    if (error) console.warn("Notification function error:", error.message);
  } catch (err) {
    console.error("Error invoking notification function:", err);
  }
}

const PropertyCard = ({
  pid, uid, title, descri, price, address, city, state, rooms, bath, ssqft,
  ptype, iurl, ownerName, ownerContact, isSold, currentUserId, currentusername, onPurchase,
}: PropertyCardProps) => {
  const [open, setOpen]             = useState(false);
  const [sending, setSending]       = useState(false);
  const [interested, setInterested] = useState(false);
  const [interestError, setInterestError] = useState<string | null>(null);

  const imgSrc = iurl || imager;

  const handleInterested = async () => {
    if (interested || sending || !currentUserId) return;
    setSending(true);
    setInterestError(null);

    try {
      // 1 — Only tenants can express interest
      const { data: tenantData } = await Sclient
        .from("tenants")
        .select("tid")
        .eq("uid", currentUserId)
        .maybeSingle();

      if (!tenantData?.tid) {
        setInterestError("Only tenants can express interest. Please complete your tenant profile first.");
        return;
      }

      const today    = new Date();
      const nextYear = new Date(today);
      nextYear.setFullYear(today.getFullYear() + 1);
      const fmt = (d: Date) => d.toISOString().split("T")[0];

      const { error: txErr } = await Sclient
        .from("transactions")
        .insert({
          pid,
          tid:            tenantData.tid,
          status:         "pending",
          start_date:     fmt(today),
          end_date:       fmt(nextYear),
          monthly_rent:   price / 12,
          deposit_amount: price / 12,
        });

      if (txErr) {
        console.error("Transaction insert error:", txErr.message);
        setInterestError("Could not record your interest. Please try again.");
        return;
      }

      // 2 — Fetch owner's email & name for the notification
      const { data: ownerUser, error: ownerErr } = await Sclient
        .from("users")
        .select("email, uname")
        .eq("uid", uid)
        .maybeSingle();

      if (ownerErr || !ownerUser?.email) {
        console.warn("Could not find owner email for notification.");
        setInterested(true);
        return;
      }

      // 3 — Fetch the interested user's display name
      const { data: meUser } = await Sclient
        .from("users")
        .select("uname")
        .eq("uid", currentUserId)
        .maybeSingle();

      const interestedUserName = meUser?.uname ?? currentusername ?? "A user";

      // 4 — Fire the edge function
      await invokePropertyInterest(
        ownerUser.email,
        ownerUser.uname ?? ownerName ?? "Property Owner",
        interestedUserName,
        title
      );

      setInterested(true);
    } catch (err: any) {
      setInterestError("Something went wrong. Please try again.");
      console.error("handleInterested:", err);
    } finally {
      setSending(false);
    }
  };

  const statusLabel = isSold ? "Sold" : interested ? "Interested" : "Available";
  const statusStyle = {
    border:  isSold ? "rgba(239,68,68,0.4)"  : interested ? "rgba(251,191,36,0.5)"  : "rgba(74,222,128,0.4)",
    text:    isSold ? "#fca5a5"               : interested ? "#fcd34d"               : "#4ade80",
    dot:     isSold ? "#f87171"               : interested ? "#fbbf24"               : "#4ade80",
    animate: !isSold && !interested,
  };

  const BadgePill = ({ small = false }: { small?: boolean }) => (
    <div style={{
      display: "flex", alignItems: "center", gap: small ? 4 : 6,
      padding: small ? "2px 8px" : "4px 10px",
      borderRadius: 999,
      background: "rgba(0,0,0,0.4)",
      border: `1px solid ${statusStyle.border}`,
      color: statusStyle.text,
      fontSize: small ? 9 : 10,
      fontWeight: 700,
      letterSpacing: "0.07em",
      textTransform: "uppercase",
      backdropFilter: "blur(8px)",
    }}>
      <span style={{
        width: small ? 4 : 6, height: small ? 4 : 6,
        borderRadius: "50%",
        background: statusStyle.dot,
        display: "inline-block",
        animation: statusStyle.animate ? "pulse 1.5s ease-in-out infinite" : "none",
      }} />
      {statusLabel}
    </div>
  );

  return (
    <>
      {/* ── CARD ─────────────────────────────────────────────── */}
      <Card
        className={`group cursor-pointer overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur-xl transition-all duration-300 hover:border-[#4ade80]/40 hover:shadow-2xl hover:shadow-[#4ade80]/10 hover:-translate-y-1 relative ${isSold ? "opacity-60" : ""}`}
        style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
        onClick={() => setOpen(true)}
      >
        {isSold && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-28 h-28 overflow-hidden">
              <div className="absolute top-5 right-[-26px] w-36 bg-rose-500 text-white text-[10px] font-black text-center py-1 rotate-45 shadow-lg tracking-wider uppercase">
                Sold
              </div>
            </div>
          </div>
        )}

        <div className="relative h-48 overflow-hidden bg-[#0d0d1a]">
          <img
            src={imgSrc} alt={title}
            className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 ${isSold ? "grayscale-[60%] brightness-50" : "brightness-90"}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
          <Badge className="absolute right-3 top-3 border border-white/10 bg-white/5 backdrop-blur-md text-[10px] font-bold text-white/70 capitalize tracking-wide px-2.5 py-1">
            {ptype}
          </Badge>
          <div className="absolute left-3 top-3"><BadgePill small /></div>
        </div>

        <CardContent className="p-4 space-y-3">
          <div className="space-y-0.5">
            <h3 className="font-black text-white text-base tracking-tight leading-tight line-clamp-1">{title}</h3>
            <p className="text-2xl font-black text-white tracking-tighter">₹{price.toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-white/40 font-medium">
            <MapPin className="h-3.5 w-3.5 text-[#4ade80]/70 shrink-0" />
            <span className="line-clamp-1">{address}, {city}{state ? `, ${state}` : ""}</span>
          </div>
          <div className="flex items-center justify-between border-t border-white/5 pt-4 text-[11px] text-white/30 font-semibold">
            <span className="flex items-center gap-1.5"><BedDouble className="h-3.5 w-3.5 text-white/20" />{rooms} Beds</span>
            <span className="flex items-center gap-1.5"><Bath className="h-3.5 w-3.5 text-white/20" />{bath} Baths</span>
            <span className="flex items-center gap-1.5"><Maximize className="h-3.5 w-3.5 text-white/20" />{ssqft.toLocaleString()} sqft</span>
          </div>
        </CardContent>
      </Card>

      {/* ── DETAIL MODAL ─────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full overflow-hidden border border-white/10 bg-[#0a0a0f] shadow-2xl rounded-2xl"
              style={{ maxWidth: "600px", fontFamily: "system-ui, -apple-system, sans-serif" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-48 overflow-hidden bg-[#0d0d1a]">
                <img
                  src={imgSrc} alt={title}
                  className={`h-full w-full object-cover ${isSold ? "grayscale-[60%] brightness-50" : "brightness-90"}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
                <button
                  onClick={() => setOpen(false)}
                  className="absolute top-4 right-4 z-20 flex items-center justify-center w-8 h-8 rounded-full bg-black/50 border border-white/10 text-white hover:bg-rose-500/80 hover:border-white/30 transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
                <Badge className="absolute right-4 bottom-4 border border-white/10 bg-white/5 backdrop-blur-md text-[9px] font-bold text-white/70 capitalize tracking-wide px-2 py-0.5">
                  {ptype}
                </Badge>
                <div className="absolute left-4 bottom-4"><BadgePill small /></div>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-0.5">
                  <h2 className="text-2xl font-black text-white tracking-tight">{title}</h2>
                  <div className="flex items-center gap-2 text-white/40 text-[11px]">
                    <MapPin className="h-3 w-3 text-[#4ade80]/60 shrink-0" />
                    <span>{address}, {city}{state ? `, ${state}` : ""}</span>
                  </div>
                </div>

                <div className="flex items-baseline gap-2.5">
                  <p className="text-3xl font-black text-white tracking-tighter">₹{price.toLocaleString()}</p>
                  <p className="text-[8px] text-[#4ade80] font-bold uppercase tracking-widest">Market Valuation</p>
                </div>

                {descri && (
                  <p className="text-xs text-white/60 leading-relaxed border-l-2 border-[#4ade80]/30 pl-3 italic line-clamp-2">
                    {descri}
                  </p>
                )}

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: BedDouble, label: "Beds",    value: rooms },
                    { icon: Bath,      label: "Baths",   value: bath },
                    { icon: Maximize,  label: "Sq. Ft.", value: ssqft.toLocaleString() },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex flex-col items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] py-3 gap-0.5">
                      <Icon className="h-3.5 w-3.5 text-[#4ade80]/70" />
                      <span className="text-lg font-bold text-white">{value}</span>
                      <span className="text-[8px] text-white/25 uppercase font-bold tracking-wider">{label}</span>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-[#4ade80]/10 border border-[#4ade80]/20 flex items-center justify-center shrink-0">
                      <User className="h-3.5 w-3.5 text-[#4ade80]" />
                    </div>
                    <span className="text-xs text-white/80 font-medium line-clamp-1">{ownerName || "Seller"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-[#4ade80]/10 border border-[#4ade80]/20 flex items-center justify-center shrink-0">
                      <Phone className="h-3.5 w-3.5 text-[#4ade80]" />
                    </div>
                    <span className="text-xs text-white/80 font-medium">{ownerContact}</span>
                  </div>
                </div>

                {interestError && (
                  <p className="text-[10px] text-rose-400 text-center">{interestError}</p>
                )}

                <div className="pt-0.5">
                  {isSold ? (
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-rose-500/20 bg-rose-500/5">
                      <div className="h-7 w-7 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                        <X className="h-3.5 w-3.5 text-rose-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-rose-300 uppercase tracking-widest">Property Sold</p>
                        <p className="text-[9px] text-rose-400/60 mt-0.5">No longer available for purchase.</p>
                      </div>
                    </div>

                  ) : interested ? (
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-[#4ade80]/20 bg-[#4ade80]/5">
                      <div className="h-7 w-7 rounded-full bg-[#4ade80]/10 border border-[#4ade80]/20 flex items-center justify-center shrink-0">
                        <HeartHandshake className="h-3.5 w-3.5 text-[#4ade80]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-[#4ade80] uppercase tracking-widest">Interest Sent!</p>
                        <p className="text-[9px] text-[#4ade80]/60 mt-0.5">The owner has been notified and will reach out shortly.</p>
                      </div>
                    </div>

                  ) : (
                    <Button
                      className="w-full text-xs font-black uppercase tracking-widest bg-[#4ade80] hover:bg-[#22c55e] text-[#052e16] rounded-xl transition-all flex items-center justify-center gap-2"
                      style={{ height: "46px" }}
                      onClick={(e) => { e.stopPropagation(); handleInterested(); }}
                      disabled={sending || !currentUserId}
                    >
                      <HeartHandshake className="h-4 w-4" />
                      {sending ? "Sending…" : `I'm Interested — ₹${price.toLocaleString()}`}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PropertyCard;
