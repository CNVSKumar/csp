
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, ArrowLeft, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const categories = [
  { value: "roads_potholes", label: "Roads & Potholes" },
  { value: "water_sanitation", label: "Water & Sanitation" },
  { value: "street_lights", label: "Street Lights" },
  { value: "garbage_waste", label: "Garbage & Waste" },
  { value: "parks_recreation", label: "Parks & Recreation" },
  { value: "public_safety", label: "Public Safety" },
  { value: "other", label: "Other" }
];

export default function ReportProblem() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    category: "",
  });
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [analyzingSentiment, setAnalyzingSentiment] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          navigate(createPageUrl("Landing"));
        }
      } catch (error) {
        // In case of any error during auth check, assume not authenticated
        console.error("Authentication check failed:", error);
        navigate(createPageUrl("Landing"));
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const createReportMutation = useMutation({
    mutationFn: async (reportData) => {
      setAnalyzingSentiment(true);
      
      // Analyze sentiment using AI
      const sentimentAnalysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze the sentiment and urgency of this civic problem report. Classify it as one of: urgent (immediate danger/severe issue), concerned (significant problem), neutral (informational), or positive (improvement/thank you). 

Title: "${reportData.title}"
Description: "${reportData.description}"`,
        response_json_schema: {
          type: "object",
          properties: {
            sentiment: {
              type: "string",
              enum: ["urgent", "concerned", "neutral", "positive"]
            },
            reason: {
              type: "string"
            }
          }
        }
      });
      
      setAnalyzingSentiment(false);
      
      return base44.entities.ProblemReport.create({
        ...reportData,
        sentiment: sentimentAnalysis.sentiment,
        comment_count: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      navigate(createPageUrl("Feed"));
    },
    onError: (err) => {
      setError(err.message || "Failed to create report. Please try again.");
    }
  });

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 5) {
      setError("Maximum 5 photos allowed");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const uploadPromises = files.map(async (file) => {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        return file_url;
      });

      const urls = await Promise.all(uploadPromises);
      setPhotos([...photos, ...urls]);
    } catch (err) {
      setError("Error uploading photos. Please try again.");
    }
    
    setUploading(false);
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    
    if (!formData.title || !formData.description || !formData.location || !formData.category) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      await createReportMutation.mutateAsync({
        ...formData,
        photo_urls: photos,
        status: "reported",
        upvotes: [],
        upvote_count: 0
      });
    } catch (err) {
      // Error handled by mutation's onError
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Feed"))}
            className="hover:bg-slate-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Report a Problem</h1>
            <p className="text-slate-600 mt-1">Help improve your community</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {analyzingSentiment && (
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <AlertDescription className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing report urgency and sentiment...
            </AlertDescription>
          </Alert>
        )}

        <Card className="shadow-xl border-slate-200 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Problem Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Brief description of the problem"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-slate-50 border-slate-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed information about the problem..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="h-32 bg-slate-50 border-slate-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="Street address or area"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="bg-slate-50 border-slate-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Photos (Optional - Max 5)</Label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                    disabled={uploading || photos.length >= 5}
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                    <p className="text-slate-600">
                      {uploading ? "Uploading..." : "Click to upload photos"}
                    </p>
                  </label>
                </div>

                {photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {photos.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(createPageUrl("Feed"))}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createReportMutation.isPending || uploading || analyzingSentiment}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  {createReportMutation.isPending || analyzingSentiment ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {analyzingSentiment ? "Analyzing..." : "Submitting..."}
                    </>
                  ) : (
                    "Submit Report"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
