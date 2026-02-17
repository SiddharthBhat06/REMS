import { Bath, BedDouble, Maximize, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PropertyCardProps {
  title: string;
  price: number;
  address: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  area_sqft: number;
  property_type: string;
  status: string;
  image_url?: string | null;
}

const PropertyCard = ({
  title, price, address, city, bedrooms, bathrooms, area_sqft, property_type, status, image_url,
}: PropertyCardProps) => {
  const statusColor = status === "available" ? "bg-green-100 text-green-800" : status === "sold" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800";

  return (
    <Card className="group overflow-hidden shadow-card transition-all duration-300 hover:shadow-card-hover">
      <div className="relative h-48 overflow-hidden bg-muted">
        {image_url ? (
          <img src={image_url} alt={title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Maximize className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        <Badge className={`absolute left-3 top-3 ${statusColor} border-none text-xs font-semibold capitalize`}>
          {status}
        </Badge>
        <Badge className="absolute right-3 top-3 border-none bg-primary/80 text-xs font-medium text-primary-foreground capitalize">
          {property_type}
        </Badge>
      </div>
      <CardContent className="p-4">
        <p className="font-display text-2xl font-bold text-foreground">
          ${price.toLocaleString()}
        </p>
        <h3 className="mt-1 font-body text-sm font-semibold text-foreground line-clamp-1">{title}</h3>
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span className="line-clamp-1">{address}, {city}</span>
        </div>
        <div className="mt-3 flex items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" />{bedrooms} Beds</span>
          <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" />{bathrooms} Baths</span>
          <span className="flex items-center gap-1"><Maximize className="h-3.5 w-3.5" />{area_sqft.toLocaleString()} sqft</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
