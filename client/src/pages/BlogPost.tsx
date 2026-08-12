import { Link, useParams } from "wouter";
import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import "@/styles/blog.css";

function formatDate(d: string | Date | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading } = trpc.blog.getPost.useQuery(slug ?? "");

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[var(--luxe-gold)] border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)", color: "#0D1B2A" }}>
            Post Not Found
          </h1>
          <p className="text-gray-500 mb-8">This article doesn't exist or has been unpublished.</p>
          <Link href="/blog">
            <span className="px-6 py-3 bg-[var(--luxe-gold)] text-[var(--luxe-navy)] font-semibold text-sm uppercase tracking-wide rounded-sm cursor-pointer hover:bg-[#A88830] transition-colors">
              Back to Blog
            </span>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* ── Article Section ── */}
      <section style={{ paddingTop: "152px", paddingBottom: "80px" }}>
        <div className="container mx-auto">
          <div style={{ maxWidth: "780px", margin: "0 auto" }}>

            {/* Breadcrumb */}
            <div style={{ marginBottom: "32px", fontSize: "13.6px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <Link href="/">
                <span style={{ color: "#C9A84C", cursor: "pointer" }} className="hover:underline">Home</span>
              </Link>
              <span style={{ color: "#9CA3AF" }}>/</span>
              <Link href="/blog">
                <span style={{ color: "#C9A84C", cursor: "pointer" }} className="hover:underline">Blog</span>
              </Link>
              <span style={{ color: "#9CA3AF" }}>/</span>
              <span style={{ color: "#9CA3AF" }}>{post.title.length > 40 ? post.title.slice(0, 40) + "…" : post.title}</span>
            </div>

            {/* Meta row */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
              {post.category && (
                <span style={{
                  background: "rgba(201,168,76,0.12)",
                  color: "#C9A84C",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  padding: "4px 12px",
                  borderRadius: "20px",
                }}>
                  {post.category}
                </span>
              )}
              <span style={{ fontSize: "0.85rem", color: "#9CA3AF" }}>
                {formatDate(post.publishedAt ?? post.createdAt)}
              </span>
              <span style={{ fontSize: "0.85rem", color: "#9CA3AF" }}>· By the Luxe Team</span>
            </div>

            {/* H1 */}
            <h1 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "2.2rem",
              fontWeight: 700,
              lineHeight: 1.25,
              color: "#0D1B2A",
              marginBottom: "24px",
            }}>
              {post.title}
            </h1>

            {/* Gold line */}
            <div style={{ width: "60px", height: "3px", background: "#C9A84C", marginBottom: "32px" }} />

            {/* Cover image */}
            {post.coverImageUrl && (
              <img
                src={post.coverImageUrl}
                alt={post.title}
                style={{ width: "100%", borderRadius: "12px", marginBottom: "32px", display: "block" }}
              />
            )}

            {/* Excerpt (shown as italic lead paragraph if present) */}
            {post.excerpt && (
              <p style={{ fontSize: "1.05rem", fontStyle: "italic", color: "#0D1B2A", lineHeight: 1.7, marginBottom: "28px" }}>
                {post.excerpt}
              </p>
            )}

            {/* Body */}
            <div
              className="blog-body"
              dangerouslySetInnerHTML={{ __html: post.body }}
            />

          </div>
        </div>
      </section>

      {/* ── More from Blog ── */}
      <section style={{ background: "#FAF9F6", padding: "56px 0" }}>
        <div className="container mx-auto" style={{ maxWidth: "780px" }}>
          <Link href="/blog">
            <span
              className="inline-flex items-center gap-2 font-semibold text-sm uppercase tracking-wide cursor-pointer transition-colors hover:text-[#C9A84C]"
              style={{ color: "#0D1B2A" }}
            >
              ← Back to Blog
            </span>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
