"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Eye, 
  TrendingUp, 
  Globe, 
  Clock, 
  MapPin, 
  Smartphone, 
  Monitor,
  RefreshCw,
  Download,
  BarChart3,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";

interface AnalyticsData {
  page: string;
  referrer: string;
  readableReferrer?: string; // Optional for backward compatibility
  userAgent: string;
  ip: string;
  timestamp: string;
  pathname: string;
  searchParams: string;
}

interface PageAnalytics {
  page: string;
  totalVisitors: number;
  uniqueVisitors: number;
  topReferrer: string;
  topReferrerCount: number;
  mostUsedDevice: string;
  mostUsedDeviceCount: number;
  lastVisit: string;
}

const getReadableReferrer = (ref: string) => {
  if (!ref) return "Direct or unknown";
  if (ref.includes("instagram.com")) return "Instagram";
  if (ref.includes("twitter.com") || ref.includes("x.com")) return "Twitter/X";
  if (ref.includes("facebook.com")) return "Facebook";
  if (ref.includes("tiktok.com")) return "TikTok";
  if (ref.includes("linkedin.com")) return "LinkedIn";
  if (ref.includes("whatsapp.com") || ref.includes("wa.me")) return "WhatsApp";
  return ref;
};

const getDeviceType = (userAgent: string) => {
  if (userAgent.includes("Mobile")) return "Mobile";
  if (userAgent.includes("Tablet")) return "Tablet";
  return "Desktop";
};

const formatDate = (timestamp: string) => {
  return new Date(timestamp).toLocaleString();
};

const MasterAnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [pageAnalytics, setPageAnalytics] = useState<PageAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [totalUniqueVisitors, setTotalUniqueVisitors] = useState(0);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
        
        // Calculate per-page analytics
        const pages = [...new Set(data.map((item: AnalyticsData) => item.page))] as string[];
        const pageStats: PageAnalytics[] = [];
        
        pages.forEach((page: string) => {
          const pageData = data.filter((item: AnalyticsData) => item.page === page);
          const uniqueIPs = new Set(pageData.map((item: AnalyticsData) => item.ip));
          
          // Calculate referrer counts
          const referrerCounts: { [key: string]: number } = {};
          const deviceCounts: { [key: string]: number } = {};
          
                     pageData.forEach((item: AnalyticsData) => {
             // Handle both new format (with readableReferrer) and old format
             const readableRef = item.readableReferrer || getReadableReferrer(item.referrer);
             referrerCounts[readableRef] = (referrerCounts[readableRef] || 0) + 1;
             
             const deviceType = getDeviceType(item.userAgent);
             deviceCounts[deviceType] = (deviceCounts[deviceType] || 0) + 1;
           });
          
          const topReferrer = Object.entries(referrerCounts)
            .sort((a: [string, number], b: [string, number]) => b[1] - a[1])[0] || ["N/A", 0];
          
          const topDevice = Object.entries(deviceCounts)
            .sort((a: [string, number], b: [string, number]) => b[1] - a[1])[0] || ["N/A", 0];
          
          const lastVisit = pageData
            .sort((a: AnalyticsData, b: AnalyticsData) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]?.timestamp || "N/A";
          
          pageStats.push({
            page,
            totalVisitors: pageData.length,
            uniqueVisitors: uniqueIPs.size,
            topReferrer: topReferrer[0],
            topReferrerCount: topReferrer[1],
            mostUsedDevice: topDevice[0],
            mostUsedDeviceCount: topDevice[1],
            lastVisit
          });
        });
        
        setPageAnalytics(pageStats.sort((a, b) => b.totalVisitors - a.totalVisitors));
        
        // Calculate totals
        const allUniqueIPs = new Set(data.map((item: AnalyticsData) => item.ip));
        setTotalVisitors(data.length);
        setTotalUniqueVisitors(allUniqueIPs.size);
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const exportAllData = () => {
    const csvContent = [
      "Page,Timestamp,Referrer,IP,Device Type,User Agent",
             ...analyticsData.map(item => 
         `${item.page},${formatDate(item.timestamp)},"${item.readableReferrer || getReadableReferrer(item.referrer)}","${item.ip}","${getDeviceType(item.userAgent)}","${item.userAgent}"`
       ).join('\n')
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'all-analytics.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-[#B6997B]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Master Analytics Dashboard</h1>
          <p className="text-gray-600">Track performance across all pages</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadAnalyticsData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportAllData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export All Data
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
            <Users className="h-4 w-4 text-[#B6997B]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#8B7355]">{totalVisitors}</div>
            <p className="text-xs text-gray-600">Across all pages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
            <Eye className="h-4 w-4 text-[#B6997B]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#8B7355]">{totalUniqueVisitors}</div>
            <p className="text-xs text-gray-600">Based on IP addresses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Pages</CardTitle>
            <BarChart3 className="h-4 w-4 text-[#B6997B]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#8B7355]">{pageAnalytics.length}</div>
            <p className="text-xs text-gray-600">Pages with visitors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Popular</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#B6997B]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#8B7355]">
              {pageAnalytics[0]?.page || "N/A"}
            </div>
            <p className="text-xs text-gray-600">
              {pageAnalytics[0]?.totalVisitors || 0} visits
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Page Analytics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Page Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page</TableHead>
                <TableHead>Total Visitors</TableHead>
                <TableHead>Unique Visitors</TableHead>
                <TableHead>Top Referrer</TableHead>
                <TableHead>Most Used Device</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageAnalytics.map((page, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium capitalize">{page.page}</TableCell>
                  <TableCell>{page.totalVisitors}</TableCell>
                  <TableCell>{page.uniqueVisitors}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {page.topReferrer}
                    </Badge>
                    <span className="text-xs text-gray-500 ml-1">
                      ({page.topReferrerCount})
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {page.mostUsedDevice}
                    </Badge>
                    <span className="text-xs text-gray-500 ml-1">
                      ({page.mostUsedDeviceCount})
                    </span>
                  </TableCell>
                  <TableCell className="text-xs">
                    {page.lastVisit !== "N/A" ? formatDate(page.lastVisit) : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Link href={`/${page.page}/analytics`}>
                      <Button variant="ghost" size="sm">
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default MasterAnalyticsDashboard;