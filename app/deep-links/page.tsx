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
  LogOut,
  Link as LinkIcon,
  Settings,
  Home,
  Activity,
  Download,
  Video
} from "lucide-react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/hooks/use-auth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

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
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [cache, setCache] = useState<Map<string, any>>(new Map());
  const { signOut, user } = useAuth();

  // Model names are now handled by the API

  useEffect(() => {
    fetchAllModelData();
  }, []);

  const fetchAllModelData = async () => {
    try {
      setLoading(true);
      setLoadingProgress(0);
      
      // Check cache first
      const cacheKey = 'all_analytics_data';
      if (cache.has(cacheKey)) {
        const cachedData = cache.get(cacheKey);
        setModels(cachedData);
        setLoading(false);
        setLoadingProgress(100);
        return;
      }

      setLoadingProgress(25);
      
      // Single API call to get all analytics data
      const response = await fetch('/api/analytics/all', {
        headers: {
          'Cache-Control': 'max-age=300' // Cache for 5 minutes
        }
      });
      
      setLoadingProgress(75);
      
      if (response.ok) {
        const data = await response.json();
        const results = data.data || [];
        
        // Cache the results
        cache.set(cacheKey, results);
        
        setModels(results);
      } else {
        console.error('Failed to fetch analytics data:', response.status, response.statusText);
        console.log('Falling back to individual API calls...');
        
        // Fallback: Use individual API calls if the bulk API fails
        await fetchIndividualData();
      }
      
    } catch (error) {
      console.error("Error fetching model data:", error);
      setModels([]);
    } finally {
      setLoading(false);
      setLoadingProgress(100);
    }
  };

  const fetchIndividualData = async () => {
    const modelNames = [
      "abbiehall", "abby", "aimee", "alaska", "alfrileyyy", "alicia", "amberr", "amyleigh", "amymaxwell",
      "babyscarlet", "bethjefferson", "Blondestud69", "brooke", "brooke_xox", "brookex",
      "chloeayling", "chloeelizabeth", "chloeinskip", "chloetami", "chxrli_love", "cowgurlkacey",
      "dominika", "ellejean", "em", "emily9999x", "erinhannahxx", "fitnessblonde", "freya", "georgiaaa",
      "grace", "hannah", "jason", "josh", "kaceymay", "kayley", "keanna", "kimbo_bimbo", "kxceyrose",
      "laurdunne", "laylaasoyoung", "laylasoyoung", "libby", "lily", "lou", "lsy",
      "maddison", "maddysmith111x", "megann", "michaelajayneex", "missbrown", "misssophiaisabella", "morgan",
      "noreilly75", "ollie", "onlyjessxrose", "paigexb", "petitelils", "poppy",
      "rachel", "rachsotiny", "robynnparkerr", "scarletxroseeevip", "sel", "skye", "steff", "sxmmermae",
      "victoria", "wackojacko69"
    ];

    const results: any[] = [];
    
    for (const modelName of modelNames) {
      try {
        const response = await fetch(`/api/track?page=${modelName}`);
        if (response.ok) {
          const data = await response.json();
          const analyticsData = data.data || [];
          
          const pageVisits = analyticsData.filter((item: any) => (item.click_type || 'page_visit') === 'page_visit').length;
          const exclusiveContentClicks = analyticsData.filter((item: any) => item.click_type === 'exclusive_content').length;
          const subscribeClicks = analyticsData.filter((item: any) => item.click_type === 'subscribe_now').length;
          const viewAllContentClicks = analyticsData.filter((item: any) => item.click_type === 'view_all_content').length;

          results.push({
            name: modelName,
            url: `viewit.bio/${modelName}`,
            totalVisitors: pageVisits,
            pageVisits,
            exclusiveContentClicks,
            subscribeClicks,
            viewAllContentClicks,
            status: "active" as const
          });
        }
      } catch (error) {
        console.error(`Error fetching data for ${modelName}:`, error);
      }
    }
    
    setModels(results);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleRefresh = () => {
    setCache(new Map()); // Clear cache
    setModels([]); // Clear current data
    fetchAllModelData(); // Refetch all data
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
            <p className="text-gray-600 mt-2">Fetching analytics data for all models (single API call)</p>
            <div className="w-64 mx-auto mt-4">
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-[#B19272] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">{loadingProgress}% complete</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex h-screen bg-white">
          {/* Sidebar */}
          <Sidebar>
            <SidebarHeader className="border-b border-gray-200 pb-4">
              <div className="flex items-center gap-3 px-4">
                <div className="w-8 h-8 bg-[#B19272] rounded-lg flex items-center justify-center">
                  <LinkIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">ViewIt</h2>
                  <p className="text-xs text-gray-500">Deep Links Manager</p>
                </div>
              </div>
            </SidebarHeader>

            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/">
                          <Home className="w-4 h-4" />
                          <span>Dashboard</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive>
                        <LinkIcon className="w-4 h-4" />
                        <span>Deep Links</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/analytics">
                          <BarChart3 className="w-4 h-4" />
                          <span>Analytics</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/converter">
                          <Video className="w-4 h-4" />
                          <span>Converter</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/profile">
                          <Activity className="w-4 h-4" />
                          <span>Profile</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>



              <SidebarGroup>
                <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-gray-200 pt-4">
              <div className="px-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">
                      {user?.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                    <p className="text-xs text-gray-500">Admin</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full border-gray-300 text-red-600 hover:text-red-700"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </SidebarFooter>
          </Sidebar>

          {/* Main Content */}
          <SidebarInset>
            <div className="flex flex-col h-full w-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <SidebarTrigger />
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Deep Links</h1>
                    <p className="text-gray-600">
                      Manage and track your deep links
                      {!loading && (
                        <span className="ml-2 text-sm text-gray-500">
                          ({models.length} models loaded, {cache.size} cached)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-gray-300"
                    onClick={handleRefresh}
                    disabled={loading}
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Refresh Data
                  </Button>
                  <Button variant="outline" size="sm" className="border-gray-300">
                    <Grid3X3 className="h-4 w-4 mr-2" />
                    Layout
                  </Button>
                  <Button variant="outline" size="sm" className="border-gray-300">
                    <Bell className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4 p-6 border-b border-gray-200">
                <div className="flex-1 relative max-w-md">
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
                  <Button className="bg-[#B19272] hover:bg-[#9A7B5F] text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>

              {/* Table */}
              <div className="flex-1 p-6">
                <Card className="border-gray-200 h-full">
                  <CardContent className="p-0 h-full">
                    <div className="h-full overflow-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
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
              </div>

              {/* Summary */}
              <div className="p-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing {sortedModels.length} of {models.length} deep links
                </div>
              </div>
            </div>
          </SidebarInset>
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
      </SidebarProvider>
    </ProtectedRoute>
  );
} 