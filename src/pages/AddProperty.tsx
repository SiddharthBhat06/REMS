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
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-2xl text-muted">
            <Plus className="h-6 w-6 text-accent" />
            Add New Property
          </CardTitle>
          <CardDescription className="font-body text-muted-foreground">Fill in the details to list a new property</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label className="font-script text-sm text-muted">Title *</Label>
              <Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Modern 3BR Apartment" required maxLength={200} className="font-body text-muted border-2 transition-transform border-white/30 focus:border-0"/>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="font-body text-sm text-muted">Description</Label>
              <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Describe the property..." rows={3} maxLength={2000} className="font-body text-muted border-2 transition-transform border-white/30 focus:border-0" />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label className="font-body text-sm text-muted">Type *</Label>
              <Select value={form.property_type} onValueChange={(v) => update("property_type", v)}>
                <SelectTrigger className="font-body text-muted border-2 transition-transform border-white/30 focus:border-0"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Residential">Residential</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                  <SelectItem value="Industrial">Industrial</SelectItem>
                  <SelectItem value="Land">Land</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price, Beds, Baths, Area */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="space-y-2">
                <Label className="font-body text-sm text-muted">Price (₹) *</Label>
                <Input type="number" value={form.price} onChange={(e) => update("price", e.target.value)} placeholder="250000" required min="0" className="font-body text-muted border-2 transition-transform border-white/30 focus:border-0"/>
              </div>
              <div className="space-y-2">
                <Label className="font-body text-sm text-muted">Rooms</Label>
                <Input type="number" value={form.bedrooms} onChange={(e) => update("bedrooms", e.target.value)} placeholder="3" min="0" className="font-body text-muted border-2 transition-transform border-white/30 focus:border-0"/>
              </div>
              <div className="space-y-2">
                <Label className="font-body text-sm text-muted">Bathrooms</Label>
                <Input type="number" value={form.bathrooms} onChange={(e) => update("bathrooms", e.target.value)} placeholder="2" min="0" className="font-body text-muted border-2 transition-transform border-white/30 focus:border-0"/>
              </div>
              <div className="space-y-2">
                <Label className="font-body text-sm text-muted">Area (sqft)</Label>
                <Input type="number" value={form.area_sqft} onChange={(e) => update("area_sqft", e.target.value)} placeholder="1500" min="0" className="font-body text-muted border-2 transition-transform border-white/30 focus:border-0"/>
              </div>
            </div>

            {/* Address, City, State */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label className="font-body text-sm text-muted">Address *</Label>
                <Input value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="123 Main St" required maxLength={300} className="font-body text-muted border-2 transition-transform border-white/30 focus:border-0"/>
              </div>
              <div className="space-y-2">
                <Label className="font-body text-sm text-muted">City *</Label>
                <Input value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="New York" required maxLength={100} className="font-body text-muted border-2 transition-transform border-white/30 focus:border-0"/>
              </div>
              <div className="space-y-2">
                <Label className="font-body text-sm text-muted">State</Label>
                <Input value={form.state} onChange={(e) => update("state", e.target.value)} placeholder="NY" maxLength={50} className="font-body text-muted border-2 transition-transform border-white/30 focus:border-0"/>
              </div>
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label className="font-body text-sm text-muted">Image URL</Label>
              <Input value={form.iurl} onChange={(e) => update("iurl", e.target.value)} placeholder="https://example.com/image.jpg" maxLength={500} className="font-body text-muted border-2 transition-transform border-white/30 focus:border-0"/>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-gradient-accent font-body font-semibold text-accent-foreground hover:opacity-90">
              {loading ? "Adding..." : "Add Property"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddProperty;
