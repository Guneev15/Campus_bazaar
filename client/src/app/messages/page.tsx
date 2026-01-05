"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MessagesPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
        fetchMessages();
    }
  }, [isAuthenticated]);

  const fetchMessages = async () => {
    try {
      const res = await api.get("/messages");
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to fetch messages", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return <div className="p-10 text-center">Please login to view messages.</div>;

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Inbox</h1>
      
      {loading ? (
          <div>Loading messages...</div>
      ) : messages.length === 0 ? (
          <div className="text-center p-10 border rounded-lg bg-slate-50">
              <p className="text-muted-foreground">No messages yet.</p>
          </div>
      ) : (
          <div className="space-y-4">
              {messages.map((msg) => (
                  <Card key={msg.id}>
                      <CardHeader className="pb-2">
                          <CardTitle className="text-base flex justify-between">
                             <span>From: {msg.sender_id === user?.id ? "Me" : msg.sender_email}</span>
                             <span className="text-xs text-muted-foreground">
                                 {new Date(msg.created_at).toLocaleDateString()}
                             </span>
                          </CardTitle>
                      </CardHeader>
                      <CardContent>
                          <p className="text-sm font-semibold text-slate-700 mb-1">
                              Re: {msg.listing_title || "Item Inquiry"}
                          </p>
                          <p className="text-slate-600">{msg.content}</p>
                      </CardContent>
                  </Card>
              ))}
          </div>
      )}
    </div>
  );
}
