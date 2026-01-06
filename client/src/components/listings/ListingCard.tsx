import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface Listing {
  id: string;
  seller_id?: string;
  title: string;
  price: string | number;
  type: string;
  status: 'ACTIVE' | 'SOLD';
  description: string;

  image_url?: string;
  created_at?: string;
}

interface ListingCardProps {
  listing: Listing;
  index?: number;
}

export function ListingCard({ listing, index = 0 }: ListingCardProps) {
  const { user } = useAuthStore();
  const isOwner = user?.id === listing.seller_id;

  const handleDelete = async (e: React.MouseEvent) => {
      e.preventDefault(); // Prevent link navigation
      e.stopPropagation();
      if (!confirm("Are you sure you want to delete this listing?")) return;
      try {
          await api.delete(`/listings/${listing.id}`);
          window.location.reload(); 
      } catch (err) {
          console.error("Failed to delete", err);
          alert("Failed to delete listing");
      }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="h-full"
    >
        <Card className="group h-full flex flex-col relative overflow-hidden border-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-sm hover:shadow-2xl transition-shadow duration-300 rounded-2xl ring-1 ring-slate-900/5 dark:ring-white/10">
        {/* Image Container */}
        <div className="relative h-48 w-full overflow-hidden bg-slate-100">
            <img
              src={listing.image_url ? (listing.image_url.startsWith('http') ? listing.image_url : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${listing.image_url}`) : '/placeholder-image.jpg'}
              alt={listing.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            {/* Price Tag Overlay */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + (index * 0.1) }}
                className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg"
            >
                ₹{Number(listing.price).toLocaleString()}
            </motion.div>
        </div>

        <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-lg font-bold line-clamp-1 group-hover:text-primary transition-colors text-slate-900 dark:text-slate-50">
                    {listing.title}
                </CardTitle>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full uppercase tracking-wider border border-primary/20 shrink-0 mt-1">
                {listing.type}
                </span>
            </div>
        </CardHeader>
        
        {/* Sold Overlay */}
        {listing.status === 'SOLD' && (
            <div className="absolute inset-0 z-20 bg-black/50 flex items-center justify-center">
                <span className="text-white font-extrabold text-2xl tracking-widest border-4 border-white px-4 py-1 -rotate-12 transform opacity-80">
                    SOLD
                </span>
            </div>
        )}

        <CardContent className="flex-1 px-5">
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {listing.description}
            </p>
        </CardContent>
        
        <CardFooter className="flex gap-2 px-5 pb-5 pt-0 items-center">
            {/* View Details - Primary Action */}
            <Link href={`/listings/${listing.id}`} className="flex-1 min-w-0">
                <Button className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-primary dark:hover:bg-primary hover:text-white dark:hover:text-white transition-all duration-300 font-medium rounded-xl shadow-md hover:shadow-lg shadow-slate-900/10 dark:shadow-none whitespace-nowrap">
                    View Details
                </Button>
            </Link>

            {isOwner && (
                <div className="flex gap-1 shrink-0 items-center">
                    {/* Mark Sold / Relist */}
                    <Button
                        variant={listing.status === 'SOLD' ? "outline" : "secondary"}
                        size="sm"
                        onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            try {
                                const newStatus = listing.status === 'SOLD' ? 'ACTIVE' : 'SOLD';
                                await api.put(`/listings/${listing.id}/status`, { status: newStatus });
                                window.location.reload();
                            } catch (err) {
                                console.error("Failed to update status");
                            }
                        }}
                        className={`font-medium rounded-lg transition-colors ${
                            listing.status === 'SOLD' 
                            ? "bg-green-50 text-green-600 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800" 
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                        title={listing.status === 'SOLD' ? "Mark as Active" : "Mark as Sold"}
                    >
                        {listing.status === 'SOLD' ? "Relist" : "Mark Sold"}
                    </Button>

                    {/* Delete - Minimal Icon */}
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={handleDelete} 
                        title="Delete Listing"
                        className="h-9 w-9 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                        <Trash2 className="h-5 w-5" />
                    </Button>
                </div>
            )}
        </CardFooter>
        </Card>
    </motion.div>
  );
}
