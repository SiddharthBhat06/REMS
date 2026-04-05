import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { Building2, LogOut, Menu, X, User as UserIcon, Settings, PlusCircle, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { createClient } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const Sclient = createClient(supabaseUrl, supabaseKey);

const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null); // State to store the user's role
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  

  // Helper function to fetch role from your 'users' table
  const fetchUserRole = async (userId: string) => {
const { data, error } = await Sclient // Use Sclient if that's what you named it
  .from("users")
  .select("role")
  .eq("uid", userId)
  .single();

    if (!error && data) {
      setRole(data.role);
    } else {
      setRole(null);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) fetchUserRole(currentUser.id);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchUserRole(currentUser.id);
      } else {
        setRole(null); // Clear role on logout
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-gray-900/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
          <Building2 className="h-7 w-7 text-orange-500" />
          <span className="font-display text-xl font-bold">
            <span className="text-orange-500">RE</span>
            <span className="text-white">MS</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <Link to="/properties" className="text-sm font-medium text-gray-300 transition-colors hover:text-orange-500">
            Search Properties
          </Link>

          {/* Render ONLY if user is an Owner */}
          {role === "Owner" && (
            <Link to="/add-property" className="text-sm font-medium text-gray-300 transition-colors hover:text-orange-500">
              Add Property
            </Link>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-white/20 p-0 hover:bg-white/10">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt="Profile" />
                    <AvatarFallback className="bg-orange-500 text-white">
                      {user.email?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    {role && <p className="text-[10px] font-bold uppercase text-orange-500">{role}</p>}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <UserIcon className="mr-2 h-4 w-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Button 
                    variant="ghost" 
                    onClick={handleLogout} 
                    className="w-full justify-start gap-2 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button size="sm" className="bg-orange-500 font-semibold text-white hover:bg-orange-600">
                Sign In
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="text-white md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute left-0 top-16 w-full border-b border-white/10 bg-gray-900 px-4 py-6 md:hidden">
          <div className="flex flex-col gap-4">
            <Link to="/properties" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-lg font-medium text-gray-300">
              <Search className="h-5 w-5" /> Search Properties
            </Link>

            {/* Mobile Render ONLY if user is an Owner */}
            {role === "Owner" && (
              <Link to="/add-property" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-lg font-medium text-gray-300">
                <PlusCircle className="h-5 w-5" /> Add Property
              </Link>
            )}

            <hr className="border-white/10" />
            {user ? (
              <Button 
                variant="destructive" 
                onClick={handleLogout} 
                className="w-full justify-center gap-2"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            ) : (
              <Link to="/auth" onClick={() => setMenuOpen(false)}>
                <Button className="w-full bg-orange-500 text-white">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;