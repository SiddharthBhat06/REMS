import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { Building2, LogOut, Menu, X } from "lucide-react";

const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-card backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <Building2 className="h-7 w-7 text-accent" />
          <span className="font-display text-xl font-bold text-primary-foreground">PropertyHub</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-6 md:flex">
          {user ? (
            <>
              <Link to="/properties" className="font-body text-sm font-medium text-muted-foreground transition-colors hover:text-muted">
                Search Properties
              </Link>
              <Link to="/add-property" className="font-body text-sm font-medium text-muted-foreground transition-colors hover:text-muted">
                Add Property
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 bg-card text-white bg-gradient-accent hover:opacity-80">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button size="sm" className="bg-gradient-accent font-body font-semibold text-accent-foreground hover:opacity-90">
                Sign In
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="border-t border-border bg-card px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {user ? (
              <>
                <Link to="/properties" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-muted-foreground">
                  Search Properties
                </Link>
                <Link to="/add-property" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-muted-foreground">
                  Add Property
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout} className="w-full gap-2">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setMenuOpen(false)}>
                <Button size="sm" className="w-full bg-primary-foreground font-semibold text-accent-foreground hover:bg-accent-foreground">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
