import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

const AddProperty = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState({
    title: "",
    description: "",
    property_type: "residential",
    status: "available",
    price: "",
    bedrooms: "",
    bathrooms: "",
    area_sqft: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    image_url: "",
  });

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Error", description: "You must be signed in.", variant: "destructive" });
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("properties").insert({
      user_id: user.id,
      title: form.title.trim(),
      description: form.description.trim() || null,
      property_type: form.property_type,
      status: form.status,
      price: parseFloat(form.price) || 0,
      bedrooms: parseInt(form.bedrooms) || 0,
      bathrooms: parseInt(form.bathrooms) || 0,
      area_sqft: parseFloat(form.area_sqft) || 0,
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim() || null,
      zip_code: form.zip_code.trim() || null,
      image_url: form.image_url.trim() || null,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success!", description: "Property listed successfully." });
      navigate("/properties");
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-2xl">
            <Plus className="h-6 w-6 text-accent" />
            Add New Property
          </CardTitle>
          <CardDescription className="font-body">Fill in the details to list a new property</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label className="font-body text-sm">Title *</Label>
              <Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Modern 3BR Apartment" required maxLength={200} />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="font-body text-sm">Description</Label>
              <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Describe the property..." rows={3} maxLength={2000} />
            </div>

            {/* Type & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-body text-sm">Type *</Label>
                <Select value={form.property_type} onValueChange={(v) => update("property_type", v)}>
                  <SelectTrigger className="font-body"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-body text-sm">Status *</Label>
                <Select value={form.status} onValueChange={(v) => update("status", v)}>
                  <SelectTrigger className="font-body"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price, Beds, Baths, Area */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="space-y-2">
                <Label className="font-body text-sm">Price ($) *</Label>
                <Input type="number" value={form.price} onChange={(e) => update("price", e.target.value)} placeholder="250000" required min="0" />
              </div>
              <div className="space-y-2">
                <Label className="font-body text-sm">Bedrooms</Label>
                <Input type="number" value={form.bedrooms} onChange={(e) => update("bedrooms", e.target.value)} placeholder="3" min="0" />
              </div>
              <div className="space-y-2">
                <Label className="font-body text-sm">Bathrooms</Label>
                <Input type="number" value={form.bathrooms} onChange={(e) => update("bathrooms", e.target.value)} placeholder="2" min="0" />
              </div>
              <div className="space-y-2">
                <Label className="font-body text-sm">Area (sqft)</Label>
                <Input type="number" value={form.area_sqft} onChange={(e) => update("area_sqft", e.target.value)} placeholder="1500" min="0" />
              </div>
            </div>

            {/* Address */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="font-body text-sm">Address *</Label>
                <Input value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="123 Main St" required maxLength={300} />
              </div>
              <div className="space-y-2">
                <Label className="font-body text-sm">City *</Label>
                <Input value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="New York" required maxLength={100} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="font-body text-sm">State</Label>
                <Input value={form.state} onChange={(e) => update("state", e.target.value)} placeholder="NY" maxLength={50} />
              </div>
              <div className="space-y-2">
                <Label className="font-body text-sm">Zip Code</Label>
                <Input value={form.zip_code} onChange={(e) => update("zip_code", e.target.value)} placeholder="10001" maxLength={20} />
              </div>
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label className="font-body text-sm">Image URL</Label>
              <Input value={form.image_url} onChange={(e) => update("image_url", e.target.value)} placeholder="https://example.com/image.jpg" maxLength={500} />
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
