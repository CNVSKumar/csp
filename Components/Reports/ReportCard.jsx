import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MapPin, Calendar, User, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import SentimentBadge from "../sentiment/SentimentBadge";

const categoryLabels = {
  roads_potholes: "Roads & Potholes",
  water_sanitation: "Water & Sanitation",
  street_lights: "Street Lights",
  garbage_waste: "Garbage & Waste",
  parks_recreation: "Parks & Recreation",
  public_safety: "Public Safety",
  other: "Other"
};

const statusConfig = {
  reported: { label: "Reported", color: "bg-slate-100 text-slate-700 border-slate-300" },
  under_review: { label: "Under Review", color: "bg-blue-100 text-blue-700 border-blue-300" },
  action_initiated: { label: "Action Initiated", color: "bg-amber-100 text-amber-700 border-amber-300" },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-700 border-green-300" }
};

export default function ReportCard({ report, onUpvote, currentUserEmail, onClick }) {
  const hasUpvoted = report.upvotes?.includes(currentUserEmail);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className="hover:shadow-xl transition-all duration-300 cursor-pointer bg-white/90 backdrop-blur-sm border-slate-200"
        onClick={onClick}
      >
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-slate-900 mb-2">{report.title}</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className={`${statusConfig[report.status].color} border font-medium`}>
                  {statusConfig[report.status].label}
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {categoryLabels[report.category]}
                </Badge>
                <SentimentBadge sentiment={report.sentiment} />
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {report.photo_urls && report.photo_urls.length > 0 && (
            <div className="rounded-lg overflow-hidden">
              <img 
                src={report.photo_urls[0]} 
                alt={report.title}
                className="w-full h-48 object-cover"
              />
            </div>
          )}
          
          <p className="text-slate-600 line-clamp-2">{report.description}</p>
          
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{report.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(report.created_date), "MMM d, yyyy")}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-sm text-slate-500">
                <User className="w-4 h-4" />
                <span>by {report.created_by}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-slate-500">
                <MessageSquare className="w-4 h-4" />
                <span>{report.comment_count || 0}</span>
              </div>
            </div>
            
            <Button
              variant={hasUpvoted ? "default" : "outline"}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onUpvote(report);
              }}
              className={`gap-2 ${hasUpvoted ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-blue-50 hover:text-blue-700'}`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{report.upvote_count || 0}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}