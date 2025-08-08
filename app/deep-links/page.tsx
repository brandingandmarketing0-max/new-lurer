"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  Plus, 
  Copy, 
  BarChart3, 
  Grid3X3,
  Bell,
  ChevronDown,
  ArrowUpDown,
  Eye,
  Heart,
  Star,
  Lock,
  LogOut
} from "lucide-react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/hooks/use-auth";

interface ModelData {
  name: string;
  url: string;
  totalVisitors: number;
  pageVisits: number;
  exclusiveContentClicks: number;
  subscribeClicks: number;
  viewAllContentClicks: number;
  status: "active" | "inactive";
}

export default function DeepLinksPage() {
  const [models, setModels] = useState<ModelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const { signOut, user } = useAuth();

  const modelNames = [
    "abbiehall", "aimee", "alaska", "amberr", "amyleigh", "amymaxwell", "b4byyeena", 
    "babyscarlet", "babyyeena", "brooke", "chloeayling", "chloeelizabeth", 
    "chloetami", "ellejean", "em", "freya", "georgiaaa", "josh", "kaceymay", 
    "kaci", "kayley", "keanna", "kxceyrose", "laurdunne", "laylasoyoung", 
     "libby", "lou", "megann", "missbrown", "morgan", "ollie", 
    "poppy", "rachel", "sel", "shania", "skye", "steff", "sxmmermae"
  ];

  useEffect(() => {
    fetchAllModelData();
  }, []);

  const fetchAllModelData = async () => {
    try {
      setLoading(true);
      const modelDataPromises = modelNames.map(async (modelName) => {
        try {
          const response = await fetch(`/api/${modelName}-analytics`);
          if (response.ok) {
            const data = await response.json();
            const analyticsData = data.data || [];
            
            // Calculate different click types
            const pageVisits = analyticsData.filter((item: any) => item.click_type === 'page_visit').length;
            const exclusiveContentClicks = analyticsData.filter((item: any) => item.click_type === 'exclusive_content').length;
            const subscribeClicks = analyticsData.filter((item: any) => item.click_type === 'subscribe_now').length;
            const viewAllContentClicks = analyticsData.filter((item: any) => item.click_type === 'view_all_content').length;
            const totalVisitors = analyticsData.length;

            return {
              name: modelName,
              url: ` lure.bio/${modelName}`,
              totalVisitors,
              pageVisits,
              exclusiveContentClicks,
              subscribeClicks,
              viewAllContentClicks,
              status: "active" as const
            };
          } else {
            return {
              name: modelName,
              url: ` lure.bio/${modelName}`,
              totalVisitors: 0,
              pageVisits: 0,
              exclusiveContentClicks: 0,
              subscribeClicks: 0,
              viewAllContentClicks: 0,
              status: "active" as const
            };
          }
        } catch (error) {
          return {
            name: modelName,
            url: ` lure.bio/${modelName}`,
            totalVisitors: 0,
            pageVisits: 0,
            exclusiveContentClicks: 0,
            subscribeClicks: 0,
            viewAllContentClicks: 0,
            status: "active" as const
          };
        }
      });

      const results = await Promise.all(modelDataPromises);
      setModels(results);
    } catch (error) {
      console.error("Error fetching model data:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const filteredModels = models.filter(model =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedModels = [...filteredModels].sort((a, b) => {
    switch (sortBy) {
      case "visitors":
        return b.totalVisitors - a.totalVisitors;
      case "exclusive":
        return b.exclusiveContentClicks - a.exclusiveContentClicks;
      case "subscribe":
        return b.subscribeClicks - a.subscribeClicks;
      case "name":
        return a.name.localeCompare(b.name);
      case "newest":
      default:
        return 0; // Keep original order
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B19272] mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900">Loading Deep Links...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Deep Links</h1>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Welcome, {user?.email}</span>
              </div>
              <Button variant="outline" size="sm" className="border-gray-300">
                <Grid3X3 className="h-4 w-4 mr-2" />
                Layout
              </Button>
              <Button variant="outline" size="sm" className="border-gray-300">
                <Bell className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-gray-300 text-red-600 hover:text-red-700"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search tracking links..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-gray-300">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              {sortBy === "newest" ? "↑↓ Newest" : 
               sortBy === "visitors" ? "↑↓ Visitors" : 
               sortBy === "exclusive" ? "↑↓ Exclusive" :
               sortBy === "subscribe" ? "↑↓ Subscribe" :
               sortBy === "name" ? "↑↓ Name" : "↑↓ Sort"}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
            <Button variant="outline" size="sm" className="border-gray-300">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>

        {/* Table */}
        <Card className="border-gray-200">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        Page Visits
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        Exclusive Content
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        Subscribe Clicks
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        View All Content
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Visitors
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedModels.map((model, index) => (
                    <tr key={model.name} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-4 h-4 rounded-full bg-green-500"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-[#B19272] font-medium">{model.url}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(model.url)}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {model.pageVisits.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {model.exclusiveContentClicks.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {model.subscribeClicks.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {model.viewAllContentClicks.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {model.totalVisitors.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href={`/${model.name}/analytics`}>
                          <Button variant="outline" size="sm" className="border-gray-300 text-gray-600">
                            <BarChart3 className="h-3 w-3 mr-1" />
                            View Analytics
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="mt-6 text-sm text-gray-600">
          Showing {sortedModels.length} of {models.length} deep links
        </div>
      </div>

      <style jsx>{`
        .toggle-checkbox:checked {
          transform: translateX(100%);
          border-color: #B19272;
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #B19272;
        }
        .toggle-label {
          transition: background-color 0.2s ease-in-out;
        }
      `}</style>
      </div>
    </ProtectedRoute>
  );
} 