"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { ShoppingBag, User, LogOut, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    router.push("/login");
  };

  return (
    <nav className="border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
             <ShoppingBag className="h-6 w-6 text-primary" />
          </div>
          <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 dark:to-indigo-400">
            Campus Bazaar
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link href="/listings/create">
                <Button variant="outline" size="sm" className="rounded-full border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors">
                    Sell Item
                </Button>
              </Link>
              <Link href="/messages">
                <Button variant="ghost" size="sm" className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                    Messages
                </Button>
              </Link>
              <div className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
                <User className="h-4 w-4 text-slate-500" />
                <span className="text-slate-700 dark:text-slate-300">{user?.name || user?.email}</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout} 
                title="Logout"
                className="rounded-full hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">Login</Button>
              </Link>
              <Link href="/signup">
                <Button className="rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
                    Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 absolute w-full left-0 animate-in slide-in-from-top-5 fade-in duration-200 shadow-xl">
            <div className="p-4 flex flex-col gap-4">
                {isAuthenticated ? (
                    <>
                        <div className="flex items-center gap-3 px-2 pb-2 border-b dark:border-slate-800">
                             <div className="bg-primary/10 p-2 rounded-full">
                                <User className="h-5 w-5 text-primary" />
                             </div>
                             <div>
                                 <p className="font-semibold text-sm">{user?.name}</p>
                                 <p className="text-xs text-muted-foreground">{user?.email}</p>
                             </div>
                        </div>
                        <Link href="/listings/create" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button className="w-full justify-start" variant="outline">
                                Sell Item
                            </Button>
                        </Link>
                        <Link href="/messages" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button className="w-full justify-start" variant="ghost">
                                Messages
                            </Button>
                        </Link>
                        <Button 
                            variant="destructive" 
                            className="w-full justify-start"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-4 w-4 mr-2" /> Logout
                        </Button>
                    </>
                ) : (
                    <>
                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button variant="ghost" className="w-full justify-start">Login</Button>
                        </Link>
                        <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button className="w-full">Get Started</Button>
                        </Link>
                    </>
                )}
            </div>
        </div>
      )}
    </nav>
  );
}
