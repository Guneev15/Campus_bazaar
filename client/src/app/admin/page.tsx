"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Need to check if tabs component exists or use simple state
import { Check, X } from "lucide-react";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [pendingNotes, setPendingNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
        // router.push("/"); // Commented out for dev testing if role isn't set yet
    }
    fetchData();
  }, [isAuthenticated, user]);

  const fetchData = async () => {
    try {
        const usersRes = await api.get('/admin/users');
        setUsers(usersRes.data);

        const notesRes = await api.get('/admin/notes/pending');
        setPendingNotes(notesRes.data);
    } catch (err) {
        console.error("Failed to fetch admin data", err);
    } finally {
        setLoading(false);
    }
  };

  const verifyUser = async (id: string) => {
      try {
          await api.post(`/admin/users/${id}/verify`);
          setUsers(users.map(u => u.id === id ? {...u, is_verified: true} : u));
      } catch (err) {
          alert("Failed to verify user");
      }
  };

  const approveNote = async (id: string) => {
      try {
          await api.post(`/admin/notes/${id}/approve`);
          setPendingNotes(pendingNotes.filter(n => n.id !== id));
      } catch (err) {
          alert("Failed to approve note");
      }
  };

  if (loading) return <div className="p-8 text-center">Loading Admin Panel...</div>;

  return (
    <div className="container mx-auto py-10 space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <div className="flex gap-4 mb-6">
        <Button variant={activeTab === 'users' ? 'default' : 'outline'} onClick={() => setActiveTab('users')}>
            Users Management
        </Button>
        <Button variant={activeTab === 'notes' ? 'default' : 'outline'} onClick={() => setActiveTab('notes')}>
            Pending Notes
        </Button>
      </div>

      {activeTab === 'users' && (
        <Card>
            <CardHeader><CardTitle>All Users</CardTitle></CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {users.map(u => (
                        <div key={u.id} className="flex justify-between items-center p-4 border rounded-lg">
                            <div>
                                <p className="font-medium">{u.email}</p>
                                <p className="text-sm text-muted-foreground">Role: {u.role}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {u.is_verified ? (
                                    <span className="text-green-600 text-sm font-bold px-3 py-1 bg-green-50 rounded-full">Verified</span>
                                ) : (
                                    <Button size="sm" onClick={() => verifyUser(u.id)}>
                                        <Check className="h-4 w-4 mr-1" /> Verify
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      )}

      {activeTab === 'notes' && (
        <Card>
            <CardHeader><CardTitle>Pending Notes Approvals</CardTitle></CardHeader>
            <CardContent>
                 {pendingNotes.length === 0 ? <p className="text-muted-foreground">No pending notes.</p> : (
                    <div className="space-y-4">
                        {pendingNotes.map(note => (
                            <div key={note.id} className="flex justify-between items-center p-4 border rounded-lg">
                                <div>
                                    <p className="font-medium">{note.title}</p>
                                    <p className="text-sm text-muted-foreground">Seller: {note.seller_email}</p>
                                    <a href={note.file_url} target="_blank" className="text-blue-500 text-sm hover:underline">View File</a>
                                </div>
                                <Button size="sm" onClick={() => approveNote(note.id)}>
                                    Approve Listing
                                </Button>
                            </div>
                        ))}
                    </div>
                 )}
            </CardContent>
        </Card>
      )}
    </div>
  );
}
