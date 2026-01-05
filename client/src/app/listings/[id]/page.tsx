"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, ShieldCheck, MapPin } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { ChatButton } from "@/components/chat/ChatButton";

export default function ListingDetailsPage() {
  const { id } = useParams();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      const res = await api.get(`/listings/${id}`);
      setListing(res.data);
    } catch (err) {
      console.error("Failed to fetch listing", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20">Loading details...</div>;
  if (!listing) return <div className="text-center py-20">Listing not found</div>;

  return (
    <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
      {/* Left Column: Images & Details */}
      <div className="md:col-span-2 space-y-6">
        <div className="aspect-video bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 overflow-hidden">
            {listing.image_url ? (
                <img 
                    src={listing.image_url.startsWith('http') ? listing.image_url : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${listing.image_url}`} 
                    alt={listing.title} 
                    className="w-full h-full object-contain" 
                />
            ) : (
                <span className="text-lg">No Image Preview</span>
            )}
        </div>
        
        <div className="space-y-4">
            <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold">{listing.title}</h1>
                <Badge variant="secondary">
                    {listing.type}
                </Badge>
            </div>
            <p className="text-3xl font-bold text-primary">₹{Number(listing.price).toLocaleString()}</p>
            
            <div className="prose max-w-none">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{listing.description}</p>
            </div>
        </div>
      </div>

      {/* Right Column: Seller Info & Actions */}
      <div className="md:col-span-1">
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Seller Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-slate-200 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-slate-500" />
                    </div>
                    <div>
                        <p className="font-medium">Student Seller</p>
                        <div className="flex items-center text-xs text-green-600 gap-1">
                            <ShieldCheck className="h-3 w-3" />
                            Verified Student
                        </div>
                    </div>
                </div>

                <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>Campus Hostels</span>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
                <ChatButton 
                    receiverId={listing.seller_id} 
                    listingId={listing.id}
                    listingTitle={listing.title}
                />
                
                {listing.type === 'DIGITAL' ? (
                    <Button variant="secondary" className="w-full">
                        Buy & Download
                    </Button>
                ) : (
                    <ChatButton 
                        receiverId={listing.seller_id} 
                        listingId={listing.id}
                        listingTitle={listing.title}
                        customLabel="Make Offer"
                        defaultMessage={`Hi, I am interested in your ${listing.title}. I would like to offer ₹${listing.price} for it.`}
                        variant="secondary"
                    />
                )}
            </CardFooter>
        </Card>
      </div>
    </div>
  );
}
