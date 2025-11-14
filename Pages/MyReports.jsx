
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import ReportCard from "../components/reports/ReportCard";

export default function MyReports() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

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
        console.error("Authentication check failed or user not found:", error);
        navigate(createPageUrl("Landing"));
      } finally {
        setIsCheckingAuth(false);
      }
    };
    loadUser();
  }, [navigate]);

  const { data: reports, isLoading } = useQuery({
    queryKey: ['my-reports', user?.email],
    queryFn: () => base44.entities.ProblemReport.filter(
      { created_by: user.email },
      '-created_date'
    ),
    enabled: !!user && !isCheckingAuth, // Ensure user is loaded and auth check is complete
    initialData: [],
  });

  const upvoteMutation = useMutation({
    mutationFn: async (report) => {
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
      queryClient.invalidateQueries({ queryKey: ['my-reports'] });
    },
  });

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

  // If user is null here, it means they were redirected to Landing page.
  // The component won't render further, but for type safety or future changes,
  // we might want a defensive check here, though `navigate` already handles it.
  // if (!user) return null; 

  const statusCounts = {
    reported: reports.filter(r => r.status === 'reported').length,
    under_review: reports.filter(r => r.status === 'under_review').length,
    action_initiated: reports.filter(r => r.status === 'action_initiated').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">My Reports</h1>
            <p className="text-slate-600">Track all the issues you've reported</p>
          </div>
          <Button
            onClick={() => navigate(createPageUrl("ReportProblem"))}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            Report New Problem
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-md border border-slate-200">
            <div className="text-3xl font-bold text-slate-700 mb-1">{statusCounts.reported}</div>
            <div className="text-sm text-slate-500">Reported</div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-md border border-blue-200">
            <div className="text-3xl font-bold text-blue-600 mb-1">{statusCounts.under_review}</div>
            <div className="text-sm text-slate-500">Under Review</div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-md border border-amber-200">
            <div className="text-3xl font-bold text-amber-600 mb-1">{statusCounts.action_initiated}</div>
            <div className="text-sm text-slate-500">In Progress</div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-md border border-green-200">
            <div className="text-3xl font-bold text-green-600 mb-1">{statusCounts.resolved}</div>
            <div className="text-sm text-slate-500">Resolved</div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-slate-200 rounded mb-4"></div>
                <div className="h-32 bg-slate-200 rounded mb-4"></div>
                <div className="h-4 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : reports.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                currentUserEmail={user?.email}
                onUpvote={() => upvoteMutation.mutate(report)}
                onClick={() => navigate(createPageUrl(`ReportDetails?id=${report.id}`))}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white/90 backdrop-blur-sm rounded-2xl shadow-md">
            <p className="text-slate-500 text-lg mb-4">You haven't reported any problems yet.</p>
            <Button
              onClick={() => navigate(createPageUrl("ReportProblem"))}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Report Your First Problem
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
