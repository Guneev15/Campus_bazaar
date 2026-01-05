"use client";

import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface Conversation {
  partner_id: string;
  partner_name: string;
  partner_email: string;
  listing_id: string;
  listing_title: string;
  listing_price: string;
  content: string; // Latest message
  created_at: string;
}

export default function MessagesPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedThread, setSelectedThread] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
        fetchConversations();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedThread) {
        fetchThread(selectedThread);
    }
  }, [selectedThread]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await api.get("/messages");
      setConversations(res.data);
      if (res.data.length > 0 && !selectedThread) {
          // Optional: Auto-select first conversation
          // setSelectedThread(res.data[0]); 
      }
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchThread = async (thread: Conversation) => {
      try {
          const res = await api.get(`/messages/thread?partner_id=${thread.partner_id}&listing_id=${thread.listing_id}`);
          setMessages(res.data);
      } catch (err) {
          console.error("Failed to fetch thread", err);
      }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newMessage.trim() || !selectedThread) return;

      const tempMsg = {
          id: Date.now().toString(),
          sender_id: user?.id || "",
          content: newMessage,
          created_at: new Date().toISOString()
      };

      // Optimistic Update
      setMessages([...messages, tempMsg]);
      setNewMessage("");

      try {
          await api.post("/messages", {
              receiver_id: selectedThread.partner_id,
              listing_id: selectedThread.listing_id,
              content: tempMsg.content
          });
          // Refresh to get real ID/Status if needed, distinct updates handled by next fetch
      } catch (err) {
          alert("Failed to send message");
      }
  };

  if (!isAuthenticated) return <div className="p-10 text-center">Please login to view messages.</div>;

  return (
    <div className="container mx-auto py-6 h-[85vh] flex gap-4">
      {/* Sidebar: Conversation List */}
      <Card className="w-1/3 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b bg-slate-50">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" /> Chats
              </h2>
          </div>
          <ScrollArea className="flex-1">
              <div className="divide-y">
                  {loading ? (
                      <p className="p-4 text-center text-muted-foreground">Loading...</p>
                  ) : conversations.length === 0 ? (
                      <p className="p-4 text-center text-muted-foreground">No conversations yet.</p>
                  ) : (
                      conversations.map((conv, idx) => (
                          <button
                              key={idx} // multiple listings per user possible, unique by combo
                              onClick={() => setSelectedThread(conv)}
                              className={cn(
                                  "w-full text-left p-4 hover:bg-slate-100 transition-colors flex flex-col gap-1",
                                  selectedThread?.listing_id === conv.listing_id && selectedThread?.partner_id === conv.partner_id ? "bg-slate-100 border-l-4 border-primary" : ""
                              )}
                          >
                              <div className="flex justify-between items-baseline">
                                  <span className="font-semibold text-sm truncate w-2/3">{conv.partner_name || conv.partner_email}</span>
                                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                                      {new Date(conv.created_at).toLocaleDateString()}
                                  </span>
                              </div>
                              <p className="text-xs font-medium text-indigo-600 truncate">{conv.listing_title}</p>
                              <p className="text-xs text-muted-foreground truncate opacity-80">{conv.content}</p>
                          </button>
                      ))
                  )}
              </div>
          </ScrollArea>
      </Card>

      {/* Main: Chat Window */}
      <Card className="flex-1 flex flex-col h-full overflow-hidden">
          {selectedThread ? (
              <>
                  {/* Chat Header */}
                  <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                      <div>
                          <h3 className="font-bold flex items-center gap-2">
                              {selectedThread.partner_name || selectedThread.partner_email}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                              Re: <strong>{selectedThread.listing_title}</strong> (₹{selectedThread.listing_price})
                          </p>
                      </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                      {messages.map((msg) => {
                          const isMe = msg.sender_id === user?.id;
                          return (
                              <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                                  <div className={cn(
                                      "max-w-[70%] rounded-lg p-3 text-sm shadow-sm",
                                      isMe ? "bg-primary text-primary-foreground" : "bg-white border text-slate-800"
                                  )}>
                                      <p>{msg.content}</p>
                                      <span className={cn("text-[10px] block text-right mt-1 opacity-70", isMe ? "text-primary-foreground" : "text-muted-foreground")}>
                                          {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                      </span>
                                  </div>
                              </div>
                          );
                      })}
                      <div ref={scrollRef} />
                  </div>

                  {/* Input Area */}
                  <div className="p-4 border-t bg-white">
                      <form onSubmit={handleSendMessage} className="flex gap-2">
                          <Input 
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              placeholder="Type a message..."
                              className="flex-1"
                          />
                          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                              <Send className="h-4 w-4" />
                          </Button>
                      </form>
                  </div>
              </>
          ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-slate-50/30">
                  <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                  <p>Select a conversation to start chatting</p>
              </div>
          )}
      </Card>
    </div>
  );
}
