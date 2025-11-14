
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Shield } from "lucide-react";
import { format } from "date-fns";
import StatusBadge from "../components/reports/StatusBadge";
import SentimentBadge from "../components/sentiment/SentimentBadge";
import SentimentAnalyzer from "../components/sentiment/SentimentAnalyzer";
import { useNavigate } from "react-router-dom"; // Assuming react-router-dom for navigation

// Helper function for creating page URLs, based on the outline's usage
// This function maps logical page names to actual routes.
const createPageUrl = (pageName) => {
  switch (pageName) {
    case "Landing":
      return "/"; // Default landing page route
    case "Feed":
      return "/feed"; // Route for the user feed
    // Add other page name to route mappings as needed
    default:
      return `/${pageName.toLowerCase()}`;
  }
};

const categoryLabels = {
  roads_potholes: "Roads & Potholes",
  water_sanitation: "Water & Sanitation",
  street_lights: "Street Lights",
  garbage_waste: "Garbage & Waste",
  parks_recreation: "Parks & Recreation",
  public_safety: "Public Safety",
  other: "Other"
};

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const navigate = useNavigate(); // Initialize useNavigate hook
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // New state for managing auth loading

  useEffect(() => {
    const loadUser = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          // If not authenticated, redirect to the landing page
          navigate(createPageUrl("Landing"));
          return;
        }
        const currentUser = await base44.auth.me();
        if (currentUser.role !== 'admin') {
          // If authenticated but not an admin, redirect to the user feed
          navigate(createPageUrl("Feed"));
          return;
        }
        // If authenticated and admin, set the user
        setUser(currentUser);
      } catch (error) {
        // If there's an error during auth check or fetching user, redirect to landing
        console.error("Authentication check failed:", error);
        navigate(createPageUrl("Landing"));
      } finally {
        // Always set checking auth to false once the process is complete
        setIsCheckingAuth(false);
      }
    };
    loadUser();
  }, [navigate]); // Add navigate to dependency array to satisfy exhaustive-deps lint rule

  const { data: reports, isLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => base44.entities.ProblemReport.list('-created_date'),
    initialData: [],
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ reportId, newStatus }) =>
      base44.entities.ProblemReport.update(reportId, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
    },
  });

  const exportReports = () => {
    const exportData = reports
      // Filter reports to include only 'reported' or 'under_review' for authorities, as per common requirements
      .filter(r => r.status === 'reported' || r.status === 'under_review')
      .map(report => ({
        'Title': report.title,
        'Description': report.description,
        'Location': report.location,
        'Category': categoryLabels[report.category],
        'Status': report.status.replace(/_/g, ' '),
        'Upvotes': report.upvote_count || 0,
        'Comments': report.comment_count || 0,
        'Sentiment': report.sentiment || 'neutral',
        'Reported By': report.created_by,
        'Date': format(new Date(report.created_date), 'yyyy-MM-dd HH:mm'),
        'Photo URLs': report.photo_urls?.join(', ') || ''
      }));

    if (exportData.length === 0) {
      console.warn("No reports matching the criteria to export.");
      return;
    }

    const headers = Object.keys(exportData[0] || {});
    const csvContent = [
      headers.join(','),
      ...exportData.map(row =>
        headers.map(header => {
          let value = row[header] || '';
          // Convert to string to ensure replace works
          value = String(value);
          // CSV escape logic: double quotes are escaped by doubling them, then enclose value in quotes if it contains a comma or double quote.
          if (value.includes(',') || value.includes('"')) {
            value = `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `civic-reports-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up the object URL to free memory
  };

  const statusCounts = {
    total: reports.length,
    reported: reports.filter(r => r.status === 'reported').length,
    under_review: reports.filter(r => r.status === 'under_review').length,
    action_initiated: reports.filter(r => r.status === 'action_initiated').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
  };

  // Display a loading spinner while checking authentication status
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // The previous check `if (!user || user.role !== 'admin') { return null; }` is no longer needed
