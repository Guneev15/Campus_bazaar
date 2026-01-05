"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // useSearchParams to get email
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/verify", { email, otp });
      router.push("/login?verified=true");
    } catch (err: any) {
      setError(err.response?.data?.error || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verify Email</CardTitle>
          <CardDescription>
            Enter the OTP sent to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="otp">One-Time Password</Label>
                <Input 
                    id="otp" 
                    placeholder="123456" 
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className="text-center text-lg tracking-widest"
                />
             </div>
             {error && <p className="text-sm text-red-500">{error}</p>}
             
             <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Verifying..." : "Verify Account"}
             </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
            <p className="text-xs text-muted-foreground">
                Check your server console for the mock OTP.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
