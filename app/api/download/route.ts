import fs from "node:fs/promises";
import path from "node:path";
import { NextRequest } from "next/server";
import { ACCESS_COOKIE_NAME, getSigningSecret, readAccessCookieValue } from "@/lib/lemonsqueezy";

export const runtime = "nodejs";

const downloadableTargets: Record<
  string,
  { filePath: string; contentType: string; fileName: string }
> = {
  vscode: {
    filePath: path.join(process.cwd(), "extensions", "vscode-accessibility", "extension.js"),
    contentType: "text/javascript; charset=utf-8",
    fileName: "accessibility-vscode-extension.js",
  },
  "audio-navigator": {
    filePath: path.join(process.cwd(), "desktop-tools", "audio-navigator", "main.py"),
    contentType: "text/x-python; charset=utf-8",
    fileName: "audio-navigator-main.py",
  },
};

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  const session = readAccessCookieValue(cookie, getSigningSecret());

  if (!session) {
    return new Response("Subscription required", { status: 403 });
  }

  const target = request.nextUrl.searchParams.get("target") || "";
  const selected = downloadableTargets[target];

  if (!selected) {
    return new Response("Unknown download target", { status: 400 });
  }

  const content = await fs.readFile(selected.filePath, "utf-8");

  return new Response(content, {
    status: 200,
    headers: {
      "content-type": selected.contentType,
      "content-disposition": `attachment; filename=\"${selected.fileName}\"`,
      "cache-control": "no-store",
    },
  });
}
