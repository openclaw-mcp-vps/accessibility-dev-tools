import { promises as fs } from "node:fs";
import path from "node:path";

import { NextRequest, NextResponse } from "next/server";

import { ACCESS_COOKIE_NAME, getEmailFromAccessToken } from "@/lib/auth";
import { extensionCatalog, getProtectedDownloadPath } from "@/lib/downloads";

export const runtime = "nodejs";

function contentTypeFor(fileName: string): string {
  const extension = path.extname(fileName).toLowerCase();

  if (extension === ".json") {
    return "application/json; charset=utf-8";
  }

  if (extension === ".xml") {
    return "application/xml; charset=utf-8";
  }

  if (extension === ".sh") {
    return "text/x-shellscript; charset=utf-8";
  }

  return "application/octet-stream";
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  const email = await getEmailFromAccessToken(token);

  if (!email) {
    return NextResponse.json(
      { error: "Purchase required. Unlock access with your checkout email first." },
      { status: 401 }
    );
  }

  const fileName = request.nextUrl.searchParams.get("file");

  if (!fileName) {
    return NextResponse.json({
      email,
      downloads: extensionCatalog.map((extension) => ({
        id: extension.id,
        name: extension.name,
        editor: extension.editor,
        summary: extension.summary,
        includes: extension.includes,
        installSteps: extension.installSteps,
        packageSize: extension.packageSize,
        downloadUrl: `/api/downloads?file=${encodeURIComponent(extension.downloadFile)}`
      }))
    });
  }

  const safePath = getProtectedDownloadPath(fileName);
  if (!safePath) {
    return NextResponse.json({ error: "Unknown file requested." }, { status: 404 });
  }

  const fileContents = await fs.readFile(safePath);

  return new NextResponse(fileContents, {
    status: 200,
    headers: {
      "Content-Type": contentTypeFor(fileName),
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "private, no-store"
    }
  });
}
