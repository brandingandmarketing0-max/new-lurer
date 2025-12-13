import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { PublicPage } from "@/components/pages/public-page";

export const dynamic = "force-dynamic";

export default async function SlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createSupabaseServerClient();

  const { data: page } = await supabase
    .from("pages")
    .select("id, slug, title, subtitle, avatar_url, exclusive_preview_image, is_active")
    .eq("slug", slug)
    .maybeSingle();

  if (!page) {
    notFound();
  }

  const { data: links } = await supabase
    .from("page_links")
    .select("id, page_id, label, url, sort_order, is_active")
    .eq("page_id", page.id)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  return <PublicPage page={page} links={links || []} />;
}


