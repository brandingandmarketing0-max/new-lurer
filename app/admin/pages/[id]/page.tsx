"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { UploadButton } from "@/lib/uploadthing";
import { LivePreview } from "@/components/admin/live-preview";
import { Upload, X } from "lucide-react";

type PageRow = {
  id: number;
  slug: string;
  title: string | null;
  subtitle: string | null;
  avatar_url: string | null;
  exclusive_preview_image: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type LinkRow = {
  id: number;
  page_id: number;
  label: string;
  url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export default function AdminPageEditor() {
  return (
    <ProtectedRoute>
      <AdminPageEditorInner />
    </ProtectedRoute>
  );
}

function AdminPageEditorInner() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const pageId = Number(params.id);

  const [page, setPage] = useState<PageRow | null>(null);
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newOrder, setNewOrder] = useState(0);
  const [adding, setAdding] = useState(false);

  const activeLinksCount = useMemo(() => links.filter((l) => l.is_active).length, [links]);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);

    const { data: pageData, error: pageError } = await supabase
      .from("pages")
      .select("id, slug, title, subtitle, avatar_url, exclusive_preview_image, is_active, created_at, updated_at")
      .eq("id", pageId)
      .maybeSingle();

    if (pageError) {
      setError(pageError.message);
      setLoading(false);
      return;
    }

    if (!pageData) {
      setError("Page not found");
      setLoading(false);
      return;
    }

    const { data: linkData, error: linkError } = await supabase
      .from("page_links")
      .select("id, page_id, label, url, sort_order, is_active, created_at, updated_at")
      .eq("page_id", pageId)
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true });

    if (linkError) {
      setError(linkError.message);
      setPage(pageData as PageRow);
      setLinks([]);
      setLoading(false);
      return;
    }

    setPage(pageData as PageRow);
    setLinks((linkData as LinkRow[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!Number.isFinite(pageId) || pageId <= 0) {
      setError("Invalid page id");
      setLoading(false);
      return;
    }
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId]);

  const updatePage = async (patch: Partial<PageRow>) => {
    if (!page) return;
    setPage({ ...page, ...patch });
  };

  const savePage = async () => {
    if (!page) return;

    const slug = page.slug.trim().toLowerCase();
    if (!slug) {
      setError("Slug is required");
      return;
    }

    setSaving(true);
    setError(null);

    const { error } = await supabase
      .from("pages")
      .update({
        slug,
        title: page.title,
        subtitle: page.subtitle,
        avatar_url: page.avatar_url,
        is_active: page.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", page.id);

    if (error) {
      setError(error.message);
    } else {
      await fetchAll();
    }
    setSaving(false);
  };

  const addLink = async () => {
    if (!page) return;

    const label = newLabel.trim();
    const url = newUrl.trim();
    if (!label || !url) return;

    setAdding(true);
    setError(null);

    const { error } = await supabase.from("page_links").insert([
      {
        page_id: page.id,
        label,
        url,
        sort_order: Number.isFinite(newOrder) ? newOrder : 0,
        is_active: true,
      },
    ]);

    if (error) {
      setError(error.message);
    } else {
      setNewLabel("");
      setNewUrl("");
      setNewOrder(0);
      await fetchAll();
    }
    setAdding(false);
  };

  const updateLink = async (id: number, patch: Partial<LinkRow>) => {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  const saveLink = async (l: LinkRow) => {
    setError(null);
    const { error } = await supabase
      .from("page_links")
      .update({
        label: l.label,
        url: l.url,
        sort_order: l.sort_order,
        is_active: l.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", l.id);
    if (error) {
      setError(error.message);
    } else {
      // Refresh to ensure consistency
      await fetchAll();
    }
  };

  const deleteLink = async (id: number) => {
    setError(null);
    const { error } = await supabase.from("page_links").delete().eq("id", id);
    if (error) {
      setError(error.message);
    } else {
      await fetchAll();
    }
  };

  const [reExtracting, setReExtracting] = useState(false);

  const reExtractFromFolder = async () => {
    if (!page) return;
    
    if (!confirm(`Re-extract data from folder for "${page.slug}"? This will:\n- Delete all existing links\n- Update page data (title, subtitle, avatar, preview image)\n- Add extracted links from the folder.\n\nContinue?`)) {
      return;
    }

    setReExtracting(true);
    setError(null);

    try {
      // 1. Extract data from folder
      const response = await fetch(`/api/extract-page-data?slug=${page.slug}`);
      const result = await response.json();

      if (!result.success || !result.exists) {
        setError(result.error || "Failed to extract data from folder. Make sure the page folder exists.");
        setReExtracting(false);
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
        setReExtracting(false);
        return;
      }

      // 3. Update page with extracted data
      const pageUpdates: any = {};
      if (extracted.title) pageUpdates.title = extracted.title;
      if (extracted.subtitle) pageUpdates.subtitle = extracted.subtitle;
      if (extracted.avatar_url) pageUpdates.avatar_url = extracted.avatar_url;
      if (extracted.exclusive_preview_image) pageUpdates.exclusive_preview_image = extracted.exclusive_preview_image;

      if (Object.keys(pageUpdates).length > 0) {
        const { error: updateError } = await supabase
          .from("pages")
          .update(pageUpdates)
          .eq("id", page.id);

        if (updateError) {
          setError(`Failed to update page: ${updateError.message}`);
          setReExtracting(false);
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
          setReExtracting(false);
          return;
        }
      }

      // 5. Refresh everything
      await fetchAll();
      
      // Show success message
      alert(`✅ Successfully re-extracted data!\n\nFound:\n- Title: ${extracted.title || 'None'}\n- Bio: ${extracted.subtitle || 'None'}\n- Avatar: ${extracted.avatar_url ? 'Yes' : 'No'}\n- Preview Image: ${extracted.exclusive_preview_image ? 'Yes' : 'No'}\n- Links: ${extracted.links?.length || 0}`);

    } catch (err) {
      setError(`Failed to re-extract: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setReExtracting(false);
    }
  };

  const deletePage = async () => {
    if (!page) return;
    if (!confirm(`Delete page "${page.slug}"? This deletes links too.`)) return;
    setError(null);
    const { error } = await supabase.from("pages").delete().eq("id", page.id);
    if (error) {
      setError(error.message);
    } else {
      router.push("/admin/pages");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-5xl mx-auto text-gray-700">Loading...</div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-5xl mx-auto space-y-3">
          <div className="text-gray-900 font-semibold">Page not found</div>
          {error ? <div className="text-sm text-red-600">{error}</div> : null}
          <Link href="/admin/pages">
            <Button variant="outline" className="border-gray-300">
              Back
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Two column layout: Editor + Live Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Editor */}
          <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-gray-900">Edit page</h1>
              {page.is_active ? (
                <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
              ) : (
                <Badge className="bg-gray-100 text-gray-700 border-gray-200">Inactive</Badge>
              )}
            </div>
            <p className="text-gray-600">Slug: <span className="font-mono">{page.slug}</span> • Links: {activeLinksCount} active</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/pages">
              <Button variant="outline" className="border-gray-300">
                Back
              </Button>
            </Link>
            <Link href={`/${page.slug}`} target="_blank">
              <Button variant="outline" className="border-gray-300">
                Open
              </Button>
            </Link>
            <Button variant="destructive" onClick={deletePage}>
              Delete
            </Button>
          </div>
        </div>

        {error ? (
          <div className="text-sm bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md">{error}</div>
        ) : null}

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle>Page details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-700">Slug</label>
                <Input value={page.slug} onChange={(e) => updatePage({ slug: e.target.value })} />
                <p className="text-xs text-gray-500 mt-1">Must be unique. This is the public path: <span className="font-mono">/{page.slug}</span></p>
              </div>
              <div>
                <label className="text-sm text-gray-700">Title</label>
                <Input value={page.title || ""} onChange={(e) => updatePage({ title: e.target.value || null })} />
              </div>
              <div>
                <label className="text-sm text-gray-700">Subtitle</label>
                <Textarea value={page.subtitle || ""} onChange={(e) => updatePage({ subtitle: e.target.value || null })} />
              </div>
              <div>
                <label className="text-sm text-gray-700">Avatar</label>
                <div className="space-y-2">
                  {page.avatar_url ? (
                    <div className="relative">
                      <img
                        src={page.avatar_url}
                        alt="Avatar preview"
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => updatePage({ avatar_url: null })}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : null}
                  <div className="flex items-center gap-2">
                    <UploadButton
                      endpoint="imageUploader"
                      onClientUploadComplete={(res) => {
                        if (res && res[0]?.url) {
                          updatePage({ avatar_url: res[0].url });
                        }
                      }}
                      onUploadError={(error: Error) => {
                        setError(`Upload failed: ${error.message}`);
                      }}
                      className="ut-button:bg-[#B19272] ut-button:hover:bg-[#9A7B5F] ut-button:ut-readying:bg-[#9A7B5F]"
                    />
                    <Input
                      value={page.avatar_url || ""}
                      onChange={(e) => updatePage({ avatar_url: e.target.value || null })}
                      placeholder="Or paste image URL"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Upload image or paste URL.</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-700">Exclusive Preview Image</label>
                <div className="space-y-2">
                  {page.exclusive_preview_image ? (
                    <div className="relative">
                      <img
                        src={page.exclusive_preview_image}
                        alt="Exclusive preview"
                        className="w-full h-48 object-cover rounded-md border-2 border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => updatePage({ exclusive_preview_image: null })}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : null}
                  <div className="flex items-center gap-2">
                    <UploadButton
                      endpoint="imageUploader"
                      onClientUploadComplete={(res) => {
                        if (res && res[0]?.url) {
                          updatePage({ exclusive_preview_image: res[0].url });
                        }
                      }}
                      onUploadError={(error: Error) => {
                        setError(`Upload failed: ${error.message}`);
                      }}
                      className="ut-button:bg-[#B19272] ut-button:hover:bg-[#9A7B5F] ut-button:ut-readying:bg-[#9A7B5F]"
                    />
                    <Input
                      value={page.exclusive_preview_image || ""}
                      onChange={(e) => updatePage({ exclusive_preview_image: e.target.value || null })}
                      placeholder="Or paste image URL"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Banner image for exclusive content preview card.</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={page.is_active}
                  onChange={(e) => updatePage({ is_active: e.target.checked })}
                />
                Active
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Preview updates live • Click Save to persist</span>
                <Button onClick={savePage} className="bg-[#B19272] hover:bg-[#9A7B5F] text-white" disabled={saving}>
                  {saving ? "Saving..." : "Save page"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Links</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={reExtractFromFolder}
                disabled={reExtracting}
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
                title="Re-extract all data from the page folder (deletes existing links and updates page data)"
              >
                {reExtracting ? "Extracting..." : "🔄 Re-extract from folder"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-1">
                <label className="text-sm text-gray-700">Label</label>
                <Input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Subscribe" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-700">URL</label>
                <Input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://..." />
              </div>
              <div className="md:col-span-1">
                <label className="text-sm text-gray-700">Order</label>
                <Input
                  type="number"
                  value={newOrder}
                  onChange={(e) => setNewOrder(parseInt(e.target.value || "0", 10))}
                />
              </div>
              <div className="md:col-span-4">
                <Button onClick={addLink} className="bg-[#B19272] hover:bg-[#9A7B5F] text-white" disabled={adding}>
                  {adding ? "Adding..." : "Add link"}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {links.map((l) => {
                const isExclusiveContent = l.label.toLowerCase().includes('exclusive');
                return (
                  <div key={l.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {l.is_active ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-700 border-gray-200">Inactive</Badge>
                        )}
                        <span className="text-xs text-gray-500">ID {l.id}</span>
                        {isExclusiveContent && page.exclusive_preview_image && (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                            Preview Image Set
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Preview updates live</span>
                        <Button variant="outline" size="sm" className="border-gray-300" onClick={() => saveLink(l)}>
                          Save link
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => deleteLink(l.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>

                    {/* Show exclusive preview image if this is the Exclusive Content link */}
                    {isExclusiveContent && page.exclusive_preview_image && (
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                        <div className="flex items-start gap-3">
                          <img
                            src={page.exclusive_preview_image}
                            alt="Exclusive preview"
                            className="w-24 h-24 object-cover rounded-md border border-blue-300"
                          />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-blue-900 mb-1">Exclusive Content Preview Image</p>
                            <p className="text-xs text-blue-700 break-all">{page.exclusive_preview_image}</p>
                            <p className="text-xs text-blue-600 mt-1">This image appears in the exclusive content banner on the frontend.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                      <div className="md:col-span-2">
                        <label className="text-sm text-gray-700">Label</label>
                        <Input value={l.label} onChange={(e) => updateLink(l.id, { label: e.target.value })} />
                      </div>
                      <div className="md:col-span-3">
                        <label className="text-sm text-gray-700">URL</label>
                        <Input value={l.url} onChange={(e) => updateLink(l.id, { url: e.target.value })} />
                      </div>
                      <div className="md:col-span-1">
                        <label className="text-sm text-gray-700">Order</label>
                        <Input
                          type="number"
                          value={l.sort_order}
                          onChange={(e) => updateLink(l.id, { sort_order: parseInt(e.target.value || "0", 10) })}
                        />
                      </div>
                    </div>

                    <label className="text-sm text-gray-700 flex items-center gap-2">
                      <input type="checkbox" checked={l.is_active} onChange={(e) => updateLink(l.id, { is_active: e.target.checked })} />
                      Active
                    </label>
                  </div>
                );
              })}

              {links.length === 0 ? <div className="text-sm text-gray-500">No links yet.</div> : null}
            </div>
          </CardContent>
        </Card>
          </div>

          {/* Right: Live Preview */}
          <div className="lg:sticky lg:top-6 h-fit">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
                <p className="text-sm text-gray-600">Mobile view - updates as you edit</p>
              </CardHeader>
              <CardContent>
                {page ? (
                  <LivePreview
                    page={{
                      slug: page.slug,
                      title: page.title,
                      subtitle: page.subtitle,
                      avatar_url: page.avatar_url,
                      exclusive_preview_image: page.exclusive_preview_image,
                      is_active: page.is_active,
                    }}
                    links={links}
                  />
                ) : (
                  <div className="text-gray-500 text-center py-8">Loading preview...</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}


