import { useEffect, useState } from "react";
import PropertyCard from "@/components/PropertyCard";
import { Search } from "lucide-react";
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

  // Statistics Calculation
  const totalListed = properties.length;
  const totalSold = soldPids.size;
  const totalAvailable = totalListed - totalSold;

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
      if (!txResult.error && txResult.data) {
        const pids = new Set(txResult.data.map((t: { pid: string }) => t.pid));
        setSoldPids(pids);
      }
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
    <div className="min-h-screen relative overflow-hidden" style={{
      background: `radial-gradient(at 0% 0%, rgba(74, 222, 128, 0.05) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(59, 130, 246, 0.05) 0px, transparent 50%), #050508`,
      fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    }}>
      <style>{`
        .search-bar { display: flex; flex-direction: column; gap: 12px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 20px; backdrop-filter: blur(24px); margin-bottom: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        @media (min-width: 640px) { .search-bar { flex-direction: row; align-items: center; } }
        .search-input-wrap { position: relative; flex: 1; }
        .search-input-wrap .icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.2); display: flex; align-items: center; pointer-events: none; }
        .search-input { width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px 14px 12px 42px; color: white; font-size: 14px; outline: none; transition: all 0.2s ease; box-sizing: border-box; }
        .search-input:focus { border-color: rgba(74, 222, 128, 0.4); background: rgba(255,255,255,0.05); }
        
        .filter-select { 
          background: rgba(255,255,255,0.03); 
          border: 1px solid rgba(255,255,255,0.08); 
          border-radius: 12px; 
          padding: 12px 40px 12px 16px; 
          color: rgba(255,255,255,0.8); 
          font-size: 13px; 
          font-weight: 600; 
          text-transform: uppercase; 
          letter-spacing: 0.05em; 
          outline: none; 
          cursor: pointer; 
          appearance: none; 
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='3'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); 
          background-repeat: no-repeat; 
          background-position: right 14px center; 
        }

        /* Specifically styling the options for visibility */
        .filter-select option {
          background-color: #121214;
          color: #ffffff;
        }

        .filters-wrap { display: flex; gap: 12px; flex-wrap: wrap; }
        .stats-row { display: flex; gap: 12px; margin-bottom: 32px; flex-wrap: wrap; }
        .stat-capsule { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255,255,255,0.06); padding: 6px 14px; border-radius: 10px; display: flex; align-items: center; gap: 8px; }
        .stat-n { font-weight: 800; color: #fff; font-size: 14px; }
        .stat-l { color: rgba(255,255,255,0.4); font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.03em; }
        .skeleton { height: 320px; border-radius: 24px; background: linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.02) 75%); background-size: 200% 100%; animation: shimmer 2s infinite; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .top-accent { height: 2px; background: linear-gradient(90deg, #4ade80, #3b82f6); width: 100%; position: fixed; top: 0; left: 0; z-index: 100; opacity: 0.5; }
      `}</style>

      <div className="top-accent" />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px', position: 'relative', zIndex: 10 }}>

        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontWeight: 900, fontSize: '2.5rem', color: '#fff', margin: 0, letterSpacing: '-0.03em' }}>
            Search <span style={{ color: '#4ade80' }}>Properties</span>
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.3)', marginTop: 8, fontWeight: 500 }}>
            Browse through our curated collection of architectural assets.
          </p>
        </div>

        {!loading && (
          <div className="stats-row">
            <div className="stat-capsule">
              <span className="stat-n">{totalListed}</span>
              <span className="stat-l">Listed</span>
            </div>
            <div className="stat-capsule">
              <span className="stat-n" style={{ color: '#4ade80' }}>{totalAvailable}</span>
              <span className="stat-l">Available</span>
            </div>
            <div className="stat-capsule">
              <span className="stat-n" style={{ color: '#ef4444' }}>{totalSold}</span>
              <span className="stat-l">Sold</span>
            </div>
          </div>
        )}

        <div className="search-bar">
          <div className="search-input-wrap">
            <span className="icon"><Search style={{ width: 18, height: 18 }} /></span>
            <input
              className="search-input"
              placeholder="Search by title, address, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="filters-wrap">
            <select className="filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">All Types</option>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Industrial">Industrial</option>
              <option value="Land">Land</option>
            </select>
            <select className="filter-select" value={availabilityFilter} onChange={(e) => setAvailabilityFilter(e.target.value)}>
              <option value="all">Status: All</option>
              <option value="available">Available</option>
              <option value="sold">Sold Out</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 32 }}>
            {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="skeleton" />)}
          </div>
        ) : filtered.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 32 }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '120px 0', textAlign: 'center' }}>
            <Search style={{ width: 40, height: 40, color: 'rgba(255,255,255,0.1)', marginBottom: 20 }} />
            <h3 style={{ fontWeight: 700, fontSize: 22, color: 'rgba(255,255,255,0.5)', margin: 0 }}>No properties found</h3>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.2)', marginTop: 10 }}>Adjust your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties;