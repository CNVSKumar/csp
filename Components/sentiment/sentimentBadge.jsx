import React from "react";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, Smile, Minus } from "lucide-react";

const sentimentConfig = {
  urgent: {
    label: "Urgent",
    color: "bg-red-100 text-red-700 border-red-300",
    icon: AlertTriangle,
    textColor: "text-red-700"
  },
  concerned: {
    label: "Concerned",
    color: "bg-orange-100 text-orange-700 border-orange-300",
    icon: AlertCircle,
    textColor: "text-orange-700"
  },
  neutral: {
    label: "Neutral",
    color: "bg-slate-100 text-slate-700 border-slate-300",
    icon: Minus,
    textColor: "text-slate-700"
  },
  positive: {
    label: "Positive",
    color: "bg-green-100 text-green-700 border-green-300",
    icon: Smile,
    textColor: "text-green-700"
  }
};

export default function SentimentBadge({ sentiment, size = "default", showIcon = true }) {
  if (!sentiment) return null;
  
  const config = sentimentConfig[sentiment] || sentimentConfig.neutral;
  const Icon = config.icon;
  
 