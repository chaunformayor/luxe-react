// Uploads go browser → site → Nextcloud in chunks because Vercel caps request bodies at 4.5 MB.
const CHUNK_SIZE = 3.5 * 1024 * 1024;

export type UploadedFile = { path: string; fileId: string; size: number; mimeType: string };

async function readJson(res: Response) {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Upload failed (HTTP ${res.status})`);
  return body;
}

export async function uploadToNextcloud(
  file: Blob,
  folder: string,
  fileName: string,
  onProgress?: (fraction: number) => void
): Promise<UploadedFile> {
  if (file.size === 0) throw new Error(`${fileName} is empty.`);
  const { uploadId } = await readJson(await fetch("/api/docs/upload/start", { method: "POST", credentials: "include" }));
  try {
    const total = Math.ceil(file.size / CHUNK_SIZE);
    for (let i = 0; i < total; i++) {
      await readJson(
        await fetch(`/api/docs/upload/${uploadId}/${i}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/octet-stream" },
          body: file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE),
        })
      );
      onProgress?.((i + 1) / total);
    }
    return await readJson(
      await fetch(`/api/docs/upload/${uploadId}/finish`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder, fileName }),
      })
    );
  } catch (err) {
    fetch(`/api/docs/upload/${uploadId}/abort`, { method: "POST", credentials: "include" }).catch(() => {});
    throw err;
  }
}

/** Admin download link for any file in the Luxe drive (streamed through this site). */
export function adminFileUrl(fileId: string, name: string) {
  return `/api/docs/file/${fileId}?name=${encodeURIComponent(name)}`;
}
