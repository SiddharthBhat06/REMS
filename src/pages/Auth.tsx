import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Building2, Home } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const Sclient = createClient(supabaseUrl, supabaseKey);

async function adduser(uid: string, email: string, fullName: string, role: string, contact: string) {
  const { error: userError } = await Sclient
    .from("users")
    .insert({ 
      uid: uid,
      uname: fullName, 
      email: email, 
      role: role
    });
  
  if (userError) throw userError;

  if (role === "Owner") {
    const { error: ownerError } = await Sclient
      .from("owners")
      .insert({
        uid: uid,
        name: fullName,
        contact: contact || null,
      });
    if (ownerError) throw ownerError;
  } else if (role === "Tenant") {
    const { error: tenantError } = await Sclient
      .from("tenants")
      .insert({
        uid: uid,
        Name: fullName,
        contact: contact || null,
      });
    if (tenantError) throw tenantError;
  }
}

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [contact, setContact] = useState("");
  const [role, setRole] = useState<"Owner" | "Tenant">("Owner");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await Sclient.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/properties");
      } else {
        const { data, error: authError } = await Sclient.auth.signUp({
          email,
          password,
        });

        if (authError) throw authError;

        if (data.user) {
          await adduser(data.user.id, email, fullName, role, contact); 
        }

        toast({ 
          title: "Account created!", 
          description: "You can now sign in.",
          className: "bg-green-500 text-white" 
        });
        setIsLogin(true);
      }
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message, 
        variant: "destructive", 
        className: "bg-red-500 text-white" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-card">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-accent">
            <Building2 className="h-6 w-6 text-accent-foreground" />
          </div>
          <CardTitle className="font-display text-2xl text-primary-foreground">
            {isLogin ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription className="font-body">
            {isLogin ? "Sign in to manage your properties" : "Start managing real estate today"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="font-body text-sm text-primary-foreground">Full Name</Label>
                  <Input 
                    id="fullName" 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)} 
                    placeholder="John Doe" 
                    required 
                    className="text-primary-foreground" 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact" className="font-body text-sm text-primary-foreground">Contact (Phone)</Label>
                  <Input 
                    id="contact" 
                    value={contact} 
                    onChange={(e) => setContact(e.target.value)} 
                    placeholder="+1 234 567 8901" 
                    className="text-primary-foreground" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>I am a</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole("Owner")}
                      className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                        role === "Owner"
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      <Building2 className="h-6 w-6" />
                      <span className="text-sm font-semibold">Owner</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("Tenant")}
                      className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                        role === "Tenant"
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      <Home className="h-6 w-6" />
                      <span className="text-sm font-semibold">Tenant</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="font-body text-sm text-primary-foreground">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="you@example.com" 
                required 
                className="text-primary-foreground" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-body text-sm text-primary-foreground">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••" 
                required 
                minLength={6} 
                className="text-primary-foreground" 
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-gradient-accent font-body font-semibold text-accent-foreground hover:opacity-90"
            >
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <p className="mt-4 text-center font-body text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="font-semibold text-accent hover:underline"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
