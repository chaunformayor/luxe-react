import { useState, useRef } from "react";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { PlusCircle, Edit2, Trash2, Eye, EyeOff, ArrowLeft, Upload, X, Image } from "lucide-react";

const CATEGORIES = [
  "Market Update",
  "Property Management",
  "Neighborhood Guide",
  "Short-Term Rental",
  "Rehab & Renovation",
  "Tenant Management",
];

type FormData = {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImageUrl: string;
  category: string;
  status: "draft" | "published";
};

const BLANK: FormData = {
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  coverImageUrl: "",
  category: CATEGORIES[0],
  status: "draft",
};

function toSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function resizeImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX_W = 1200;
      const MAX_H = 675;
      let { width, height } = img;
      const ratio = Math.min(MAX_W / width, MAX_H / height, 1);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.78);
      const sizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);
      if (sizeKb > 60) {
        reject(new Error(`Image too large after compression (${sizeKb} KB). Please use a smaller photo or paste an external URL.`));
      } else {
        resolve(dataUrl);
      }
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
}

export default function AdminBlog() {
  const [view, setView] = useState<"list" | "form">("list");
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(BLANK);
  const [imgError, setImgError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  const { data: posts = [], isLoading } = trpc.admin.getBlogPosts.useQuery();

  const createMutation = trpc.admin.createBlogPost.useMutation({
    onSuccess: () => { utils.admin.getBlogPosts.invalidate(); backToList(); },
  });
  const updateMutation = trpc.admin.updateBlogPost.useMutation({
    onSuccess: () => { utils.admin.getBlogPosts.invalidate(); backToList(); },
  });
  const deleteMutation = trpc.admin.deleteBlogPost.useMutation({
    onSuccess: () => { utils.admin.getBlogPosts.invalidate(); setDeleteConfirm(null); },
  });

  const backToList = () => { setView("list"); setEditId(null); setForm(BLANK); setImgError(null); };

  const openNew = () => { setForm(BLANK); setEditId(null); setImgError(null); setView("form"); };

  const openEdit = (post: any) => {
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? "",
      body: post.body,
      coverImageUrl: post.coverImageUrl ?? "",
      category: post.category ?? CATEGORIES[0],
      status: post.status ?? "draft",
    });
    setEditId(post.id);
    setImgError(null);
    setView("form");
  };

  const set = (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const val = e.target.value;
      setForm(prev => {
        const next = { ...prev, [field]: val };
        if (field === "title" && !editId) {
          next.slug = toSlug(val);
        }
        return next;
      });
    };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgError(null);
    setUploading(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      setForm(prev => ({ ...prev, coverImageUrl: dataUrl }));
    } catch (err: any) {
      setImgError(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = (status: "draft" | "published") => {
    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      excerpt: form.excerpt.trim() || undefined,
      body: form.body.trim(),
      coverImageUrl: form.coverImageUrl.trim() || undefined,
      category: form.category || undefined,
      status,
    };
    if (editId) {
      updateMutation.mutate({ id: editId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const saveError = createMutation.error?.message || updateMutation.error?.message;

  const inputCls = "w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500";
  const labelCls = "block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1";

  return (
    <AdminLayout>
      {view === "list" ? (
        <div className="p-6 max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
              <p className="text-sm text-gray-500 mt-0.5">{posts.length} post{posts.length !== 1 ? "s" : ""}</p>
            </div>
            <button
              onClick={openNew}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white font-semibold text-sm rounded-md hover:bg-yellow-600 transition-colors"
            >
              <PlusCircle size={16} /> New Post
            </button>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="text-center py-16 text-gray-400">Loading...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-xl">
              <Image className="mx-auto mb-3 text-gray-300" size={40} />
              <p className="text-gray-500 font-medium">No blog posts yet</p>
              <p className="text-gray-400 text-sm mt-1">Click "New Post" to write your first article.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Title</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 hidden md:table-cell">Category</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 hidden lg:table-cell">Date</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {posts.map((post: any) => (
                    <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 line-clamp-1">{post.title}</div>
                        {post.excerpt && (
                          <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{post.excerpt}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs text-gray-500">{post.category ?? "—"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          post.status === "published"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}>
                          {post.status === "published" ? <Eye size={10} /> : <EyeOff size={10} />}
                          {post.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-400">
                        {post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          : new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => openEdit(post)}
                            className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          {deleteConfirm === post.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => deleteMutation.mutate(post.id)}
                                className="px-2 py-0.5 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                disabled={deleteMutation.isPending}
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(post.id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* ── Editor Form ── */
        <div className="p-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button onClick={backToList} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-xl font-bold text-gray-900">{editId ? "Edit Post" : "New Post"}</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main column */}
            <div className="lg:col-span-2 space-y-5">
              {/* Title */}
              <div>
                <label className={labelCls}>Title *</label>
                <input
                  className={inputCls}
                  value={form.title}
                  onChange={set("title")}
                  placeholder="Enter post title..."
                />
              </div>

              {/* Slug */}
              <div>
                <label className={labelCls}>URL Slug *</label>
                <input
                  className={inputCls}
                  value={form.slug}
                  onChange={set("slug")}
                  placeholder="url-friendly-slug"
                />
                <p className="text-xs text-gray-400 mt-1">URL: /blog/{form.slug || "..."}</p>
              </div>

              {/* Excerpt */}
              <div>
                <label className={labelCls}>Excerpt</label>
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={3}
                  value={form.excerpt}
                  onChange={set("excerpt")}
                  placeholder="Short description shown on the blog list page..."
                />
              </div>

              {/* Body */}
              <div>
                <label className={labelCls}>Content / Body *</label>
                <textarea
                  className={`${inputCls} resize-y font-mono text-xs leading-relaxed`}
                  rows={18}
                  value={form.body}
                  onChange={set("body")}
                  placeholder="Write your blog post here. You can use plain text or HTML..."
                />
                <p className="text-xs text-gray-400 mt-1">Tip: You can use basic HTML tags like &lt;p&gt;, &lt;b&gt;, &lt;ul&gt;, &lt;img src="..."&gt;</p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Cover Image */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <label className={labelCls}>Cover Image</label>

                {/* Preview */}
                {form.coverImageUrl ? (
                  <div className="relative mb-3">
                    <img
                      src={form.coverImageUrl}
                      alt="Cover preview"
                      className="w-full h-36 object-cover rounded-lg border border-gray-100"
                      onError={() => setImgError("Could not load image from that URL.")}
                    />
                    <button
                      onClick={() => { setForm(prev => ({ ...prev, coverImageUrl: "" })); setImgError(null); }}
                      className="absolute top-1.5 right-1.5 p-1 bg-white rounded-full shadow text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-28 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center mb-3 text-gray-300">
                    <Image size={28} />
                    <span className="text-xs mt-1">No image</span>
                  </div>
                )}

                {/* Upload button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 mb-2"
                >
                  <Upload size={14} />
                  {uploading ? "Processing..." : "Upload Photo"}
                </button>

                {/* URL input */}
                <div>
                  <p className="text-xs text-gray-400 mb-1">Or paste an image URL:</p>
                  <input
                    className={`${inputCls} text-xs`}
                    value={form.coverImageUrl.startsWith("data:") ? "" : form.coverImageUrl}
                    onChange={(e) => { setImgError(null); setForm(prev => ({ ...prev, coverImageUrl: e.target.value })); }}
                    placeholder="https://..."
                  />
                </div>

                {imgError && (
                  <p className="text-xs text-red-500 mt-2">{imgError}</p>
                )}
              </div>

              {/* Category */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <label className={labelCls}>Category</label>
                <select className={inputCls} value={form.category} onChange={set("category")}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Status & Actions */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                <label className={labelCls}>Status</label>
                <div className="flex gap-2">
                  {(["draft", "published"] as const).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, status: s }))}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-md border transition-colors capitalize ${
                        form.status === s
                          ? "bg-yellow-500 border-yellow-500 text-white"
                          : "bg-white border-gray-200 text-gray-500 hover:border-yellow-400"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {saveError && (
                  <p className="text-xs text-red-500">{saveError}</p>
                )}

                <button
                  onClick={() => handleSave("draft")}
                  disabled={isSaving || !form.title || !form.body}
                  className="w-full py-2 text-sm font-semibold border border-gray-200 text-gray-600 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-40"
                >
                  {isSaving ? "Saving..." : "Save as Draft"}
                </button>
                <button
                  onClick={() => handleSave("published")}
                  disabled={isSaving || !form.title || !form.body}
                  className="w-full py-2 text-sm font-semibold bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors disabled:opacity-40"
                >
                  {isSaving ? "Publishing..." : "Publish Post"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
