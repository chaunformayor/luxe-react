import { Link, useParams } from "wouter";
import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";

const categoryColor: Record<string, string> = {
  "Market Update": "bg-blue-100 text-blue-800",
  "Property Management": "bg-yellow-100 text-yellow-800",
  "Neighborhood Guide": "bg-green-100 text-green-800",
  "Short-Term Rental": "bg-purple-100 text-purple-800",
  "Rehab & Renovation": "bg-orange-100 text-orange-800",
  "Tenant Management": "bg-red-100 text-red-800",
};

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
          <h1 className="text-4xl font-bold text-[var(--luxe-navy)] mb-4" style={{ fontFamily: "var(--font-heading)" }}>
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
      {/* Hero */}
      <section className="bg-[var(--luxe-navy)] text-white pt-[130px] pb-[70px]">
        {post.coverImageUrl && (
          <div className="absolute inset-0 pt-[72px] overflow-hidden pointer-events-none">
            <img
              src={post.coverImageUrl}
              alt=""
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--luxe-navy)]/60 to-[var(--luxe-navy)]" />
          </div>
        )}
        <div className="container mx-auto relative z-10">
          <p className="text-white/40 text-sm mb-6">
            <Link href="/"><span className="hover:text-[var(--luxe-gold)] cursor-pointer transition-colors">Home</span></Link>
            <span className="mx-2">/</span>
            <Link href="/blog"><span className="hover:text-[var(--luxe-gold)] cursor-pointer transition-colors">Blog</span></Link>
            <span className="mx-2">/</span>
            <span className="text-white/60">{post.title}</span>
          </p>
          {post.category && (
            <span className={`inline-block text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full mb-5 ${categoryColor[post.category] || "bg-gray-100 text-gray-700"}`}>
              {post.category}
            </span>
          )}
          <h1
            className="text-4xl md:text-5xl font-bold max-w-3xl leading-tight mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {post.title}
          </h1>
          <p className="text-white/50 text-sm">
            {formatDate(post.publishedAt ?? post.createdAt)}
          </p>
        </div>
      </section>

      {/* Body */}
      <article className="py-16 bg-white">
        <div className="container mx-auto max-w-3xl">
          {post.coverImageUrl && (
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="w-full rounded-xl mb-10 shadow-md object-cover max-h-[480px]"
            />
          )}
          {post.excerpt && (
            <p className="text-xl text-gray-500 leading-relaxed mb-10 pb-10 border-b border-gray-100 italic">
              {post.excerpt}
            </p>
          )}
          <div
            className="prose prose-lg max-w-none text-gray-700 leading-relaxed
              prose-headings:font-bold prose-headings:text-[var(--luxe-navy)]
              prose-a:text-[var(--luxe-gold)] prose-a:no-underline hover:prose-a:underline
              prose-strong:text-[var(--luxe-navy)]
              prose-ul:list-disc prose-ol:list-decimal"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />
        </div>
      </article>

      {/* Back link */}
      <div className="py-12 bg-[var(--luxe-light)] text-center">
        <Link href="/blog">
          <span className="inline-block px-8 py-3 border border-[var(--luxe-navy)] text-[var(--luxe-navy)] font-semibold text-sm uppercase tracking-wide rounded-sm cursor-pointer hover:bg-[var(--luxe-navy)] hover:text-white transition-colors">
            ← Back to Blog
          </span>
        </Link>
      </div>
    </Layout>
  );
}
