import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import PropertyCard from "@/components/PropertyCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { toast } from "@/components/ui/sonner";
import { UUID } from "crypto";

interface Property {
  pid: UUID;
  descri: string;
  title: string;
  price: number;
  address: string;
  city: string;
  rooms: number;
  bath: number;
  ssqft: number;
  ptype: string;
  image_url: string | null;
}
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const Sclient = createClient(supabaseUrl, supabaseKey);

const Properties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchProperties = async () => {
      const { data, error } = await Sclient
        .from("property")
        .select("*")
        .order("rooms", { ascending: false });
        

      if (!error && data) {
        setProperties(data);
      }
      setLoading(false);
    };
    fetchProperties();
  }, []);

const filtered = properties.filter((p) => {
  // 1. If search is empty, this returns true for everyone
  const matchesSearch = 
    search === "" || 
    [p.title, p.address, p.city].some(field => 
      field?.toLowerCase().includes(search.toLowerCase())
    );

  // 2. If typeFilter is "all", this returns true for everyone
  const matchesType = typeFilter === "all" || p.ptype === typeFilter;

  return matchesSearch && matchesType;
});
  return (
    <div className="min-h-screen bg-card">
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-muted">Search Properties</h1>
        <p className="mt-1 font-body text-muted-foreground">Browse and filter through all listed properties</p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-card sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Search by title, address, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 font-body text-muted"
          />
        </div>
        <div className="flex gap-3">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px] font-body text-muted bg-gradient-accent/10 border-2 transition-transform border-white/30 focus:border-0 ">
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
          {/* <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] font-body">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent> */}
          {/* </Select> */}
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
            <PropertyCard rooms={p.rooms} bath={p.bath} ssqft={p.ssqft} ptype={p.ptype} key={p.pid} {...p} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="font-display text-xl font-semibold text-muted">No properties found</h3>
          <p className="mt-1 font-body text-sm text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
    </div>
  );
};

export default Properties;
