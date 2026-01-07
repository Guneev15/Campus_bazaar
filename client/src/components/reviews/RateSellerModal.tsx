
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";

interface RateSellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerId: string;
  sellerName: string;
  listingId: string;
  onSuccess?: () => void;
}

export function RateSellerModal({ isOpen, onClose, sellerId, sellerName, listingId, onSuccess }: RateSellerModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Please select a star rating");
      return;
    }

    setLoading(true);
    try {
      await api.post("/reviews", {
        target_id: sellerId,
        listing_id: listingId,
        rating,
        comment
      });
      // toast.success("Review submitted!");
      alert("Review submitted successfully!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Failed to submit review", err);
      alert(err.response?.data?.error || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle>Rate your experience with {sellerName}</DialogTitle>
          <DialogDescription>
            How was your transaction? This helps other students trust this seller.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-4">
          {/* Star Rating */}
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="focus:outline-none transition-colors"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoverRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-slate-300 dark:text-slate-600"
                  }`}
                />
              </motion.button>
            ))}
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {rating === 0 ? "Select stars" : 
             rating === 1 ? "Poor" :
             rating === 2 ? "Fair" :
             rating === 3 ? "Good" :
             rating === 4 ? "Great" : "Excellent!"}
          </p>

          {/* Comment */}
          <textarea 
            placeholder="Describe your experience (optional)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full h-24 resize-none rounded-md border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <DialogFooter className="sm:justify-between gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-primary text-white">
            {loading ? "Submitting..." : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
