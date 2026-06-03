import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import CommentItem from "./CommentItem";

export default function CommentSection({ reportId, user }) {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', reportId],
    queryFn: () => base44.entities.Comment.filter({ report_id: reportId }, '-created_date'),
    initialData: [],
  });

  const createCommentMutation = useMutation({
    mutationFn: async (commentData) => {
      setIsAnalyzing(true);
      
      // Analyze sentiment
      const sentimentAnalysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze the sentiment of this comment about a civic problem. Classify it as one of: urgent, concerned, neutral, or positive. Comment: "${commentData.content}"`,
        response_json_schema: {
          type: "object",
          properties: {
            sentiment: {
              type: "string",
              enum: ["urgent", "concerned", "neutral", "positive"]
            }
          }
        }
      });
 