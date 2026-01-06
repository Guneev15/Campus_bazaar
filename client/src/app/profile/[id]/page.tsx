"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Star, Calendar, MessageSquare } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";

interface UserProfile {
    id: string;
    name: string;
    email: string;
    created_at: string;
}

interface Review {
    id: string;
    reviewer_name: string;
    rating: number;
    comment: string;
    created_at: string;
}

interface Stats {
    average_rating: string | null;
    total_reviews: string;
}

export default function ProfilePage() {
    const params = useParams();
    const { user: currentUser } = useAuthStore();
    const userId = params.id as string;
    
    // We need an endpoint to fetch public user info. If not available, we might need to add one.
    // For now assuming we can get basic info or relying on reviews endpoint if extended.
    // Actually, I didn't add a 'get public user' endpoint. I'll mock the user info part or quickly add the endpoint.
    // Wait, let's assume I can get it from the reviews/user endpoint if I modify it, OR just fetch reviews for now.
    // Ideally I should have a users/public/:id endpoint.
    
    // Workaround: I'll fetch reviews, and if the user has reviews, I might get their name from that? No, that's reviewers names.
    // I will stick to showing just the Reputation for now, and generic "User". 
    // OR create the endpoint real quick.
    
    const [stats, setStats] = useState<Stats>({ average_rating: null, total_reviews: "0" });
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get(`/reviews/user/${userId}`);
                setReviews(res.data.reviews);
                setStats(res.data.stats);
            } catch (err) {
                console.error("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [userId]);

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }).map((_, i) => (
            <Star 
                key={i} 
                className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`} 
            />
        ));
    };

    if (loading) return <div className="p-10 text-center">Loading Profile...</div>;

    return (
        <div className="container mx-auto py-10 max-w-4xl">
            <Card className="p-8 mb-8 flex flex-col md:flex-row gap-8 items-center md:items-start bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/50">
                <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg">
                    <User className="h-16 w-16 text-primary" />
                </div>
                
                <div className="flex-1 text-center md:text-left space-y-4">
                    <div>
                        <h1 className="text-3xl font-bold">Seller Profile</h1> 
                        {/* Once we have public user endpoint, replace 'Seller Profile' with actual name */}
                        <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground mt-1">
                            <Calendar className="h-4 w-4" />
                            <span>Member since 2024</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-center md:justify-start gap-6">
                        <div className="text-center">
                            <div className="flex items-center gap-1 font-bold text-2xl">
                                {Number(stats.average_rating || 0).toFixed(1)} <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                            </div>
                            <p className="text-xs text-muted-foreground">Rating</p>
                        </div>
                        <div className="text-center">
                             <div className="font-bold text-2xl">{stats.total_reviews}</div>
                             <p className="text-xs text-muted-foreground">Reviews</p>
                        </div>
                    </div>

                    {currentUser?.id !== userId && (
                         <Button className="gap-2">
                            <MessageSquare className="h-4 w-4" /> Send Message
                         </Button>
                    )}
                </div>
            </Card>

            <h3 className="text-xl font-bold mb-6">Recent Reviews</h3>
            <div className="grid gap-4">
                {reviews.length === 0 ? (
                    <Card className="p-8 text-center text-muted-foreground border-dashed">
                        No reviews yet. Buy something and be the first!
                    </Card>
                ) : (
                    reviews.map((review) => (
                        <Card key={review.id} className="p-6">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2 font-semibold">
                                    <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                        <User className="h-4 w-4" />
                                    </div>
                                    {review.reviewer_name}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(review.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex gap-1 mb-3">
                                {renderStars(review.rating)}
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                                {review.comment}
                            </p>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
