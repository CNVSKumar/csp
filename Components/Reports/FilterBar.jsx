import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Filter, Search } from "lucide-react";

const categoryOptions = [
  { value: "all", label: "All Categories" },
  { value: "roads_potholes", label: "Roads & Potholes" },
  { value: "water_sanitation", label: "Water & Sanitation" },
  { value: "street_lights", label: "Street Lights" },
  { value: "garbage_waste", label: "Garbage & Waste" },
  { value: "parks_recreation", label: "Parks & Recreation" },
  { value: "public_safety", label: "Public Safety" },
  { value: "other", label: "Other" }
];

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "reported", label: "Reported" },
  { value: "under_review", label: "Under Review" },
  { value: "action_initiated", label: "Action Initiated" },
  { value: "resolved", label: "Resolved" }
];

export default function FilterBar({ onFilterChange, filters }) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-slate-900">Filters</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by location..."
            value={filters.location}
            onChange={(e) => onFilterChange({ ...filters, location: e.target.value })}
            className="pl-10 bg-slate-50 border-slate-200"
          />
        </div>
        
        <Select
          value={filters.category}
          onValueChange={(value) => onFilterChange({ ...filters, category: value })}
        >
          <SelectTrigger className="bg-slate-50 border-slate-200">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={filters.status}
          onValueChange={(value) => onFilterChange({ ...filters, status: value })}
        >
          <SelectTrigger className="bg-slate-50 border-slate-200">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}