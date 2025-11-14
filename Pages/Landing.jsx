import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  AlertCircle, 
  Users, 
  TrendingUp, 
  Shield,
  MessageSquare,
  Camera,
  MapPin,
  CheckCircle,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          navigate(createPageUrl("Feed"));
        }
      } catch (error) {
        console.log("Not authenticated");
      } finally {
        setIsChecking(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleGetStarted = () => {
    base44.auth.redirectToLogin(createPageUrl("Feed"));
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading CivicHub...</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: AlertCircle,
      title: "Report Problems",
      description: "Easily report civic issues in your community with photos and detailed descriptions",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: Users,
      title: "Community Support",
      description: "Show support for issues affecting your neighbors and gauge community impact",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      description: "Monitor the status of reported problems from submission to resolution",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: Shield,
      title: "Reach Authorities",
      description: "Your reports are organized and exported to domain authorities for action",
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    },
    {
      icon: MessageSquare,
      title: "Engage in Discussion",
      description: "Comment on reports and share updates with your community",
      color: "text-pink-600",
      bgColor: "bg-pink-50"
    },
    {
      icon: Sparkles,
      title: "AI Sentiment Analysis",
      description: "Smart analysis helps prioritize urgent issues and understand community concerns",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    }
  ];

  const howItWorks = [
    {
      step: "1",
      icon: Camera,
      title: "Report an Issue",
      description: "Take a photo, describe the problem, and specify the location"
    },
    {
      step: "2",
      icon: Users,
      title: "Community Reviews",
      description: "Other citizens can view, support, and comment on your report"
    },
    {
      step: "3",
      icon: Shield,
      title: "Authorities Respond",
      description: "Officials review reports and update status as they take action"
    },
    {
      step: "4",
      icon: CheckCircle,
      title: "Problem Resolved",
      description: "Track the issue from report to resolution and celebrate improvements"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                <MapPin className="w-9 h-9 text-white" />
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                CivicHub
              </h1>
            </div>
            
            <p className="text-xl md:text-2xl text-slate-700 mb-4 font-medium">
              Your Voice for Community Improvement
            </p>
            
            <p className="text-lg text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Report civic problems, track their progress, and collaborate with your community 
              to make your neighborhood a better place to live.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
