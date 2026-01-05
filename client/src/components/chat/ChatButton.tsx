"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send } from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

// Using a simplified Dialog mock if shadcn dialog not installed, but ideally we install it.
// Assuming we don't have full Shadcn Dialog, I'll build a simple modal or use the shadcn/radix one if I install it.
// I'll install dialog first.

interface ChatButtonProps {
    receiverId: string;
    listingId: string;
    listingTitle: string;
    customLabel?: string;
    defaultMessage?: string;
    variant?: "default" | "secondary" | "outline" | "ghost";
}

export function ChatButton({ receiverId, listingId, listingTitle, customLabel, defaultMessage, variant = "default" }: ChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState(defaultMessage || "");
  const [sending, setSending] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const handleOpen = () => {
      if (defaultMessage) setMessage(defaultMessage);
      setIsOpen(true);
  }

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
        await api.post('/messages', {
            receiver_id: receiverId,
            listing_id: listingId,
            content: message
        });
        setMessage("");
        setIsOpen(false);
        alert("Message sent!");
    } catch (err) {
        console.error("Failed to send message", err);
        alert("Failed to send message");
    } finally {
        setSending(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <>
      <Button className="w-full gap-2" variant={variant} onClick={handleOpen}>
        {!customLabel && <MessageCircle className="h-4 w-4" />}
        {customLabel || "Chat with Seller"}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg text-slate-900">
                <h3 className="text-lg font-bold mb-2">Message Seller</h3>
                <p className="text-sm text-slate-500 mb-4">Inquiry about: {listingTitle}</p>
                
                <div className="space-y-4">
                    <textarea 
                        className="w-full border border-slate-300 rounded-md p-2 min-h-[100px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                        placeholder="Hi, is this still available?"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                        <Button 
                            variant="ghost" 
                            onClick={() => setIsOpen(false)}
                            className="bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSend} disabled={sending}>
                            {sending ? "Sending..." : "Send Message"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </>
  );
}
