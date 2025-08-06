"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, Eye, Users, TrendingUp, Globe, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface BrookeAnalyticsData {
  id: number;
  page: string;
  referrer: string;
  readable_referrer: string;
  user_agent: string;
  ip_address: string;
  timestamp: string;
  pathname: string;
  search_params: string;
  created_at: string;
}

export default function BrookeAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<BrookeAnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBrookeAnalytics();
  }, []);

  const fetchBrookeAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/brooke-analytics');
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      const data = await response.json();
      setAnalyticsData(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const totalVisits = analyticsData.length;
  const uniqueIPs = new Set(analyticsData.map(item => item.ip_address)).size;
  const referrerStats = analyticsData.reduce((acc, item) => {
    const ref = item.readable_referrer;
    acc[ref] = (acc[ref] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topReferrers = Object.entries(referrerStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-white text-center py-20">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold">Loading Brooke Analytics...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-white text-center py-20">
            <h1 className="text-2xl font-bold mb-4">Error Loading Analytics</h1>
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={fetchBrookeAnalytics}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Brooke Analytics Dashboard</h1>
            <p className="text-gray-400">Track your page performance and visitor insights</p>
          </div>
          <Link href="/brooke">
            <Button variant="outline" className="text-white border-gray-600">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Visits</p>
                  <p className="text-3xl font-bold text-white">{totalVisits}</p>
                </div>
                <Eye className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Unique Visitors</p>
                  <p className="text-3xl font-bold text-white">{uniqueIPs}</p>
                </div>
                <Users className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Latest Visit</p>
                  <p className="text-lg font-semibold text-white">
                    {analyticsData.length > 0 
                      ? new Date(analyticsData[0].timestamp).toLocaleDateString()
                      : 'No visits'
                    }
                  </p>
                </div>
                <Clock className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Referrers */}
        <Card className="bg-gray-900 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Top Traffic Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topReferrers.map(([referrer, count]) => (
                <div key={referrer} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center">
                    <Badge variant="secondary" className="mr-3">
                      {referrer}
                    </Badge>
                  </div>
                  <div className="flex items-center">
                    <span className="text-white font-semibold mr-2">{count}</span>
                    <span className="text-gray-400 text-sm">visits</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.slice(0, 10).map((item) => (
                <div key={item.id} className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">
                        Visit from {item.readable_referrer}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                      <p className="text-gray-500 text-xs">
                        IP: {item.ip_address}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-gray-300">
                      {item.pathname}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 