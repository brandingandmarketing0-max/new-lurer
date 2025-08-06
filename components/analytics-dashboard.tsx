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
  Filter
} from "lucide-react";

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

interface AnalyticsSummary {
  totalVisitors: number;
  uniqueVisitors: number;
  topReferrers: { referrer: string; count: number }[];
  deviceTypes: { type: string; count: number }[];
  recentVisits: AnalyticsData[];
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

const AnalyticsDashboard = ({ pageName }: { pageName: string }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary>({
    totalVisitors: 0,
    uniqueVisitors: 0,
    topReferrers: [],
    deviceTypes: [],
    recentVisits: []
  });
  const [loading, setLoading] = useState(true);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      // In a real app, you'd fetch from your database
      // For now, we'll simulate with the JSON file data
      const response = await fetch('/api/analytics');
      if (response.ok) {
        const data = await response.json();
        console.log("Analytics data received:", data);
        const pageData = data.filter((item: AnalyticsData) => item.page === pageName);
        console.log("Page data for", pageName, ":", pageData);
        setAnalyticsData(pageData);
        
        // Calculate summary
        const uniqueIPs = new Set(pageData.map((item: AnalyticsData) => item.ip));
        const referrerCounts: { [key: string]: number } = {};
        const deviceCounts: { [key: string]: number } = {};
        
        pageData.forEach((item: AnalyticsData) => {
          // Handle both new format (with readableReferrer) and old format
          const readableRef = item.readableReferrer || getReadableReferrer(item.referrer);
          referrerCounts[readableRef] = (referrerCounts[readableRef] || 0) + 1;
          
          const deviceType = getDeviceType(item.userAgent);
          deviceCounts[deviceType] = (deviceCounts[deviceType] || 0) + 1;
        });
        
        setSummary({
          totalVisitors: pageData.length,
          uniqueVisitors: uniqueIPs.size,
          topReferrers: Object.entries(referrerCounts)
            .map(([referrer, count]) => ({ referrer, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5),
          deviceTypes: Object.entries(deviceCounts)
            .map(([type, count]) => ({ type, count }))
            .sort((a, b) => b.count - a.count),
          recentVisits: pageData
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 10)
        });
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [pageName]);

  const exportData = () => {
    const csvContent = [
      "Timestamp,Referrer,IP,Device Type,User Agent",
      ...analyticsData.map(item => 
        `${formatDate(item.timestamp)},"${item.readableReferrer || getReadableReferrer(item.referrer)}","${item.ip}","${getDeviceType(item.userAgent)}","${item.userAgent}"`
      ).join('\n')
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pageName}-analytics.csv`;
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
          <h1 className="text-3xl font-bold text-gray-900">{pageName} Analytics</h1>
          <p className="text-gray-600">Track your page performance and visitor insights</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadAnalyticsData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
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
            <div className="text-2xl font-bold text-[#8B7355]">{summary.totalVisitors}</div>
            <p className="text-xs text-gray-600">All time visits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
            <Eye className="h-4 w-4 text-[#B6997B]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#8B7355]">{summary.uniqueVisitors}</div>
            <p className="text-xs text-gray-600">Based on IP addresses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Referrer</CardTitle>
            <Globe className="h-4 w-4 text-[#B6997B]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#8B7355]">
              {summary.topReferrers[0]?.referrer || "N/A"}
            </div>
            <p className="text-xs text-gray-600">
              {summary.topReferrers[0]?.count || 0} visits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Used Device</CardTitle>
            <Smartphone className="h-4 w-4 text-[#B6997B]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#8B7355]">
              {summary.deviceTypes[0]?.type || "N/A"}
            </div>
            <p className="text-xs text-gray-600">
              {summary.deviceTypes[0]?.count || 0} users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="referrers" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="referrers">Top Referrers</TabsTrigger>
          <TabsTrigger value="devices">Device Types</TabsTrigger>
          <TabsTrigger value="recent">Recent Visits</TabsTrigger>
          <TabsTrigger value="raw">Raw Data</TabsTrigger>
        </TabsList>

        <TabsContent value="referrers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Referrers</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referrer</TableHead>
                    <TableHead>Visits</TableHead>
                    <TableHead>Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.topReferrers.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.referrer}</TableCell>
                      <TableCell>{item.count}</TableCell>
                      <TableCell>
                        {((item.count / summary.totalVisitors) * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Device Types</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device Type</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.deviceTypes.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.type}</TableCell>
                      <TableCell>{item.count}</TableCell>
                      <TableCell>
                        {((item.count / summary.totalVisitors) * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Visits</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Referrer</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.recentVisits.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{formatDate(item.timestamp)}</TableCell>
                                             <TableCell>
                         <Badge variant="secondary">
                           {item.readableReferrer || getReadableReferrer(item.referrer)}
                         </Badge>
                       </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getDeviceType(item.userAgent)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{item.ip}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="raw" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Analytics Data</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Referrer</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>User Agent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analyticsData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-xs">{formatDate(item.timestamp)}</TableCell>
                                             <TableCell className="max-w-[200px] truncate">
                         {item.readableReferrer || getReadableReferrer(item.referrer)}
                       </TableCell>
                      <TableCell className="font-mono text-xs">{item.ip}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getDeviceType(item.userAgent)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate text-xs">
                        {item.userAgent}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard; 