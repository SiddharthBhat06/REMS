import { useState } from "react";
import { Bath, BedDouble, Maximize, MapPin, User, Phone, X } from "lucide-react";
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
  onPurchase?: (pid: string) => void;
}

const imager =
  "https://previews.123rf.com/images/lexlinx/lexlinx2012/lexlinx201200011/161240800-property-logo-home-builder-housing-industry-design-template-idea-for-estate-and-architecture.jpg";

const PropertyCard = ({
  pid, uid, title, descri, price, address, city, state, rooms, bath, ssqft,
  ptype, iurl, ownerName, ownerContact, isSold, currentUserId, onPurchase,
}: PropertyCardProps) => {
  const [open, setOpen] = useState(false);
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);
  const [bought, setBought] = useState(isSold);
  const imgSrc = iurl || imager;

  const handleBuy = async () => {
    if (bought || !currentUserId) return;
    setBuying(true);
    setBuyError(null);

    let tenantId: string | null = null;

    const { data: tenantData, error: tenantFetchError } = await Sclient
      .from("tenants").select("tid").eq("uid", currentUserId).maybeSingle();

    if (tenantFetchError) { setBuyError("Could not verify tenant record."); setBuying(false); return; }

    if (tenantData) {
      tenantId = tenantData.tid;
    } else {
      const { data: newTenant, error: tenantCreateError } = await Sclient
        .from("tenants").insert({ uid: currentUserId }).select("tid").single();
      if (tenantCreateError || !newTenant) { setBuyError("Could not create tenant record."); setBuying(false); return; }
      tenantId = newTenant.tid;
    }

    const today = new Date().toISOString().split("T")[0];
    const oneYearLater = new Date();
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    const endDate = oneYearLater.toISOString().split("T")[0];

    const { error: txError } = await Sclient.from("transactions").insert({
      pid, tid: tenantId, start_date: today, end_date: endDate,
      monthly_rent: price, deposit_amount: price * 0.1, status: "active",
    });

    if (txError) { setBuyError("Purchase failed. Please try again."); setBuying(false); return; }
    setBought(true); setBuying(false); onPurchase?.(pid);
  };

  return (
    <>
      {/* ── CARD ─────────────────────────────────────────────── */}
      <Card
        className={`group cursor-pointer overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur-xl transition-all duration-300 hover:border-[#4ade80]/40 hover:shadow-2xl hover:shadow-[#4ade80]/10 hover:-translate-y-1 relative ${bought ? "opacity-60" : ""}`}
        style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
        onClick={() => setOpen(true)}
      >
        {bought && (
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
            className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 ${bought ? "grayscale-[60%] brightness-50" : "brightness-90"}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
          <Badge className="absolute right-3 top-3 border border-white/10 bg-white/5 backdrop-blur-md text-[10px] font-bold text-white/70 capitalize tracking-wide px-2.5 py-1">
            {ptype}
          </Badge>
          <div className={`absolute left-3 top-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 backdrop-blur-md border text-[10px] font-bold tracking-wider uppercase ${
            bought ? "bg-black/40 border-rose-500/40 text-rose-300" : "bg-black/40 border-[#4ade80]/40 text-[#4ade80]"
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${bought ? "bg-rose-400" : "bg-[#4ade80] animate-pulse"}`} />
            {bought ? "Sold" : "Available"}
          </div>
        </div>

        <CardContent className="p-5 space-y-3">
          <h3 className="font-bold text-base text-white line-clamp-1 tracking-tight">{title}</h3>
          <p className="text-2xl font-black text-[#4ade80]">₹{price.toLocaleString()}</p>
          <div className="flex items-center gap-1.5 text-xs text-white/40">
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

      {/* ── NATIVE MODAL ─────────────────────────────────────── */}
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
              {/* Image header - Height reduced from h-64 to h-48 */}
              <div className="relative h-48 overflow-hidden bg-[#0d0d1a]">
                <img
                  src={imgSrc} alt={title}
                  className={`h-full w-full object-cover ${bought ? "grayscale-[60%] brightness-50" : "brightness-90"}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />

                {/* Close button — top right for better visibility */}
                <button
                  onClick={() => setOpen(false)}
                  className="absolute top-4 right-4 z-20 flex items-center justify-center w-8 h-8 rounded-full bg-black/50 border border-white/10 text-white hover:bg-rose-500/80 hover:border-white/30 transition-all"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Property type badge */}
                <Badge className="absolute right-4 bottom-4 border border-white/10 bg-white/5 backdrop-blur-md text-[9px] font-bold text-white/70 capitalize tracking-wide px-2 py-0.5">
                  {ptype}
                </Badge>

                {/* Sold / Available pill */}
                <div className={`absolute left-4 bottom-4 flex items-center gap-1.5 rounded-full px-2 py-0.5 backdrop-blur-md border text-[9px] font-bold tracking-wider uppercase ${
                  bought ? "bg-black/40 border-rose-500/40 text-rose-300" : "bg-black/40 border-[#4ade80]/40 text-[#4ade80]"
                }`}>
                  <span className={`h-1 w-1 rounded-full ${bought ? "bg-rose-400" : "bg-[#4ade80] animate-pulse"}`} />
                  {bought ? "Sold" : "Available"}
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Title + address - Tightened vertical spacing */}
                <div className="space-y-0.5">
                  <h2 className="text-2xl font-black text-white tracking-tight">{title}</h2>
                  <div className="flex items-center gap-2 text-white/40 text-[11px]">
                    <MapPin className="h-3 w-3 text-[#4ade80]/60 shrink-0" />
                    <span>{address}, {city}{state ? `, ${state}` : ""}</span>
                  </div>
                </div>

                {/* Price - Reduced font size slightly */}
                <div className="flex items-baseline gap-2.5">
                  <p className="text-3xl font-black text-white tracking-tighter">₹{price.toLocaleString()}</p>
                  <p className="text-[8px] text-[#4ade80] font-bold uppercase tracking-widest">Market Valuation</p>
                </div>

                {/* Description - Added line clamp to keep vertical height predictable */}
                {descri && (
                  <p className="text-xs text-white/60 leading-relaxed border-l-2 border-[#4ade80]/30 pl-3 italic line-clamp-2">
                    {descri}
                  </p>
                )}

                {/* Stats grid - Reduced vertical padding */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: BedDouble, label: "Beds", value: rooms },
                    { icon: Bath, label: "Baths", value: bath },
                    { icon: Maximize, label: "Sq. Ft.", value: ssqft.toLocaleString() },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex flex-col items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] py-3 gap-0.5">
                      <Icon className="h-3.5 w-3.5 text-[#4ade80]/70" />
                      <span className="text-lg font-bold text-white">{value}</span>
                      <span className="text-[8px] text-white/25 uppercase font-bold tracking-wider">{label}</span>
                    </div>
                  ))}
                </div>

                {/* Owner contact - Condensed layout */}
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

                {/* Error */}
                {buyError && (
                  <p className="text-[10px] text-rose-400 text-center">{buyError}</p>
                )}

                {/* CTA - Fixed height button */}
                <div className="pt-0.5">
                  {bought ? (
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-rose-500/20 bg-rose-500/5">
                      <div className="h-7 w-7 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                        <X className="h-3.5 w-3.5 text-rose-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-rose-300 uppercase tracking-widest">Property Sold</p>
                        <p className="text-[9px] text-rose-400/60 mt-0.5">No longer available for purchase.</p>
                      </div>
                    </div>
                  ) : (
                    <Button
                      className="w-full text-xs font-black uppercase tracking-widest bg-[#4ade80] hover:bg-[#22c55e] text-[#052e16] rounded-xl transition-all"
                      style={{ height: "46px" }}
                      onClick={(e) => { e.stopPropagation(); handleBuy(); }}
                      disabled={buying || !currentUserId}
                    >
                      {buying ? "Processing..." : `Purchase — ₹${price.toLocaleString()}`}
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