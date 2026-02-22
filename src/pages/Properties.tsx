import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import PropertyCard from "@/components/PropertyCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";

interface Property {
  id: string;
  title: string;
  description: string | null;
  price: number;
  address: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  area_sqft: number;
  property_type: string;
  status: string;
  image_url: string | null;
}

const Properties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchProperties = async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("id, title, description, price, address, city, bedrooms, bathrooms, area_sqft, property_type, status, image_url")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setProperties(data);
      }
      setLoading(false);
    };
    fetchProperties();
  }, []);

  const filtered = properties.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.address.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || p.property_type === typeFilter;
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Search Properties</h1>
        <p className="mt-1 font-body text-muted-foreground">Browse and filter through all listed properties</p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-card sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title, address, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 font-body"
          />
        </div>
        <div className="flex gap-3">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px] font-body">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="residential">Residential</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="industrial">Industrial</SelectItem>
              <SelectItem value="land">Land</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] font-body">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PropertyCard
              key={p.id}
              title={p.title}
              descri={p.description || ""}
              price={p.price}
              address={p.address}
              city={p.city}
              rooms={p.bedrooms}
              bath={p.bathrooms}
              ssqft={p.area_sqft}
              ptype={p.property_type}
              image_url={p.image_url}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <h3 className="font-display text-xl font-semibold text-foreground">No properties found</h3>
          <p className="mt-1 font-body text-sm text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default Properties;
