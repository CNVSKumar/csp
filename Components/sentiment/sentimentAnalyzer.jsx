import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, AlertTriangle, Heart, Users } from "lucide-react";
import SentimentBadge from "./SentimentBadge";

export default function SentimentAnalyzer({ reports }) {
  const sentimentCounts = {
    urgent: reports.filter(r => r.sentiment === 'urgent').length,
    concerned: reports.filter(r => r.sentiment === 'concerned').length,
    neutral: reports.filter(r => r.sentiment === 'neutral').length,
    positive: reports.filter(r => r.sentiment === 'positive').length,
  };

  const total = reports.length || 1;
  const urgentPercentage = ((sentimentCounts.urgent / total) * 100).toFixed(0);
  const concernedPercentage = ((sentimentCounts.concerned / total) * 100).toFixed(0);

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <TrendingUp className="w-5 h-5" />
          Community Sentiment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-slate-600">Urgent</span>
            </div>
            <div className="text-2xl font-bold text-red-600">{sentimentCounts.urgent}</div>
            <div className="text-xs text-slate-500">{urgentPercentage}% of reports</div>
          </div>
          
          <div className="bg-white rounded-lg p-3 shadow-sm">
 