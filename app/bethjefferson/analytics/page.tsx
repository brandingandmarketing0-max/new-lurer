"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, Eye, MousePointer, Users, TrendingUp, Calendar, Globe, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface BethjeffersonAnalyticsData {
  id: string;
  page: string;
  referrer: string | null;
  readable_referrer: string | null;
  user_agent: string | null;
  ip_address: string | null;
  timestamp: string;
  pathname: string | null;
  search_params: string | null;
  click_type: string | null;
  created_at: string;
}

export default function BethjeffersonAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<BethjeffersonAnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBethjeffersonAnalytics();
  }, []);

  const fetchBethjeffersonAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/track?page=bethjefferson');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setAnalyticsData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching bethjefferson analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const totalVisits = analyticsData.length;
  const uniqueReferrers = new Set(analyticsData.map(item => item.readable_referrer).filter(Boolean)).size;
  const clickTypes = analyticsData.reduce((acc, item) => {
    const type = item.click_type || 'page_visit';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pageVisits = clickTypes['page_visit'] || 0;
  const exclusiveContentClicks = clickTypes['exclusive_content'] || 0;
  const subscribeClicks = clickTypes['subscribe_now'] || 0;
  const viewAllContentClicks = clickTypes['view_all_content'] || 0;

  // Get top referrers
  const referrerCounts = analyticsData.reduce((acc, item) => {
    const ref = item.readable_referrer || 'Direct or unknown';
    acc[ref] = (acc[ref] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topReferrers = Object.entries(referrerCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  // Get recent activity
  const recentActivity = analyticsData
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
            <Button onClick={fetchBethjeffersonAnalytics} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Beth Jefferson Analytics Dashboard</h1>
              <p className="text-gray-600 mt-2">Track your page performance and visitor engagement</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/bethjefferson" target="_blank">
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View Page
                </Button>
              </Link>
              <Button onClick={fetchBethjeffersonAnalytics}>
                <TrendingUp className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalVisits}</div>
              <p className="text-xs text-muted-foreground">
                All time page visits
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Page Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pageVisits}</div>
              <p className="text-xs text-muted-foreground">
                Direct page visits
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Content Clicks</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{exclusiveContentClicks}</div>
              <p className="text-xs text-muted-foreground">
                Exclusive content interactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subscribe Clicks</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subscribeClicks}</div>
              <p className="text-xs text-muted-foreground">
                Subscription button clicks
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Referrers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Top Traffic Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topReferrers.map(([referrer, count]) => (
                  <div key={referrer} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{referrer}</span>
                    <Badge variant="secondary">{count} visits</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Click Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Click Type Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Page Visits</span>
                  <Badge variant="default">{pageVisits}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Exclusive Content</span>
                  <Badge variant="secondary">{exclusiveContentClicks}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Subscribe Now</span>
                  <Badge variant="outline">{subscribeClicks}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">View All Content</span>
                  <Badge variant="destructive">{viewAllContentClicks}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Time</th>
                    <th className="text-left py-2 px-2">Action</th>
                    <th className="text-left py-2 px-2">Source</th>
                    <th className="text-left py-2 px-2">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((activity) => (
                    <tr key={activity.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2 text-sm">
                        {new Date(activity.timestamp).toLocaleString()}
                      </td>
                      <td className="py-2 px-2">
                        <Badge variant="outline">
                          {activity.click_type || 'page_visit'}
                        </Badge>
                      </td>
                      <td className="py-2 px-2 text-sm">
                        {activity.readable_referrer || 'Direct'}
                      </td>
                      <td className="py-2 px-2 text-sm text-gray-500">
                        {activity.ip_address || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500">
          <p>Analytics data is updated in real-time. Last refreshed: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
