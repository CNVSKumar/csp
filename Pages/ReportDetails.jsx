
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ThumbsUp, MapPin, Calendar, User, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";
import StatusBadge from "../components/reports/StatusBadge";
import SentimentBadge from "../components/sentiment/SentimentBadge";
import CommentSection from "../components/comments/CommentSection";

const categoryLabels = {
  roads_potholes: "Roads & Potholes",
  water_sanitation: "Water & Sanitation",
  street_lights: "Street Lights",
  garbage_waste: "Garbage & Waste",
  parks_recreation: "Parks & Recreation",
  public_safety: "Public Safety",
  other: "Other"
};

export default function ReportDetails() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // Added state
  const urlParams = new URLSearchParams(window.location.search);
  const reportId = urlParams.get('id');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          navigate(createPageUrl("Landing"));
          return;
        }
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Authentication check failed or not authenticated:", error);
        navigate(createPageUrl("Landing"));
      } finally {
        setIsCheckingAuth(false);
      }
    };
    loadUser();
  }, [navigate]); // Added navigate to dependency array

  const { data: reports } = useQuery({
    queryKey: ['reports'],
    queryFn: () => base44.entities.ProblemReport.list(),
    initialData: [],
    enabled: !isCheckingAuth, // Only fetch reports once auth check is complete
  });

  const report = reports.find(r => r.id === reportId);

  const upvoteMutation = useMutation({
    mutationFn: async () => {
      // Ensure user is defined before accessing user.email
      if (!user) {
        throw new Error("User not authenticated.");
      }
      const hasUpvoted = report.upvotes?.includes(user.email);
      const newUpvotes = hasUpvoted
        ? report.upvotes.filter(email => email !== user.email)
        : [...(report.upvotes || []), user.email];
      
      return base44.entities.ProblemReport.update(report.id, {
        upvotes: newUpvotes,
        upvote_count: newUpvotes.length
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });

  // Added loading state rendering
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-slate-600">Report not found</p>
          <Button onClick={() => navigate(createPageUrl("Feed"))} className="mt-4">
            Back to Feed
          </Button>
        </div>
      </div>
    );
  }

  // Ensure user is defined before accessing user.email for hasUpvoted
  const hasUpvoted = report.upvotes?.includes(user?.email);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Feed"))}
            className="hover:bg-slate-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">Report Details</h1>
        </div>

        <Card className="shadow-xl border-slate-200 bg-white/90 backdrop-blur-sm mb-6">
          <CardHeader>
            <div className="flex justify-between items-start gap-4 flex-wrap">
              <CardTitle className="text-2xl flex-1">{report.title}</CardTitle>
              <div className="flex gap-2 flex-wrap">
                <StatusBadge status={report.status} size="large" />
                <SentimentBadge sentiment={report.sentiment} size="large" />
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-4 h-4" />
                <span>{report.location}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(report.created_date), "MMMM d, yyyy 'at' h:mm a")}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <User className="w-4 h-4" />
                <span>Reported by {report.created_by}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Category</h3>
              <p className="text-slate-600">{categoryLabels[report.category]}</p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Description</h3>
              <p className="text-slate-700 leading-relaxed">{report.description}</p>
            </div>

            {report.photo_urls && report.photo_urls.length > 0 && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Photos ({report.photo_urls.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.photo_urls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Report photo ${index + 1}`}
                      className="w-full h-64 object-cover rounded-lg shadow-md"
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <div className="text-slate-600">
                <span className="font-semibold text-lg">{report.upvote_count || 0}</span> people affected by this issue
              </div>
              <Button
                variant={hasUpvoted ? "default" : "outline"}
                size="lg"
                onClick={() => upvoteMutation.mutate()}
                disabled={!user || upvoteMutation.isLoading}
                className={`gap-2 ${hasUpvoted ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-blue-50 hover:text-blue-700'}`}
              >
                <ThumbsUp className="w-5 h-5" />
                {upvoteMutation.isLoading ? "Updating..." : (hasUpvoted ? "Supported" : "Support This Issue")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <CommentSection reportId={reportId} user={user} />
      </div>
    </div>
  );
}
