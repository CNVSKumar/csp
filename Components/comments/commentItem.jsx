import React from "react";
import { Card } from "@/components/ui/card";
import { User, Clock } from "lucide-react";
import { format } from "date-fns";
import SentimentBadge from "../sentiment/SentimentBadge";

export default function CommentItem({ comment }) {
  return (
    <Card className="p-4 bg-slate-50 border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm">{comment.created_by}</p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              {format(new Date(comment.created_date), "MMM d, yyyy 'at' h:mm a")}
            </div>
          </div>
        </div>
        <SentimentBadge sentiment={comment.sentiment} size="small" />
      </div>
      <p className="text-slate-700 leading-relaxed ml-10">{comment.content}</p>
    </Card>
  );
}