"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { ListingCard } from "@/components/listings/ListingCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

import { SlideUp } from "@/components/animations/SlideUp";
import { FadeIn } from "@/components/animations/FadeIn";
import { motion, AnimatePresence } from "framer-motion";

import { FilterBar } from "@/components/listings/FilterBar";

export default function Home() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'market' | 'selling'>('market');
  const [listings, setListings] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState({});

  useEffect(() => {
    fetchListings();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
      try {
          const res = await api.get('/categories');
          setCategories(res.data);
      } catch (e) {
          console.error("Failed to load categories");
      }
  };

  const fetchListings = async (filters: any = {}) => {
    setLoading(true);
    try {
      // filters contains min_price, max_price, condition, category_id
      // Clean empty values
      const params = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ""));
      const response = await api.get("/listings", { params });
      setListings(response.data);
      setActiveFilters(filters);
    } catch (error) {
      console.error("Failed to fetch listings:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings.filter((listing) => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === 'selling') {
        return matchesSearch && listing.seller_id === user?.id; // Show ONLY my listings
    } else {
        return matchesSearch && listing.seller_id !== user?.id; // Show everything EXCEPT my listings
    }
  });

  return (
    <div className="space-y-8">
      {/* Hero / Search Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 shadow-2xl">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
           <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary/30 rounded-full blur-3xl opacity-50 animate-pulse"></div>
           <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl opacity-40"></div>
           <div className="absolute bottom-10 left-1/3 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl opacity-30"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center space-y-6 py-20 px-6 text-center md:py-32">
          <SlideUp delay={0.1}>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-white">
                <span className="block text-slate-400 text-lg sm:text-2xl font-semibold uppercase tracking-widest mb-4">Welcome to</span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">Campus</span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">Bazaar</span>
            </h1>
          </SlideUp>
          
          <SlideUp delay={0.3}>
            <p className="text-slate-300 md:text-xl max-w-[700px] leading-relaxed">
                The premium platform to buy, sell, and trade essentials with your college community. Secure. Fast. Beautiful.
            </p>
          </SlideUp>
          
          <SlideUp delay={0.5} className="w-full max-w-lg">
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 group">
                <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <Input
                    placeholder="Search textbooks, electronics..." 
                    className="pl-11 h-12 rounded-xl border-slate-700 bg-slate-950/50 text-white placeholder:text-slate-500 focus:border-primary/50 focus:ring-primary/20 transition-all font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                </div>
                <Button className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 font-bold tracking-wide transition-all hover:scale-105 active:scale-95">
                Search
                </Button>
            </div>
          </SlideUp>
        </div>
      </section>

      {/* Listings Grid */}
      <section>
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-8 gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 w-full md:w-auto text-center md:text-left">
                {activeTab === 'market' ? 'Recent Listings' : 'My Listings'}
            </h2>
            
            {/* Tab Controls */}
            <div className="flex p-1.5 bg-slate-100 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => {
                        setActiveTab('market');
                        fetchListings({}); // Clear filters to show everything in market
                    }}
                    className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${
                        activeTab === 'market' 
                        ? "bg-white dark:bg-slate-800 text-primary shadow-md scale-105" 
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    }`}
                >
                    Marketplace
                </button>
                <button
                    onClick={() => {
                        setActiveTab('selling');
                        fetchListings({}); // Clear filters ensures my listings aren't hidden by previous searches
                    }}
                    className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${
                        activeTab === 'selling' 
                        ? "bg-white dark:bg-slate-800 text-primary shadow-md scale-105" 
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    }`}
                >
                    My Listings
                </button>
            </div>
        </div>
        
        {activeTab === 'market' && (
            <FilterBar categories={categories} onFilterChange={fetchListings} />
        )}

        {loading ? (
           <div className="text-center py-12">Loading marketplace...</div>
        ) : filteredListings.length === 0 ? (
           <div className="text-center py-12 border rounded-lg bg-slate-50">
              <p className="text-muted-foreground mb-4">
                  {activeTab === 'market' 
                    ? "No items found in the marketplace." 
                    : "You haven't listed anything yet."}
              </p>
              <Link href="/listings/create">
                <Button variant="outline">Sell Item</Button>
              </Link>
           </div>
        ) : (
          <motion.div 
            layout 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            <AnimatePresence>
                {filteredListings.map((listing, index) => (
                    <ListingCard key={listing.id} listing={listing} index={index} />
                ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>
    </div>
  );
}
