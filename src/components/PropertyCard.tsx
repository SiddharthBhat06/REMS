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
  currentUserId?: string; // logged-in user's uid (buyer)
  onPurchase?: (pid: string) => void; // callback to parent after purchase
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

    // Check if a tenant record exists for the buyer; if not, create one first
    let tenantId: string | null = null;

    const { data: tenantData, error: tenantFetchError } = await Sclient
      .from("tenants")
      .select("tid")
      .eq("uid", currentUserId)
      .maybeSingle();

    if (tenantFetchError) {
      setBuyError("Could not verify tenant record.");
      setBuying(false);
      return;
    }

    if (tenantData) {
      tenantId = tenantData.tid;
    } else {
      // Create a tenant row for this user
      const { data: newTenant, error: tenantCreateError } = await Sclient
        .from("tenants")
        .insert({ uid: currentUserId })
        .select("tid")
        .single();

      if (tenantCreateError || !newTenant) {
        setBuyError("Could not create tenant record.");
        setBuying(false);
        return;
      }
      tenantId = newTenant.tid;
    }

    // Insert into transactions
    const today = new Date().toISOString().split("T")[0];
    // end_date is NOT NULL — default to 1 year from purchase
    const oneYearLater = new Date();
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    const endDate = oneYearLater.toISOString().split("T")[0];

    const { error: txError } = await Sclient.from("transactions").insert({
      pid,
      tid: tenantId,
      start_date: today,
      end_date: endDate,
      monthly_rent: price,
      deposit_amount: price * 0.1,
      status: "active",          // must match check constraint
    });

    if (txError) {
      setBuyError("Purchase failed. Please try again.");
      setBuying(false);
      return;
    }

    setBought(true);
    setBuying(false);
    onPurchase?.(pid);
  };

  return (
    <>
      <Card
        className={`group cursor-pointer overflow-hidden shadow-card transition-all duration-300 hover:shadow-card-hover relative ${bought ? "opacity-80" : ""}`}
        onClick={() => setOpen(true)}
      >
        {/* Sold overlay ribbon */}
        {bought && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-28 h-28 overflow-hidden">
              <div className="absolute top-4 right-[-28px] w-36 bg-destructive text-destructive-foreground text-xs font-bold text-center py-1 rotate-45 shadow-md tracking-widest">
                SOLD
              </div>
            </div>
          </div>
        )}

        <div className="relative h-48 overflow-hidden bg-muted">
          <img
            src={imgSrc}
            alt={title}
            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${bought ? "grayscale-[40%]" : ""}`}
          />
          <Badge className="absolute right-3 top-3 border-none bg-primary/80 text-xs font-medium text-primary-foreground capitalize">
            {ptype}
          </Badge>
          {/* Availability dot */}
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 backdrop-blur-sm">
            <span className={`h-2 w-2 rounded-full ${bought ? "bg-red-400" : "bg-emerald-400 animate-pulse"}`} />
            <span className="text-[10px] font-semibold text-white tracking-wide">
              {bought ? "Sold" : "Available"}
            </span>
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="font-display text-base font-semibold text-foreground line-clamp-1">{title}</h3>
          <p className="font-display text-2xl font-bold text-foreground mt-1">
            ${price.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span className="line-clamp-1">{address}, {city}{state ? `, ${state}` : ""}</span>
          </div>
          <div className="mt-3 flex items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" />{rooms} Beds</span>
            <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" />{bath} Baths</span>
            <span className="flex items-center gap-1"><Maximize className="h-3.5 w-3.5" />{ssqft.toLocaleString()} sqft</span>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="p-6 space-y-4">
                  <DialogHeader>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.4 }}
                    >
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <DialogTitle className="font-display text-2xl text-muted">{title}</DialogTitle>
                        {/* Status pill in dialog */}
                        <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${bought ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"}`}>
                          {bought
                            ? <><XCircle className="h-3.5 w-3.5" /> Sold</>
                            : <><CheckCircle2 className="h-3.5 w-3.5" /> Available</>
                          }
                        </div>
                      </div>
                      <DialogDescription className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-4 w-4" /> {address}, {city}{state ? `, ${state}` : ""}
                      </DialogDescription>
                    </motion.div>
                  </DialogHeader>

                  <Badge className="border-none bg-primary/80 text-sm font-medium text-primary-foreground capitalize w-fit">
                    {ptype}
                  </Badge>

                  <motion.p
                    className="font-display text-3xl font-bold text-muted"
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  >
                    ${price.toLocaleString()}
                  </motion.p>

                  {descri && (
                    <motion.p
                      className="text-sm text-muted-foreground leading-relaxed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                    >
                      {descri}
                    </motion.p>
                  )}

                  <motion.div
                    className="flex items-center gap-6 border-t border-border pt-4 text-sm text-muted-foreground"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.4 }}
                  >
                    <span className="flex items-center gap-2"><BedDouble className="h-5 w-5" />{rooms} Bedrooms</span>
                    <span className="flex items-center gap-2"><Bath className="h-5 w-5" />{bath} Bathrooms</span>
                    <span className="flex items-center gap-2"><Maximize className="h-5 w-5" />{ssqft.toLocaleString()} sqft</span>
                  </motion.div>

                  <motion.div
                    className="rounded-lg border border-border bg-muted/50 p-4 space-y-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.4 }}
                  >
                    <h4 className="font-display text-sm font-semibold text-foreground">Owner Contact</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{ownerName || "Not provided"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{ownerContact || "Not provided"}</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Buy Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                  >
                    {bought ? (
                      <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-400">
                        <XCircle className="h-4 w-4" />
                        Property Sold!.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Button
                          className="w-full gap-2 font-semibold"
                          onClick={(e) => { e.stopPropagation(); handleBuy(); }}
                          disabled={buying || !currentUserId}
                        >
                          {buying ? (
                            <>
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="h-4 w-4" />
                              Buy Property — ${price.toLocaleString()}
                            </>
                          )}
                        </Button>
                        {!currentUserId && (
                          <p className="text-center text-xs text-muted-foreground">
                            You must be logged in to purchase a property.
                          </p>
                        )}
                        {buyError && (
                          <p className="text-center text-xs text-destructive">{buyError}</p>
                        )}
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
