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
    <nav 
      className="sticky top-0 z-[100] w-full border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-md"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105">
          <Building2 className="h-7 w-7 text-[#4ade80]" />
          <span className="text-xl font-black tracking-tighter">
            <span className="text-[#4ade80]">RE</span>
            <span className="text-white">MS</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <Link to="/properties" className="text-[13px] font-bold uppercase tracking-widest text-white/50 transition-colors hover:text-[#4ade80]">
            Search Properties
          </Link>

          {/* Render ONLY if user is an Owner */}
          {role === "Owner" && (
            <Link to="/add-property" className="text-[13px] font-bold uppercase tracking-widest text-white/50 transition-colors hover:text-[#4ade80]">
              Add Property
            </Link>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-xl border border-white/10 p-0 hover:bg-white/5 transition-all hover:border-[#4ade80]/30">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt="Profile" />
                    <AvatarFallback className="bg-[#4ade80] text-[#052e16] font-bold text-xs">
                      {user.email?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-56 mt-2 border border-white/10 bg-[#0a0a0f] shadow-2xl" 
                align="end" 
                forceMount
                style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
              >
                <DropdownMenuLabel className="font-normal p-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-xs font-medium text-white/40 leading-none">{user.email}</p>
                    {role && <p className="text-[10px] font-black uppercase tracking-widest text-[#4ade80]">{role}</p>}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem 
                  onClick={() => navigate("/profile")}
                  className="focus:bg-white/5 text-[#4ade80] cursor-pointer py-2.5"
                >
                  <UserIcon className="mr-2 h-4 w-4" /> 
                  <span className="text-xs font-bold uppercase tracking-wide">Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem asChild className="p-1">
                  <Button 
                    variant="ghost" 
                    onClick={handleLogout} 
                    className="w-full justify-start gap-2 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors h-9 px-2"
                  >
                    <LogOut className="h-4 w-4" /> 
                    <span className="text-xs font-bold uppercase tracking-wide">Sign Out</span>
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button size="sm" className="bg-[#4ade80] h-9 px-5 text-[12px] font-black uppercase tracking-widest text-[#052e16] hover:bg-[#22c55e] transition-all hover:-translate-y-0.5 rounded-xl">
                Sign In
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="text-white/70 hover:text-[#4ade80] md:hidden transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute left-0 top-16 w-full border-b border-white/10 bg-[#0a0a0f] px-6 py-8 md:hidden shadow-2xl">
          <div className="flex flex-col gap-6">
            <Link 
              to="/properties" 
              onClick={() => setMenuOpen(false)} 
              className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em] text-white/60 hover:text-[#4ade80]"
            >
              <Search className="h-5 w-5" /> Search Properties
            </Link>

            {/* Mobile Render ONLY if user is an Owner */}
            {role === "Owner" && (
              <Link 
                to="/add-property" 
                onClick={() => setMenuOpen(false)} 
                className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em] text-white/60 hover:text-[#4ade80]"
              >
                <PlusCircle className="h-5 w-5" /> Add Property
              </Link>
            )}

            <div className="h-[1px] w-full bg-white/5" />
            
            {user ? (
              <Button 
                variant="ghost" 
                onClick={handleLogout} 
                className="w-full justify-center gap-2 text-rose-400 border border-rose-500/20 bg-rose-500/5 h-12 text-xs font-black uppercase tracking-widest"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            ) : (
              <Link to="/auth" onClick={() => setMenuOpen(false)}>
                <Button className="w-full bg-[#4ade80] text-[#052e16] h-12 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#22c55e]">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;