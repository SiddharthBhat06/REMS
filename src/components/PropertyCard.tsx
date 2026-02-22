import { useState } from "react";
import { Bath, BedDouble, Maximize, MapPin, User, Mail, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

interface PropertyCardProps {
  title: string;
  descri: string;
  price: number;
  address: string;
  city: string;
  rooms: number;
  bath: number;
  ssqft: number;
  ptype: string;
  image_url?: string | null;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
}

const imager =
  "https://previews.123rf.com/images/lexlinx/lexlinx2012/lexlinx201200011/161240800-property-logo-home-builder-housing-industry-design-template-idea-for-estate-and-architecture.jpg";

const PropertyCard = ({
  title, descri, price, address, city, rooms, bath, ssqft, ptype, image_url,
  ownerName, ownerEmail, ownerPhone,
}: PropertyCardProps) => {
  const [open, setOpen] = useState(false);
  const imgSrc = image_url || imager;

  return (
    <>
      <Card
        className="group cursor-pointer overflow-hidden shadow-card transition-all duration-300 hover:shadow-card-hover"
        onClick={() => setOpen(true)}
      >
        <div className="relative h-48 overflow-hidden bg-muted">
          <img
            src={imgSrc}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <Badge className="absolute right-3 top-3 border-none bg-primary/80 text-xs font-medium text-primary-foreground capitalize">
            {ptype}
          </Badge>
        </div>
        <CardContent className="p-4">
          <h3 className="font-display text-base font-semibold text-foreground line-clamp-1">{title}</h3>
          <p className="font-display text-2xl font-bold text-foreground mt-1">
            ${price.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span className="line-clamp-1">{address}, {city}</span>
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
                      <DialogTitle className="font-display text-2xl text-muted">{title}</DialogTitle>
                      <DialogDescription className="flex items-center gap-1 text-muted">
                        <MapPin className="h-4 w-4" /> {address}, {city}
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
                      className="text-sm text-muted leading-relaxed"
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
                    <h4 className="font-display text-sm font-semibold text-muted">Owner Contact</h4>
                    <div className="space-y-2 text-sm text-muted">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{ownerName || "Not provided"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{ownerEmail || "Not provided"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{ownerPhone || "Not provided"}</span>
                      </div>
                    </div>
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
