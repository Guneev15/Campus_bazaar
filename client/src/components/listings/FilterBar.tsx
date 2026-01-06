"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Filter } from "lucide-react";

interface FilterBarProps {
  categories: any[];
  onFilterChange: (filters: any) => void;
}

export function FilterBar({ categories, onFilterChange }: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    min_price: "",
    max_price: "",
    condition: "",
    category_id: ""
  });

  const handleChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    onFilterChange(filters);
    setIsOpen(false);
  };

  const clearFilters = () => {
    const reset = { min_price: "", max_price: "", condition: "", category_id: "" };
    setFilters(reset);
    onFilterChange(reset);
    setIsOpen(false);
  };

  // Mobile Toggle
  if (!isOpen) {
     return (
         <div className="flex gap-2">
             <Button variant="outline" size="sm" onClick={() => setIsOpen(true)} className="gap-2">
                 <Filter className="h-4 w-4" /> Filters
             </Button>
             {(filters.min_price || filters.max_price || filters.condition || filters.category_id) && (
                 <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-500 h-8">
                     <X className="h-3 w-3 mr-1" /> Clear
                 </Button>
             )}
         </div>
     );
  }

  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 mb-6">
      <div className="flex justify-between items-center">
          <h3 className="font-semibold text-sm">Filters</h3>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}><X className="h-4 w-4" /></Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
              <label className="text-xs font-medium mb-1 block">Category</label>
              <select 
                  className="w-full text-sm p-2 rounded-md border"
                  value={filters.category_id}
                  onChange={(e) => handleChange('category_id', e.target.value)}
              >
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
          </div>

          <div>
              <label className="text-xs font-medium mb-1 block">Condition</label>
              <select 
                   className="w-full text-sm p-2 rounded-md border"
                   value={filters.condition}
                   onChange={(e) => handleChange('condition', e.target.value)}
              >
                  <option value="">Any Condition</option>
                  <option value="NEW">New</option>
                  <option value="LIKE_NEW">Like New</option>
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                  <option value="USED">Used</option>
              </select>
          </div>

          <div className="flex gap-2">
              <div>
                <label className="text-xs font-medium mb-1 block">Min Price</label>
                <Input 
                    type="number" 
                    placeholder="0" 
                    value={filters.min_price}
                    onChange={(e) => handleChange('min_price', e.target.value)}
                    className="h-9"
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Max Price</label>
                <Input 
                    type="number" 
                    placeholder="Max" 
                    value={filters.max_price}
                    onChange={(e) => handleChange('max_price', e.target.value)}
                    className="h-9"
                />
              </div>
          </div>

          <div className="flex items-end gap-2">
              <Button onClick={applyFilters} className="flex-1" size="sm">Apply</Button>
              <Button onClick={clearFilters} variant="outline" size="sm">Reset</Button>
          </div>
      </div>
    </div>
  );
}
