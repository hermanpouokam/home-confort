import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join, extname } from "path";

// Next.js 16 (standalone) indexe le dossier /public une seule fois au démarrage
// du serveur : les fichiers écrits sur disque après coup (comme nos uploads)
// renvoient un 404 via l'URL statique /uploads/xxx, même s'ils existent bien
// sur le disque. Cette route contourne le problème en lisant le fichier
// directement à chaque requête, ce qui fonctionne quel que soit le moment
// où le fichier a été créé.

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".ogg": "video/ogg",
  ".mov": "video/quicktime",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  // Sécurité : empêche toute tentative de path traversal (../, /)
  if (!filename || filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return new NextResponse("Bad request", { status: 400 });
  }

  const ext = extname(filename).toLowerCase();
  const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

  try {
    const filePath = join(process.cwd(), "public", "uploads", filename);
    const data = await readFile(filePath);

    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
