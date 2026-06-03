import React from "react";
import { Badge } from "@/components/ui/badge";

const statusConfig = {
  reported: { 
    label: "Reported", 
    color: "bg-slate-100 text-slate-700 border-slate-300",
    icon: "🔔"
  },
  under_review: { 
    label: "Under Review", 
    color: "bg-blue-100 text-blue-700 border-blue-300",
    icon: "👀"
  },
  action_initiated: { 
    label: "Action Initiated", 
    color: "bg-amber-100 text-amber-700 border-amber-300",
    icon: "🚧"
  },
  resolved: { 
    label: "Resolved", 
    color: "bg-green-100 text-green-700 border-green-300",
    icon: "✅"
  }
};

export default function StatusBadge({ status, size = "default" }) {
  const config = statusConfig[status] || statusConfig.reported;
  
  return (
    <Badge 
      className={`${config.color} border font-medium ${size === "large" ? "text-lg px-4 py-2" : ""}`}
    >
      <span className="mr-2">{config.icon}</span>
      {config.label}
    </Badge>
  );
}