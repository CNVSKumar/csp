import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { PlusCircle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

import ReportCard from "../components/reports/ReportCard";
import FilterBar from "../components/reports/FilterBar";
import SentimentAnalyzer from "../components/sentiment/SentimentAnalyzer";

export default function Feed() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [filters, setFilters] = useState({
    location: "",
    category: "all",
    status: "all"
  });

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
        navigate(createPageUrl("Landing"));
      } finally {
        setIsCheckingAuth(false);
      }
    };
    loadUser();
  }, [navigate]);

  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: () => base44.entities.ProblemReport.list('-created_date'),
    initialData: [],
    enabled: !isCheckingAuth,
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
      queryClient.invalidateQueries({ queryKey: ['reports'] });
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

  const filteredReports = reports.filter(report => {
    const locationMatch = !filters.location || 
      report.location.toLowerCase().includes(filters.location.toLowerCase());
    const categoryMatch = filters.category === "all" || report.category === filters.category;
    const statusMatch = filters.status === "all" || report.status === filters.status;
    return locationMatch && categoryMatch && statusMatch;
  });

  const topReports = [...filteredReports].sort((a, b) => 
    (b.upvote_count || 0) - (a.upvote_count || 0)
  ).slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Community Feed</h1>
            <p className="text-slate-600">Stay informed about civic issues in your area</p>
          </div>
          <Button
            onClick={() => navigate(createPageUrl("ReportProblem"))}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            Report Problem
          </Button>
        </div>

        <FilterBar onFilterChange={setFilters} filters={filters} />

        <div className="grid lg:grid-cols-4 gap-6 mb-6">
          <div className="lg:col-span-3">
            {topReports.length > 0 && filters.category === "all" && filters.status === "all" && !filters.location && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 mb-6 border border-amber-200">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-amber-700" />
                  <h2 className="text-xl font-bold text-amber-900">Most Supported Issues</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {topReports.map((report) => (
                    <div key={report.id} className="bg-white rounded-xl p-4 shadow-md">
                      <h3 className="font-semibold text-slate-900 mb-2">{report.title}</h3>
                      <p className="text-sm text-slate-600 mb-2">{report.location}</p>
                      <div className="flex items-center gap-2 text-blue-600 font-semibold">
                        <span>{report.upvote_count || 0} people affected</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
            ) : (
              <motion.div 
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {filteredReports.map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    currentUserEmail={user?.email}
                    onUpvote={(report) => upvoteMutation.mutate(report)}
                    onClick={() => navigate(createPageUrl(`ReportDetails?id=${report.id}`))}
                  />
                ))}
              </motion.div>
            )}

            {!isLoading && filteredReports.length === 0 && (
              <div className="text-center py-16">
                <p className="text-slate-500 text-lg">No reports found matching your filters.</p>
              </div>
            )}
          </div>
          
          <div>
            <SentimentAnalyzer reports={filteredReports} />
          </div>
        </div>
      </div>
    </div>
  );
}