import { useEffect, useState } from "react";
import PropertyCard from "@/components/PropertyCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, Home } from "lucide-react";
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
        Sclient.from("transactions").select("pid").eq("status", "active"),
      ]);
      if (!propResult.error && propResult.data) setProperties(propResult.data);
      if (!ownerResult.error && ownerResult.data) setOwners(ownerResult.data);
      if (!txResult.error && txResult.data)
        setSoldPids(new Set(txResult.data.map((t: { pid: string }) => t.pid)));
      setLoading(false);
    };
    fetchData();
  }, []);

  const getOwner = (uid: string) => owners.find((o) => o.uid === uid);

  const handlePurchase = (pid: string) => {
    setSoldPids((prev) => new Set([...prev, pid]));
  };

  const filtered = properties.filter((p) => {
    const matchesSearch =
      search === "" ||
      [p.title, p.address, p.city].some((f) => f?.toLowerCase().includes(search.toLowerCase()));
    const matchesType = typeFilter === "all" || p.ptype === typeFilter;
    const isSold = soldPids.has(p.pid);
    const matchesAvailability =
      availabilityFilter === "all" ||
      (availabilityFilter === "available" && !isSold) ||
      (availabilityFilter === "sold" && isSold);
    return matchesSearch && matchesType && matchesAvailability;
  });

  const availableCount = properties.filter((p) => !soldPids.has(p.pid)).length;
  const soldCount = soldPids.size;

  return (
    <div className="min-h-screen bg-[#15243a]">
      {/* Page header */}
      <div className="bg-[#15243a]">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Search Properties</h1>
              <p className="mt-1 text-sm text-slate-400">Browse and filter through all listed properties</p>
            </div>
            {!loading && (
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="flex items-center gap-1.5 rounded-full border border-emerald-600/40 bg-emerald-900/30 px-3 py-1.5 text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {availableCount} Available
                </span>
                <span className="flex items-center gap-1.5 rounded-full border border-rose-600/40 bg-rose-900/30 px-3 py-1.5 text-rose-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                  {soldCount} Sold
                </span>
                <span className="flex items-center gap-1.5 rounded-full border border-slate-600/50 bg-slate-700/40 px-3 py-1.5 text-slate-300">
                  <Home className="h-3 w-3" />
                  {properties.length} Total
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filter bar */}
        <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-slate-600/50 bg-slate-700 p-4 shadow-md sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              placeholder="Search by title, address, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 text-slate-200 placeholder:text-slate-500 border-slate-600/50 bg-slate-800/50 focus:bg-slate-800 focus:border-sky-500/60 transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[148px] text-slate-300 border-slate-600/50 bg-slate-800/50 hover:bg-slate-800 hover:border-sky-500/50 transition-colors">
                <SlidersHorizontal className="mr-2 h-3.5 w-3.5 text-slate-500" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="border-slate-600 bg-[#1e2d45] text-slate-200">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Residential">Residential</SelectItem>
                <SelectItem value="Commercial">Commercial</SelectItem>
                <SelectItem value="Industrial">Industrial</SelectItem>
                <SelectItem value="Land">Land</SelectItem>
              </SelectContent>
            </Select>

            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger className="w-[158px] text-slate-300 border-slate-600/50 bg-slate-800/50 hover:bg-slate-800 hover:border-sky-500/50 transition-colors">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent className="border-slate-600 bg-[#1e2d45] text-slate-200">
                <SelectItem value="all">All Listings</SelectItem>
                <SelectItem value="available">Available Only</SelectItem>
                <SelectItem value="sold">Sold Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="mb-4 text-xs text-slate-500 font-medium uppercase tracking-widest">
            {filtered.length} {filtered.length === 1 ? "property" : "properties"} found
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-slate-700/40" />
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
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-600/50 bg-[#1e2d45] shadow-md">
              <Search className="h-7 w-7 text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-300">No properties found</h3>
            <p className="mt-1 text-sm text-slate-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties;
