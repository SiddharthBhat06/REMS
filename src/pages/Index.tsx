import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building2, Search, PlusCircle, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: Search, title: "Smart Search", desc: "Filter properties by type, status, location and more." },
  { icon: PlusCircle, title: "Easy Listings", desc: "Add new properties with all details in seconds." },
  { icon: ShieldCheck, title: "Secure Access", desc: "Role-based authentication keeps your data safe." },
];

const Index = () => {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative flex min-h-[70vh] items-center justify-center bg-gradient-hero px-4 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(35_85%_52%_/_0.08)_0%,_transparent_60%)]" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative z-10 max-w-2xl"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-accent">
            <Building2 className="h-8 w-8 text-accent-foreground" />
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight text-primary-foreground sm:text-5xl lg:text-6xl">
            Manage Your Real Estate Portfolio
          </h1>
          <p className="mx-auto mt-4 max-w-lg font-body text-base text-primary-foreground/70 sm:text-lg">
            A powerful DBMS to search, list, and manage properties — all in one place.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-accent px-8 font-body font-semibold text-accent-foreground hover:opacity-90">
                Get Started
              </Button>
            </Link>
            <Link to="/properties">
              <Button size="lg" variant="outline" className="border-primary-foreground/20 px-8 font-body font-semibold text-primary-foreground hover:bg-primary-foreground/10">
                Browse Properties
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground">Everything You Need</h2>
          <p className="mt-2 font-body text-muted-foreground">Streamlined tools for real estate management</p>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="rounded-xl border border-border bg-card p-6 text-center shadow-card transition-all hover:shadow-card-hover"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                <f.icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 font-body text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
