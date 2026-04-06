import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const Sclient = createClient(supabaseUrl, supabaseKey);

const AddProperty = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState({
    title: "",
    description: "",
    property_type: "Residential",
    price: "",
    bedrooms: "",
    bathrooms: "",
    area_sqft: "",
    address: "",
    city: "",
    state: "",
    iurl: "",
  });

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await Sclient.auth.getUser();
    if (!user) {
      toast({ title: "Error", description: "You must be signed in.", variant: "destructive" });
      setLoading(false);
      return;
    }

    const { data: ownerData, error: ownerError } = await Sclient
      .from("owners")
      .select("oid")
      .eq("uid", user.id)
      .single();

    if (ownerError || !ownerData) {
      toast({ title: "Error", description: "Owner record not found. Only owners can add properties.", variant: "destructive" });
      setLoading(false);
      return;
    }

    const { error } = await Sclient.from("property").insert({
      uid: user.id,
      title: form.title.trim(),
      descri: form.description.trim() || "NA",
      city: form.city.trim(),
      state: form.state.trim(),
      address: form.address.trim(),
      ptype: form.property_type,
      rooms: parseInt(form.bedrooms) || 0,
      bath: parseInt(form.bathrooms) || 0,
      ssqft: parseFloat(form.area_sqft) || 0,
      price: parseFloat(form.price) || 0,
      iurl: form.iurl.trim() || null,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success!", description: "Property listed successfully.", className: "bg-green-500 text-white" });
      navigate("/properties");
    }
    setLoading(false);
  };

 return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-12" style={{
      background: 'linear-gradient(135deg, #0a0a0f 0%, #0d0d1a 50%, #0a0f0a 100%)',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@600;700;800&display=swap');

        .glass-panel {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px;
          backdrop-filter: blur(20px);
          overflow: hidden;
        }
        .input-dark {
    width: 100%;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 12px 14px;
    color: rgba(255, 255, 255, 0.9);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    outline: none;
    transition: all 0.2s ease;
    box-sizing: border-box;
    
    background-color: #12121a; 
  }

  .input-dark option {
    background-color: #12121a; 
    color: rgba(255, 255, 255, 0.9);
  }
        .input-dark:focus {
          border-color: rgba(134,239,172,0.4);
          background: rgba(255,255,255,0.06);
        }
        .label-dark {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 8px;
          margin-left: 4px;
        }
        .btn-submit {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #4ade80, #22c55e);
          color: #052e16;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-submit:hover { opacity: 0.9; transform: translateY(-1px); }
        .top-bar {
          height: 4px;
          background: linear-gradient(90deg, #4ade80, #22d3ee, #a78bfa);
          width: 100%;
        }
      `}</style>

      <div className="mx-auto max-w-2xl glass-panel shadow-2xl">
        <div className="top-bar" />
        
        <div className="p-8">
          <div className="mb-8">
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 24, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Plus className="h-7 w-7 text-[#4ade80]" />
              Add New Property
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, marginTop: 4 }}>Fill in the details to list a new property</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label-dark">Title *</label>
              <input className="input-dark" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Modern 3BR Apartment" required maxLength={200} />
            </div>

            <div>
              <label className="label-dark">Description</label>
              <textarea className="input-dark" value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Describe the property..." rows={3} maxLength={2000} style={{ resize: 'none' }} />
            </div>

            <div>
              <label className="label-dark">Property Type *</label>
              <select className="input-dark" value={form.property_type} onChange={(e) => update("property_type", e.target.value)} style={{ appearance: 'none' }}>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Industrial">Industrial</option>
                <option value="Land">Land</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <label className="label-dark">Price (₹) *</label>
                <input type="number" className="input-dark" value={form.price} onChange={(e) => update("price", e.target.value)} placeholder="0" required min="0" />
              </div>
              <div>
                <label className="label-dark">Rooms</label>
                <input type="number" className="input-dark" value={form.bedrooms} onChange={(e) => update("bedrooms", e.target.value)} placeholder="0" min="0" />
              </div>
              <div>
                <label className="label-dark">Baths</label>
                <input type="number" className="input-dark" value={form.bathrooms} onChange={(e) => update("bathrooms", e.target.value)} placeholder="0" min="0" />
              </div>
              <div>
                <label className="label-dark">Sqft</label>
                <input type="number" className="input-dark" value={form.area_sqft} onChange={(e) => update("area_sqft", e.target.value)} placeholder="0" min="0" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="label-dark">Address *</label>
                <input className="input-dark" value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="123 Main St" required maxLength={300} />
              </div>
              <div>
                <label className="label-dark">City *</label>
                <input className="input-dark" value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="New York" required maxLength={100} />
              </div>
              <div>
                <label className="label-dark">State</label>
                <input className="input-dark" value={form.state} onChange={(e) => update("state", e.target.value)} placeholder="NY" maxLength={50} />
              </div>
            </div>

            <div>
              <label className="label-dark">Image URL</label>
              <input className="input-dark" value={form.iurl} onChange={(e) => update("iurl", e.target.value)} placeholder="https://example.com/image.jpg" maxLength={500} />
            </div>

            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? "Adding..." : "Add Property"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProperty;
