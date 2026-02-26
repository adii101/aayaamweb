import { Link, useLocation } from "wouter";
import { useUser } from "@/hooks/use-local-store";
import { motion } from "framer-motion";
import { UserCircle, Ticket, Calendar, Home, LogOut } from "lucide-react";
import { ComicButton } from "../ComicButton";

export function Navbar() {
  const [location] = useLocation();
  const { user, logout } = useUser();

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/fest-pass", label: "Fest Pass", icon: Ticket },
  ];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", bounce: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 p-4"
    >
      <div className="max-w-6xl mx-auto bg-white comic-border comic-shadow flex items-center justify-between p-3 rounded-2xl">
        <Link href="/" className="font-display text-3xl md:text-4xl text-[hsl(var(--tertiary))] text-comic-stroke tracking-widest cursor-pointer hover:scale-105 transition-transform">
          AAYAAM <span className="text-[hsl(var(--secondary))]">26</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={`font-bold text-xl uppercase tracking-wide hover:text-[hsl(var(--secondary))] hover:-translate-y-1 transition-all flex items-center gap-2 ${location === link.href ? 'text-[hsl(var(--secondary))] underline decoration-4 underline-offset-4' : 'text-black'}`}
            >
              <link.icon size={20} strokeWidth={3} />
              {link.label}
            </Link>
          ))}
          
          <div className="w-1 h-8 bg-black mx-2 rounded-full"></div>

          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center gap-2 font-display text-2xl text-[hsl(var(--primary))] text-comic-stroke hover:scale-105 transition-transform cursor-pointer">
                <UserCircle size={28} strokeWidth={2} />
                {user.name.split(' ')[0]}
              </Link>
              <button onClick={() => logout()} className="p-2 hover:bg-gray-100 rounded-full transition-colors border-2 border-transparent hover:border-black">
                <LogOut size={24} className="text-red-500" strokeWidth={3} />
              </button>
            </div>
          ) : (
            <Link href="/login">
              <ComicButton variant="accent" size="sm" className="flex items-center gap-2">
                <UserCircle size={20} /> Login
              </ComicButton>
            </Link>
          )}
        </div>

        {/* Mobile Nav (Simplified) */}
        <div className="flex md:hidden items-center gap-3">
          {user ? (
            <Link href="/dashboard">
              <ComicButton variant="primary" size="sm" className="px-3 py-1 text-sm">
                Dashboard
              </ComicButton>
            </Link>
          ) : (
            <Link href="/login">
              <ComicButton variant="accent" size="sm" className="px-3 py-1 text-sm">
                Login
              </ComicButton>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white comic-border border-b-0 rounded-t-3xl p-3 flex justify-around md:hidden z-50">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className={`flex flex-col items-center p-2 rounded-xl transition-colors ${location === link.href ? 'bg-[hsl(var(--primary))] comic-border' : ''}`}>
             <link.icon size={24} strokeWidth={location === link.href ? 3 : 2} className={location === link.href ? "text-black" : "text-gray-600"} />
             <span className={`text-xs mt-1 font-bold ${location === link.href ? 'text-black' : 'text-gray-600'}`}>{link.label}</span>
          </Link>
        ))}
      </div>
    </motion.nav>
  );
}
