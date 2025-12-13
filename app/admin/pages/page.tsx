"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

type PageRow = {
  id: number;
  slug: string;
  title: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export default function AdminPagesList() {
  return (
    <ProtectedRoute>
      <AdminPagesListInner />
    </ProtectedRoute>
  );
}

type LinkRow = {
  id: number;
  page_id: number;
  label: string;
  url: string;
  sort_order: number;
  is_active: boolean;
};

function AdminPagesListInner() {
  const [pages, setPages] = useState<PageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newSlug, setNewSlug] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  
  const [expandedPageId, setExpandedPageId] = useState<number | null>(null);
  const [pageLinks, setPageLinks] = useState<Record<number, LinkRow[]>>({});
  const [loadingLinks, setLoadingLinks] = useState<Record<number, boolean>>({});
  const [reExtractingPageId, setReExtractingPageId] = useState<number | null>(null);

  // Common existing page slugs that can be migrated
  const commonExistingSlugs = [
    "test123", "jen", "sel", "brooke", "rachel", "rachsotiny", "josh", "m8d1son",
    "abbiehall", "abby", "aimee", "alaska", "alicia", "amyleigh", "amberr",
    "chloeayling", "chloetami", "dominika", "ellejean", "em", "freya",
    "hannah", "kaceymay", "kayley", "kimbo_bimbo", "kxceyrose", "laurdunne",
    "laylasoyoung", "lily", "lou", "maddison", "megann", "morgan", "ollie",
    "poppy", "skye", "victoria", "wackojacko69"
  ];

  const fetchPages = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("pages")
      .select("id, slug, title, is_active, created_at, updated_at")
      .order("updated_at", { ascending: false });

    if (error) {
      setError(error.message);
      setPages([]);
    } else {
      setPages((data as PageRow[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const extractFromExisting = async () => {
    const slug = newSlug.trim().toLowerCase();
    if (!slug) return;

    setExtracting(true);
    setError(null);
    setExtractedData(null);

    try {
      const response = await fetch(`/api/extract-page-data?slug=${slug}`);
      const result = await response.json();

      if (result.success && result.exists) {
        setExtractedData(result.data);
        setNewTitle(result.data.title || slug);
        // Show success message
        setError(null);
        
        // Log what was found for debugging
        if (result.debug) {
          console.log('Extraction debug:', result.debug);
          // Show a more detailed message if some data is missing
          if (!result.debug.foundLinks && result.debug.foundTitle) {
            console.warn('Note: No links found. The page might use window.location.href or have no URL defined.');
          }
        }
      } else if (result.exists === false) {
        setError(`No existing page found for slug "${slug}"`);
      } else {
        setError(result.error || "Failed to extract data");
      }
    } catch (err) {
      setError("Failed to extract data from existing page");
    } finally {
      setExtracting(false);
    }
  };

  const createPage = async () => {
    const slug = newSlug.trim().toLowerCase();
    if (!slug) return;

    setCreating(true);
    setError(null);

    // If we have extracted data, use it
    let pageData: any = {
      slug,
      title: newTitle.trim() || null,
      is_active: true,
    };

    if (extractedData) {
      pageData = {
        ...pageData,
        title: extractedData.title || newTitle.trim() || null,
        subtitle: extractedData.subtitle || null,
        avatar_url: extractedData.avatar_url || null,
        exclusive_preview_image: extractedData.exclusive_preview_image || null,
      };
    }

    const { data: pageResult, error: pageError } = await supabase
      .from("pages")
      .insert([pageData])
      .select("id")
      .single();

    if (pageError) {
      setError(pageError.message);
      setCreating(false);
      return;
    }

    // If we have extracted links, add them
    if (extractedData && extractedData.links && extractedData.links.length > 0) {
      const linksToInsert = extractedData.links.map((link: any) => ({
        page_id: pageResult.id,
        label: link.label,
        url: link.url,
        sort_order: link.sort_order || 0,
        is_active: true,
      }));

      const { error: linkError } = await supabase
        .from("page_links")
        .insert(linksToInsert);

      if (linkError) {
        console.error("Error inserting links:", linkError);
        // Don't fail the whole operation, just log it
      }
    }

    setNewSlug("");
    setNewTitle("");
    setExtractedData(null);
    await fetchPages();
    setCreating(false);
  };

  const quickMigrate = (slug: string) => {
    setNewSlug(slug);
    setNewTitle(slug.charAt(0).toUpperCase() + slug.slice(1));
  };

  const fetchLinksForPage = async (pageId: number) => {
    if (pageLinks[pageId]) return; // Already loaded
    
    setLoadingLinks(prev => ({ ...prev, [pageId]: true }));
    const { data, error } = await supabase
      .from("page_links")
      .select("*")
      .eq("page_id", pageId)
      .order("sort_order", { ascending: true });

    if (!error && data) {
      setPageLinks(prev => ({ ...prev, [pageId]: data as LinkRow[] }));
    }
    setLoadingLinks(prev => ({ ...prev, [pageId]: false }));
  };

  const toggleExpandPage = (pageId: number) => {
    if (expandedPageId === pageId) {
      setExpandedPageId(null);
    } else {
      setExpandedPageId(pageId);
      fetchLinksForPage(pageId);
    }
  };

  const deleteLink = async (linkId: number, pageId: number) => {
    if (!confirm("Delete this link?")) return;
    
    const { error } = await supabase.from("page_links").delete().eq("id", linkId);
    if (error) {
      setError(error.message);
    } else {
      // Refresh links for this page
      await fetchLinksForPage(pageId);
    }
  };

  const reExtractPage = async (page: PageRow) => {
    if (!confirm(`Re-extract data from folder for "${page.slug}"? This will:\n- Delete all existing links\n- Update page data from folder\n- Add extracted links.\n\nContinue?`)) {
      return;
    }

    setReExtractingPageId(page.id);
    setError(null);

    try {
      // 1. Extract data from folder
      const response = await fetch(`/api/extract-page-data?slug=${page.slug}`);
      const result = await response.json();

      if (!result.success || !result.exists) {
        setError(result.error || "Failed to extract data from folder.");
        setReExtractingPageId(null);
        return;
      }

      const extracted = result.data;

      // 2. Delete all existing links
      const { error: deleteError } = await supabase
        .from("page_links")
        .delete()
        .eq("page_id", page.id);

      if (deleteError) {
        setError(`Failed to delete existing links: ${deleteError.message}`);
        setReExtractingPageId(null);
        return;
      }

      // 3. Update page with extracted data
      const pageUpdates: any = {};
      if (extracted.title) pageUpdates.title = extracted.title;
      if (extracted.subtitle) pageUpdates.subtitle = extracted.subtitle;
      if (extracted.avatar_url) pageUpdates.avatar_url = extracted.avatar_url;

      if (Object.keys(pageUpdates).length > 0) {
        const { error: updateError } = await supabase
          .from("pages")
          .update(pageUpdates)
          .eq("id", page.id);

        if (updateError) {
          setError(`Failed to update page: ${updateError.message}`);
          setReExtractingPageId(null);
          return;
        }
      }

      // 4. Add extracted links
      if (extracted.links && extracted.links.length > 0) {
        const linksToInsert = extracted.links.map((link: any) => ({
          page_id: page.id,
          label: link.label,
          url: link.url,
          sort_order: link.sort_order || 0,
          is_active: true,
        }));

        const { error: linksError } = await supabase
          .from("page_links")
          .insert(linksToInsert);

        if (linksError) {
          setError(`Failed to add links: ${linksError.message}`);
          setReExtractingPageId(null);
          return;
        }
      }

      // 5. Refresh everything
      await fetchPages();
      if (expandedPageId === page.id) {
        await fetchLinksForPage(page.id);
      }
      
      alert(`✅ Successfully re-extracted data for "${page.slug}"!\n\nFound:\n- Title: ${extracted.title || 'None'}\n- Bio: ${extracted.subtitle || 'None'}\n- Avatar: ${extracted.avatar_url ? 'Yes' : 'No'}\n- Links: ${extracted.links?.length || 0}`);

    } catch (err) {
      setError(`Failed to re-extract: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setReExtractingPageId(null);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pages</h1>
            <p className="text-gray-600">Create and edit your public pages + links</p>
          </div>
          <Link href="/deep-links">
            <Button variant="outline" className="border-gray-300">
              Back to dashboard
            </Button>
          </Link>
        </div>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle>Create a new page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {error ? (
              <div className="text-sm bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md">{error}</div>
            ) : null}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-sm text-gray-700">Slug</label>
                <div className="flex gap-2">
                  <Input 
                    value={newSlug} 
                    onChange={(e) => {
                      setNewSlug(e.target.value);
                      setExtractedData(null); // Clear extracted data when slug changes
                    }} 
                    placeholder="e.g. jen" 
                  />
                  <Button
                    type="button"
                    onClick={extractFromExisting}
                    variant="outline"
                    className="border-[#B19272] text-[#B19272] hover:bg-[#B19272] hover:text-white whitespace-nowrap"
                    disabled={!newSlug.trim() || extracting}
                    title="Extract data from existing page folder"
                  >
                    {extracting ? "..." : "Auto-fill"}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Type slug, click "Auto-fill" to extract from existing page
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-700">Title</label>
                <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Display name" />
              </div>
              <div className="flex items-end">
                <Button onClick={createPage} className="bg-[#B19272] hover:bg-[#9A7B5F] text-white w-full" disabled={creating}>
                  {creating ? "Creating..." : "Create"}
                </Button>
              </div>
            </div>
            
            {/* Show extracted data preview */}
            {extractedData && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-xs text-green-800 font-medium mb-2">✅ Data extracted from existing page:</p>
                <div className="text-xs text-green-700 space-y-1">
                  <div>• Title: <strong>{extractedData.title || "None"}</strong></div>
                  {extractedData.subtitle && <div>• Bio: <strong>{extractedData.subtitle}</strong></div>}
                  {extractedData.avatar_url && <div>• Avatar: <strong>Found</strong> ({extractedData.avatar_url.substring(0, 50)}...)</div>}
                  {extractedData.exclusive_preview_image && <div>• Preview Image: <strong>Found</strong></div>}
                  {extractedData.links && extractedData.links.length > 0 ? (
                    <div>• Links: <strong>{extractedData.links.length} found</strong> ({extractedData.links.map((l: any) => l.label).join(", ")})</div>
                  ) : (
                    <div>• Links: <strong className="text-orange-600">None found</strong> (you can add them after creation)</div>
                  )}
                </div>
                <p className="text-xs text-green-600 mt-2">Click "Create" to save. You can edit after creation.</p>
              </div>
            )}
            <p className="text-xs text-gray-500">
              After creating, open the page editor to add links.
            </p>
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-xs text-blue-800 font-medium mb-1">💡 Edit existing pages (like /jen, /sel):</p>
              <p className="text-xs text-blue-700 mb-2">
                Create a new page with the same slug (e.g., "jen"). It will automatically override the old hardcoded version. 
                Then click "Edit" to add your links!
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs text-blue-700 font-medium">Quick migrate:</span>
                {commonExistingSlugs
                  .filter(slug => !pages.some(p => p.slug === slug))
                  .slice(0, 8)
                  .map(slug => (
                    <button
                      key={slug}
                      onClick={() => quickMigrate(slug)}
                      className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded border border-blue-300 transition-colors"
                    >
                      {slug}
                    </button>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle>All pages</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-gray-600">Loading...</div>
            ) : (
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-gray-500 border-b">
                    <tr>
                      <th className="py-2 pr-3 w-8"></th>
                      <th className="py-2 pr-3">Slug</th>
                      <th className="py-2 pr-3">Title</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2 pr-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {pages.map((p) => {
                      const isExpanded = expandedPageId === p.id;
                      const links = pageLinks[p.id] || [];
                      const isLoadingLinks = loadingLinks[p.id];
                      
                      return (
                        <React.Fragment key={p.id}>
                          <tr className="text-gray-800 hover:bg-gray-50">
                            <td className="py-3 pr-3">
                              <button
                                onClick={() => toggleExpandPage(p.id)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </button>
                            </td>
                            <td className="py-3 pr-3 font-medium">{p.slug}</td>
                            <td className="py-3 pr-3">{p.title || "-"}</td>
                            <td className="py-3 pr-3">
                              {p.is_active ? (
                                <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                              ) : (
                                <Badge className="bg-gray-100 text-gray-700 border-gray-200">Inactive</Badge>
                              )}
                            </td>
                            <td className="py-3 pr-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => reExtractPage(p)}
                                  disabled={reExtractingPageId === p.id}
                                  className="border-blue-300 text-blue-700 hover:bg-blue-50 text-xs"
                                  title="Re-extract data from folder"
                                >
                                  {reExtractingPageId === p.id ? (
                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <RefreshCw className="h-3 w-3" />
                                  )}
                                </Button>
                                <Link href={`/admin/pages/${p.id}`}>
                                  <Button variant="outline" size="sm" className="border-gray-300">
                                    Edit
                                  </Button>
                                </Link>
                                <Link href={`/${p.slug}`} target="_blank">
                                  <Button variant="outline" size="sm" className="border-gray-300">
                                    Open
                                  </Button>
                                </Link>
                                <Link href={`/${p.slug}/analytics`} target="_blank">
                                  <Button variant="outline" size="sm" className="border-gray-300">
                                    Analytics
                                  </Button>
                                </Link>
                              </div>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr>
                              <td colSpan={5} className="py-4 px-4 bg-gray-50">
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold text-gray-700">Links ({links.length})</h4>
                                    {isLoadingLinks && <span className="text-xs text-gray-500">Loading...</span>}
                                  </div>
                                  {links.length === 0 ? (
                                    <div className="text-sm text-gray-500">No links yet.</div>
                                  ) : (
                                    <div className="space-y-2">
                                      {links.map((link) => (
                                        <div
                                          key={link.id}
                                          className="flex items-center justify-between p-2 bg-white rounded border border-gray-200"
                                        >
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm font-medium text-gray-800">{link.label}</span>
                                              {link.is_active ? (
                                                <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Active</Badge>
                                              ) : (
                                                <Badge className="bg-gray-100 text-gray-700 border-gray-200 text-xs">Inactive</Badge>
                                              )}
                                            </div>
                                            <div className="text-xs text-gray-500 truncate mt-1">{link.url}</div>
                                          </div>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => deleteLink(link.id, p.id)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
                                          >
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                    {pages.length === 0 ? (
                      <tr>
                        <td className="py-6 text-gray-500" colSpan={4}>
                          No pages yet.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


