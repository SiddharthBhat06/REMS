import { useState } from "react";
import { Bath, BedDouble, Maximize, MapPin, User, Phone, ShoppingCart, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
        className={`group cursor-pointer overflow-hidden border border-slate-600/50 bg-gray-950/70 shadow-md transition-all duration-300 hover:border-sky-500/70 hover:shadow-lg hover:shadow-sky-900/20 hover:-translate-y-0.5 relative ${bought ? "opacity-70" : ""}`}
        onClick={() => setOpen(true)}
      >
        {/* SOLD ribbon */}
        {bought && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-28 h-28 overflow-hidden">
              <div className="absolute top-5 right-[-26px] w-36 bg-rose-500 text-white text-[10px] font-black text-center py-1 rotate-45 shadow-lg tracking-[0.2em] uppercase">
                Sold
              </div>
            </div>
          </div>
        )}

        <div className="relative h-48 overflow-hidden bg-slate-800">
          <img
            src={imgSrc} alt={title}
            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${bought ? "grayscale-[40%] brightness-75" : "brightness-95"}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1e2d45]/80 via-transparent to-transparent" />

          <Badge className="absolute right-3 top-3 border border-sky-400/30 bg-sky-900/70 backdrop-blur-sm text-xs font-semibold text-sky-300 capitalize tracking-wide">
            {ptype}
          </Badge>

          <div className={`absolute left-3 top-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 backdrop-blur-md border text-[10px] font-bold tracking-wider uppercase ${
            bought ? "bg-slate-900/70 border-rose-500/40 text-rose-300" : "bg-slate-900/70 border-emerald-500/40 text-emerald-300"
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${bought ? "bg-rose-400" : "bg-emerald-400 animate-pulse"}`} />
            {bought ? "Sold" : "Available"}
          </div>
        </div>

        <CardContent className="p-4 space-y-2">
          <h3 className="font-semibold text-base text-slate-100 line-clamp-1 tracking-tight">{title}</h3>
          <p className="text-2xl font-bold text-white">${price.toLocaleString()}</p>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <MapPin className="h-3.5 w-3.5 text-sky-400 shrink-0" />
            <span className="line-clamp-1">{address}, {city}{state ? `, ${state}` : ""}</span>
          </div>
          <div className="flex items-center gap-4 border-t border-slate-600/50 pt-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><BedDouble className="h-3.5 w-3.5 text-sky-400" />{rooms} Beds</span>
            <span className="flex items-center gap-1.5"><Bath className="h-3.5 w-3.5 text-sky-400" />{bath} Baths</span>
            <span className="flex items-center gap-1.5"><Maximize className="h-3.5 w-3.5 text-sky-400" />{ssqft.toLocaleString()} sqft</span>
          </div>
        </CardContent>
      </Card>

      {/* ── DIALOG ───────────────────────────────────────────── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border border-slate-600/50 bg-black shadow-2xl">
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Hero image */}
                <div className="relative h-52 overflow-hidden bg-gray-950/70">
                  <img
                    src={imgSrc} alt={title}
                    className={`h-full w-full object-cover ${bought ? "grayscale-[40%] brightness-75" : "brightness-95"}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a2840] via-[#1a2840]/30 to-transparent" />

                  <motion.div
                    className={`absolute bottom-4 left-5 flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold tracking-wider uppercase border backdrop-blur-md ${
                      bought ? "bg-slate-900/80 border-rose-400/40 text-rose-300" : "bg-slate-900/80 border-emerald-400/40 text-emerald-300"
                    }`}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
                  >
                    {bought ? <><XCircle className="h-3.5 w-3.5" /> Sold</> : <><CheckCircle2 className="h-3.5 w-3.5" /> Available</>}
                  </motion.div>

                  <Badge className="absolute bottom-4 right-5 border border-sky-400/30 bg-sky-900/70 backdrop-blur-sm text-xs font-semibold text-sky-300 capitalize tracking-wide">
                    {ptype}
                  </Badge>
                </div>

                <div className="p-6 space-y-5">
                  <DialogHeader>
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.35 }}>
                      <DialogTitle className="text-2xl font-bold text-slate-100 tracking-tight">{title}</DialogTitle>
                      <DialogDescription className="flex items-center gap-1.5 text-slate-400 mt-1">
                        <MapPin className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                        {address}, {city}{state ? `, ${state}` : ""}
                      </DialogDescription>
                    </motion.div>
                  </DialogHeader>

                  <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18, duration: 0.35 }}>
                    <p className="text-4xl font-black text-white tracking-tight">${price.toLocaleString()}</p>
                    <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-widest">Purchase Price</p>
                  </motion.div>

                  {descri && (
                    <motion.p
                      className="text-sm text-slate-300 leading-relaxed border-l-2 border-sky-500/60 pl-3"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
                    >
                      {descri}
                    </motion.p>
                  )}

                  {/* Stats */}
                  <motion.div className="grid grid-cols-3 gap-3" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    {[
                      { icon: BedDouble, label: "Bedrooms", value: rooms },
                      { icon: Bath, label: "Bathrooms", value: bath },
                      { icon: Maximize, label: "Sq Ft", value: ssqft.toLocaleString() },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex flex-col items-center justify-center rounded-xl border border-slate-600/50 bg-slate-800/50 py-3 gap-1">
                        <Icon className="h-4 w-4 text-sky-400" />
                        <span className="text-base font-bold text-slate-100">{value}</span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</span>
                      </div>
                    ))}
                  </motion.div>

                  {/* Owner contact */}
                  <motion.div
                    className="rounded-xl border border-slate-600/50 bg-slate-800/40 p-4 space-y-3"
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
                  >
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Owner Contact</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-900/50 border border-sky-700/50">
                          <User className="h-3.5 w-3.5 text-sky-400" />
                        </div>
                        <span className="text-slate-200 font-medium">{ownerName || "Not provided"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-900/50 border border-sky-700/50">
                          <Phone className="h-3.5 w-3.5 text-sky-400" />
                        </div>
                        <span className="text-slate-200 font-medium">{ownerContact || "Not provided"}</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Buy / Sold */}
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                    {bought ? (
                      <div className="flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-900/20 px-4 py-3.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-900/40 border border-rose-500/30">
                          <XCircle className="h-4 w-4 text-rose-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-rose-300">Property Sold</p>
                          <p className="text-xs text-rose-400/70 mt-0.5">This property is no longer available for purchase.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        <Button
                          className="w-full h-12 gap-2.5 text-sm font-bold tracking-wide bg-sky-600 hover:bg-sky-500 text-white border-0 shadow-lg shadow-sky-900/50 transition-all duration-200 hover:shadow-sky-800/60 hover:shadow-xl disabled:opacity-40"
                          onClick={(e) => { e.stopPropagation(); handleBuy(); }}
                          disabled={buying || !currentUserId}
                        >
                          {buying ? (
                            <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Processing Purchase...</>
                          ) : (
                            <><ShoppingCart className="h-4 w-4" />Buy Property — ${price.toLocaleString()}</>
                          )}
                        </Button>
                        {!currentUserId && <p className="text-center text-xs text-slate-500">You must be logged in to purchase a property.</p>}
                        {buyError && <p className="text-center text-xs text-rose-400 font-medium">{buyError}</p>}
                      </div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PropertyCard;
