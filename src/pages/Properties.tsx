import { useEffect, useState } from "react";
import PropertyCard from "@/components/PropertyCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

interface Property {
  pid: string;
  uid: string;
  title: string;
  descri: string;
  city: string;
  state: string;
  address: string;
  ptype: string;
  rooms: number;
  bath: number;
  ssqft: number;
  price: number;
  iurl: string | null;
}

interface Owner {
  oid: string;
  uid: string;
  name: string;
  contact: string | null;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const Sclient = createClient(supabaseUrl, supabaseKey);

const Properties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [soldPids, setSoldPids] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");

  // Retrieve the currently logged-in user's uid from Supabase Auth
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await Sclient.auth.getUser();
      setCurrentUserId(data?.user?.id ?? undefined);
    };
    getUser();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const [propResult, ownerResult, txResult] = await Promise.all([
        Sclient.from("property").select("*").order("rooms", { ascending: false }),
        Sclient.from("owners").select("*"),
        // Fetch all transactions where status is 'bought'
        Sclient.from("transactions").select("pid").eq("status", "active"),
      ]);

      if (!propResult.error && propResult.data) {
        setProperties(propResult.data);
      }
      if (!ownerResult.error && ownerResult.data) {
        setOwners(ownerResult.data);
      }
      if (!txResult.error && txResult.data) {
        const pids = new Set(txResult.data.map((t: { pid: string }) => t.pid));
        setSoldPids(pids);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const getOwner = (uid: string) => owners.find((o) => o.uid === uid);

  // Called when a purchase is made in a card — mark it sold locally without refetch
  const handlePurchase = (pid: string) => {
    setSoldPids((prev) => new Set([...prev, pid]));
  };

  const filtered = properties.filter((p) => {
    const matchesSearch =
      search === "" ||
      [p.title, p.address, p.city].some((field) =>
        field?.toLowerCase().includes(search.toLowerCase())
      );
    const matchesType = typeFilter === "all" || p.ptype === typeFilter;
    const isSold = soldPids.has(p.pid);
    const matchesAvailability =
      availabilityFilter === "all" ||
      (availabilityFilter === "available" && !isSold) ||
      (availabilityFilter === "sold" && isSold);
    return matchesSearch && matchesType && matchesAvailability;
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
          <div className="flex gap-3 flex-wrap">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px] font-body text-muted bg-gradient-accent/10 border-2 transition-transform border-white/30 focus:border-0">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Residential">Residential</SelectItem>
                <SelectItem value="Commercial">Commercial</SelectItem>
                <SelectItem value="Industrial">Industrial</SelectItem>
                <SelectItem value="Land">Land</SelectItem>
              </SelectContent>
            </Select>

            {/* Availability filter */}
            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger className="w-[160px] font-body text-muted bg-gradient-accent/10 border-2 transition-transform border-white/30 focus:border-0">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Availability</SelectItem>
                <SelectItem value="available">Available Only</SelectItem>
                <SelectItem value="sold">Sold Only</SelectItem>
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
            {filtered.map((p) => {
              const owner = getOwner(p.uid);
              const isSold = soldPids.has(p.pid);
              return (
                <PropertyCard
                  key={p.pid}
                  pid={p.pid}
                  uid={p.uid}
                  title={p.title}
                  descri={p.descri}
                  price={p.price}
                  address={p.address}
                  city={p.city}
                  state={p.state}
                  rooms={p.rooms}
                  bath={p.bath}
                  ssqft={p.ssqft}
                  ptype={p.ptype}
                  iurl={p.iurl}
                  ownerName={owner?.name}
                  ownerContact={owner?.contact ?? undefined}
                  isSold={isSold}
                  currentUserId={currentUserId}
                  onPurchase={handlePurchase}
                />
              );
            })}
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
