import { useRef, useState } from "react";
import {
  AlertTriangle,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  Folder,
  FolderPlus,
  Home,
  Loader2,
  Share2,
  Upload,
  X,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import PartyPicker, { NO_PARTY, partyIds, useParties, type PartySelection } from "@/components/PartyPicker";
import { trpc } from "@/lib/trpc";
import { openFetchedUrl, uploadToNextcloud } from "@/lib/nextcloudUpload";
import { DOCUMENT_TYPE_LABELS, formatBytes, type DocumentType } from "@shared/documents";

const QUICK_FOLDERS = ["/Tenants", "/Owners", "/Properties", "/Vendors", "/Templates", "/E-Sign Originals"];

const inputCls =
  "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]";
const labelCls = "block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5";

function Modal({ title, subtitle, onClose, children }: { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="text-lg font-bold text-[#0A1628]">{title}</h2>
            {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="p-5 space-y-4">{children}</div>
      </div>
    </div>
  );
}

function TypeSelect({ value, onChange }: { value: DocumentType; onChange: (v: DocumentType) => void }) {
  return (
    <select className={inputCls} value={value} onChange={(e) => onChange(e.target.value as DocumentType)}>
      {Object.entries(DOCUMENT_TYPE_LABELS).map(([key, label]) => (
        <option key={key} value={key}>
          {label}
        </option>
      ))}
    </select>
  );
}

// ── Upload ────────────────────────────────────────────────────────────────────
function UploadModal({ currentPath, onClose, onDone }: { currentPath: string; onClose: () => void; onDone: (folder: string) => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const [party, setParty] = useState<PartySelection>(NO_PARTY);
  const [type, setType] = useState<DocumentType>("other");
  const [showInPortal, setShowInPortal] = useState(true);
  const [progress, setProgress] = useState<Record<number, number>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const resolveFolder = trpc.documents.resolveFolder.useMutation();
  const share = trpc.documents.share.useMutation();

  const hasParty = party.kind !== "none";
  const sharesToPortal = hasParty && showInPortal;

  async function handleUpload() {
    setError(null);
    if (!files.length) return setError("Choose at least one file.");
    if (hasParty && !party.id) return setError(`Select which ${party.kind} this is for.`);
    setBusy(true);
    try {
      const { folder } = await resolveFolder.mutateAsync({ folder: currentPath, ...partyIds(party) });
      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        const uploaded = await uploadToNextcloud(file, folder, file.name, (fraction) =>
          setProgress((p) => ({ ...p, [index]: fraction }))
        );
        if (sharesToPortal) {
          await share.mutateAsync({
            fileId: uploaded.fileId,
            path: uploaded.path,
            name: file.name,
            type,
            mimeType: uploaded.mimeType,
            size: uploaded.size,
            ...partyIds(party),
          });
        }
      }
      onDone(folder);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="Upload Files" subtitle={hasParty ? "Saved to their folder in Nextcloud" : `Saved to ${currentPath}`} onClose={busy ? () => {} : onClose}>
      <div
        onClick={() => !busy && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (!busy) setFiles(Array.from(e.dataTransfer.files));
        }}
        className="border-2 border-dashed border-gray-300 hover:border-[#C9A84C] rounded-lg p-6 text-center cursor-pointer bg-gray-50"
      >
        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">Click to choose files, or drag them here</p>
        <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
      </div>

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((f, i) => (
            <li key={i} className="text-sm">
              <div className="flex justify-between gap-2">
                <span className="truncate text-gray-800">{f.name}</span>
                <span className="text-gray-400 shrink-0">{formatBytes(f.size)}</span>
              </div>
              {busy && (
                <div className="h-1.5 bg-gray-100 rounded mt-1 overflow-hidden">
                  <div className="h-full bg-[#C9A84C] transition-all" style={{ width: `${Math.round((progress[i] ?? 0) * 100)}%` }} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <div>
        <label className={labelCls}>Who is it for?</label>
        <PartyPicker value={party} onChange={setParty} noneLabel={`No one — just save to ${currentPath}`} />
      </div>

      {hasParty && (
        <>
          <div>
            <label className={labelCls}>Document type</label>
            <TypeSelect value={type} onChange={setType} />
          </div>
          <label className="flex items-start gap-2 text-sm text-gray-700">
            <input type="checkbox" className="mt-0.5" checked={showInPortal} onChange={(e) => setShowInPortal(e.target.checked)} />
            <span>
              Show it in their portal
              {party.kind === "property" && <span className="text-gray-500"> (the property owner's portal)</span>}
            </span>
          </label>
        </>
      )}

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

      <div className="flex gap-3 pt-1">
        <button onClick={onClose} disabled={busy} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
          Cancel
        </button>
        <button onClick={handleUpload} disabled={busy || !files.length} className="flex-1 py-2.5 bg-[#0A1628] hover:bg-[#0A1628]/90 text-white rounded-lg text-sm font-bold disabled:opacity-50 inline-flex items-center justify-center gap-2">
          {busy && <Loader2 className="w-4 h-4 animate-spin" />}
          {busy ? "Uploading..." : `Upload ${files.length || ""} file${files.length === 1 ? "" : "s"}`}
        </button>
      </div>
    </Modal>
  );
}

// ── Share an existing file ────────────────────────────────────────────────────
function ShareModal({ item, onClose, onChanged }: { item: any; onClose: () => void; onChanged: () => void }) {
  const [party, setParty] = useState<PartySelection>({ kind: "tenant", id: "" });
  const [type, setType] = useState<DocumentType>("other");
  const [error, setError] = useState<string | null>(null);
  const { describe } = useParties();
  const share = trpc.documents.share.useMutation({ onSuccess: () => { onChanged(); onClose(); }, onError: (e) => setError(e.message) });
  const unshare = trpc.documents.unshare.useMutation({ onSuccess: () => { onChanged(); onClose(); }, onError: (e) => setError(e.message) });

  return (
    <Modal title="Share in a Portal" subtitle={item.name} onClose={onClose}>
      {item.shares.length > 0 && (
        <div>
          <label className={labelCls}>Currently visible to</label>
          <ul className="space-y-2">
            {item.shares.map((s: any) => (
              <li key={s.id} className="flex items-center justify-between gap-2 text-sm bg-gray-50 rounded-lg px-3 py-2">
                <span>
                  {describe(s)} <span className="text-gray-400">· {DOCUMENT_TYPE_LABELS[s.type as DocumentType]}</span>
                </span>
                <button onClick={() => unshare.mutate({ documentId: s.id })} disabled={unshare.isPending} className="text-red-600 hover:underline text-xs font-semibold">
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div>
        <label className={labelCls}>Share with</label>
        <PartyPicker value={party} onChange={setParty} noneLabel="— Choose —" />
      </div>
      <div>
        <label className={labelCls}>Document type</label>
        <TypeSelect value={type} onChange={setType} />
      </div>
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
      <button
        onClick={() => {
          setError(null);
          if (party.kind === "none" || !party.id) return setError("Choose who to share it with.");
          share.mutate({ fileId: item.fileId, path: item.path, name: item.name, type, mimeType: item.mimeType, size: item.size, ...partyIds(party) });
        }}
        disabled={share.isPending}
        className="w-full py-2.5 bg-[#0A1628] hover:bg-[#0A1628]/90 text-white rounded-lg text-sm font-bold disabled:opacity-50"
      >
        {share.isPending ? "Sharing..." : "Share"}
      </button>
    </Modal>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminDocuments() {
  const [path, setPath] = useState("/");
  const [showUpload, setShowUpload] = useState(false);
  const [shareItem, setShareItem] = useState<any | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const status = trpc.documents.status.useQuery();
  const browse = trpc.documents.browse.useQuery({ path }, { enabled: status.data?.configured === true, retry: false });
  const createFolder = trpc.documents.createFolder.useMutation({
    onSuccess: () => utils.documents.browse.invalidate(),
    onError: (e) => setActionError(e.message),
  });
  const downloadUrl = trpc.documents.getDownloadUrl.useMutation();
  const { describe } = useParties();

  const segments = path.split("/").filter(Boolean);
  const refresh = () => utils.documents.browse.invalidate();

  async function download(item: any) {
    setActionError(null);
    try {
      await openFetchedUrl(async () => (await downloadUrl.mutateAsync({ fileId: item.fileId })).url);
    } catch (err: any) {
      setActionError(err.message);
    }
  }

  if (status.data && !status.data.configured) {
    return (
      <AdminLayout>
        <div className="max-w-xl bg-amber-50 border border-amber-200 rounded-xl p-6 text-amber-900">
          <p className="font-bold mb-1">Nextcloud isn't connected</p>
          <p className="text-sm">Set NEXTCLOUD_URL, NEXTCLOUD_USER and NEXTCLOUD_APP_PASSWORD in Vercel, then redeploy.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav className="flex items-center flex-wrap gap-1 text-sm" aria-label="Folder path">
            <button onClick={() => setPath("/")} className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-200 text-gray-700">
              <Home size={14} /> Luxe Drive
            </button>
            {segments.map((seg, i) => (
              <span key={i} className="inline-flex items-center gap-1">
                <ChevronRight size={14} className="text-gray-400" />
                <button
                  onClick={() => setPath("/" + segments.slice(0, i + 1).join("/"))}
                  className={`px-2 py-1 rounded hover:bg-gray-200 ${i === segments.length - 1 ? "font-semibold text-[#0A1628]" : "text-gray-700"}`}
                >
                  {seg}
                </button>
              </span>
            ))}
          </nav>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                const name = window.prompt("New folder name");
                if (name?.trim()) createFolder.mutate({ parent: path, name: name.trim() });
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50"
            >
              <FolderPlus size={16} /> New Folder
            </button>
            <button onClick={() => setShowUpload(true)} className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#0A1628] text-white rounded-lg text-sm font-bold hover:bg-[#0A1628]/90">
              <Upload size={16} /> Upload
            </button>
            {browse.data?.webUrl && (
              <a href={browse.data.webUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50">
                <ExternalLink size={16} /> Open in Nextcloud
              </a>
            )}
          </div>
        </div>

        {/* Quick folders */}
        <div className="flex flex-wrap gap-2">
          {QUICK_FOLDERS.map((f) => (
            <button
              key={f}
              onClick={() => setPath(f)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border ${path === f ? "bg-[#C9A84C] border-[#C9A84C] text-[#0A1628] font-semibold" : "bg-white border-gray-300 text-gray-700 hover:border-[#C9A84C]"}`}
            >
              <Folder size={14} /> {f.slice(1)}
            </button>
          ))}
        </div>

        {actionError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start justify-between gap-2">
            <span>{actionError}</span>
            <button onClick={() => setActionError(null)} aria-label="Dismiss"><X size={16} /></button>
          </div>
        )}

        {/* Listing */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          {browse.isLoading || status.isLoading ? (
            <div className="p-10 text-center text-gray-400 text-sm inline-flex w-full justify-center items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading…
            </div>
          ) : browse.error ? (
            <div className="p-6 text-sm text-red-700 flex items-center gap-2">
              <AlertTriangle size={16} /> {browse.error.message}
            </div>
          ) : !browse.data?.items.length ? (
            <div className="p-10 text-center text-gray-500 text-sm">
              {path === "/" ? "Nothing here yet." : "This folder is empty (it will be created when you upload)."}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">In portal</th>
                  <th className="px-4 py-3 font-semibold">Size</th>
                  <th className="px-4 py-3 font-semibold">Modified</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {browse.data.items.map((item) => (
                  <tr key={item.path} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {item.isFolder ? (
                        <button onClick={() => setPath(item.path)} className="inline-flex items-center gap-2 font-medium text-[#0A1628] hover:underline">
                          <Folder size={18} className="text-[#C9A84C]" /> {item.name}
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-2 text-gray-800">
                          <FileText size={18} className="text-gray-400" /> {item.name}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {item.shares.length ? item.shares.map((s) => <div key={s.id}>{describe(s)}</div>) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{item.isFolder ? "—" : formatBytes(item.size)}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{item.modified ? new Date(item.modified).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3">
                      {!item.isFolder && (
                        <div className="flex justify-end gap-1">
                          <button onClick={() => download(item)} title="Download" className="p-2 rounded hover:bg-gray-200 text-gray-600">
                            <Download size={16} />
                          </button>
                          <button onClick={() => setShareItem(item)} title="Share in portal" className="p-2 rounded hover:bg-gray-200 text-gray-600">
                            <Share2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showUpload && (
        <UploadModal
          currentPath={path}
          onClose={() => setShowUpload(false)}
          onDone={(folder) => {
            setShowUpload(false);
            setPath(folder);
            refresh();
          }}
        />
      )}
      {shareItem && <ShareModal item={shareItem} onClose={() => setShareItem(null)} onChanged={refresh} />}
    </AdminLayout>
  );
}
