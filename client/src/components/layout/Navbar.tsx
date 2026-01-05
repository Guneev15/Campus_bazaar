"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { ShoppingBag, User, LogOut, Home } from "lucide-react";
import { useRouter } from "next/navigation";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
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

        <div className="flex items-center gap-4">
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
      </div>
    </nav>
  );
}
