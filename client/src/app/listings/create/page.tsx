"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Sparkles, AlertTriangle, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Using native select for simplicity unless I install shadcn select
// validating requirements... "Clean, boring, fast". Native select is fine and faster to implement.

const listingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  category_id: z.string().uuid("Please select a category"),
  type: z.enum(["PHYSICAL", "DIGITAL"]),
  condition: z.enum(["NEW", "LIKE_NEW", "GOOD", "FAIR", "USED"]).optional(),
  notes_url: z.string().optional(),
  image_url: z.string().optional(),
});

type ListingFormValues = z.infer<typeof listingSchema>;

interface AIResult {
    confidenceScore: number;
    rationale: string;
    warnings: string[];
    priceSuggestion: {
        min: number;
        max: number;
        sweetSpot: number;
    };
}

export default function CreateListingPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  
  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      type: "PHYSICAL",
      image_url: "",
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setImageFile(file); // Store file for AI analysis
      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      try {
          const res = await api.post('/upload', formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
          });
          form.setValue('image_url', res.data.url);
          // Reset AI result when new image is uploaded
          setAiResult(null); 
      } catch (err) {
          console.error("Upload failed", err);
          alert("Failed to upload image");
      } finally {
          setUploading(false);
      }
  };

  const handleGenerateAI = async () => {
    if (!imageFile) {
        alert("Please upload an image first.");
        return;
    }

    setAiLoading(true);
    setAiResult(null);
    try {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('title', form.getValues('title') || '');
        formData.append('condition', 'Used'); // Default to used, could be enhanced

        const res = await api.post('/ai/generate', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        const data = res.data;
        
        // Auto-fill form
        form.setValue('description', data.description);
        if (data.priceSuggestion?.sweetSpot) {
            form.setValue('price', data.priceSuggestion.sweetSpot.toString());
        }

        setAiResult(data);
    } catch (err) {
        console.error("AI Generation failed", err);
        alert("Failed to generate AI listing info. Please fill manually.");
    } finally {
        setAiLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
        router.push("/login");
        return;
    }
    fetchCategories();
  }, [isAuthenticated, router]);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

  const onSubmit = async (data: ListingFormValues) => {
    setLoading(true);
    try {
      await api.post("/listings", {
        ...data,
        price: parseFloat(data.price),
      });
      router.push("/");
    } catch (err) {
      console.error("Failed to create listing", err);
      alert("Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center py-10">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Create New Listing</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* 1. Image Upload (Moved to Top) */}
            <div className="space-y-4">
              <Label htmlFor="image">Item Image</Label>
              <div className="flex gap-4 items-start">
                  <div className="flex-1">
                    <Input 
                        id="image" 
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                    />
                  </div>
                  <Button 
                    type="button" 
                    onClick={handleGenerateAI} 
                    disabled={!imageFile || aiLoading || uploading}
                    className="bg-purple-600 hover:bg-purple-700 text-white shrink-0"
                  >
                    {aiLoading ? (
                        <>Processing...</>
                    ) : (
                        <><Sparkles className="w-4 h-4 mr-2" /> Auto-Fill with AI</>
                    )}
                  </Button>
              </div>

              {uploading && <p className="text-xs text-muted-foreground">Uploading image...</p>}
              
              {/* Preview Logic: Use local file first, then server URL */}
              {(imageFile || form.watch("image_url")) && (
                  <div className="relative w-full h-64 bg-slate-100 rounded-md overflow-hidden mt-2 border border-slate-200">
                      <img 
                        src={imageFile ? URL.createObjectURL(imageFile) : (form.watch("image_url")?.startsWith('http') ? form.watch("image_url") : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${form.watch("image_url")}`)} 
                        alt="Preview" 
                        className="w-full h-full object-contain" 
                      />
                  </div>
              )}
              {form.formState.errors.image_url && <p className="text-red-500 text-sm">{form.formState.errors.image_url.message}</p>}

              {/* AI Result Display */}
              {aiResult && (
                  <div className="mt-4 space-y-3">
                      <Alert className={aiResult.confidenceScore > 80 ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
                          {aiResult.confidenceScore > 80 ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                          <AlertTitle className={aiResult.confidenceScore > 80 ? "text-green-800" : "text-yellow-800"}>
                              AI Confidence: {aiResult.confidenceScore}%
                          </AlertTitle>
                          <AlertDescription className={aiResult.confidenceScore > 80 ? "text-green-700" : "text-yellow-700"}>
                              {aiResult.rationale}
                          </AlertDescription>
                      </Alert>

                      {aiResult.warnings?.length > 0 && (
                          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-100">
                              <strong>Safety Warnings:</strong>
                              <ul className="list-disc pl-5 mt-1">
                                  {aiResult.warnings.map((w, i) => <li key={i}>{w}</li>)}
                              </ul>
                          </div>
                      )}
                      
                      <div className="text-xs text-slate-500 flex justify-between px-1">
                          <span>Suggested Price Range: ₹{aiResult.priceSuggestion?.min} - ₹{aiResult.priceSuggestion?.max}</span>
                          <span className="font-semibold text-purple-600">Sweet Spot: ₹{aiResult.priceSuggestion?.sweetSpot}</span>
                      </div>
                  </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="e.g. Engineering Physics Textbook" {...form.register("title")} />
              {form.formState.errors.title && <p className="text-red-500 text-sm">{form.formState.errors.title.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <select 
                    id="type" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                    {...form.register("type")}
                >
                    <option value="PHYSICAL">Physical Item</option>
                    <option value="DIGITAL">Digital Note/PDF</option>
                </select>
            </div>

            {form.watch("type") === "DIGITAL" && (
                <div className="space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <Label htmlFor="notes_url" className="text-blue-900">Notes File URL (Drive/Dropbox Link)</Label>
                    <Input 
                        id="notes_url" 
                        placeholder="https://drive.google.com/file/..." 
                        {...form.register("notes_url")} 
                    />
                    <p className="text-xs text-blue-700">
                        *For MVP, please paste a direct link to your notes PDF. File upload coming soon.
                    </p>
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select 
                    id="category"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                    {...form.register("category_id")}
                >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name} ({cat.type})</option>
                    ))}
                </select>
                {form.formState.errors.category_id && <p className="text-red-500 text-sm">{form.formState.errors.category_id.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input id="price" type="number" step="0.01" placeholder="0.00" {...form.register("price")} />
              {form.formState.errors.price && <p className="text-red-500 text-sm">{form.formState.errors.price.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea 
                id="description" 
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Describe your item..."
                {...form.register("description")}
              />
              {form.formState.errors.description && <p className="text-red-500 text-sm">{form.formState.errors.description.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Listing"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
