"use client";

import { useState, useMemo } from "react";

interface AssetPreviewProps {
  title: string;
  description: string;
  embedCode: string;
  previewCode?: string;
  previewHeight?: number;
  disclosureLabel?: "Ad" | "Sponsored";
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return hash;
}

export default function AssetPreview({
  title,
  description,
  embedCode,
  previewCode,
  previewHeight = 320,
  disclosureLabel = "Ad",
}: AssetPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const displayCode = previewCode || embedCode;

  const srcdoc = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f4f4f5}</style></head>
<body>${displayCode}</body>
</html>`;

  const iframeKey = useMemo(() => hashString(srcdoc), [srcdoc]);

  return (
    <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
          <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
            {disclosureLabel}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCode((v) => !v)}
            className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
          >
            {showCode ? "Preview" : "View Code"}
          </button>
          <button
            onClick={handleCopy}
            className="rounded-md border border-zinc-300 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-700"
          >
            {copied ? "Copied" : "Copy Code"}
          </button>
        </div>
      </div>

      <p className="border-b border-zinc-100 px-5 py-2 text-xs text-zinc-500">
        {description}
      </p>

      {showCode ? (
        <div className="max-h-80 overflow-auto bg-zinc-950 p-4">
          <pre className="text-xs leading-relaxed text-zinc-300 whitespace-pre-wrap break-all">
            {embedCode}
          </pre>
        </div>
      ) : (
        <div className="bg-zinc-100 p-4">
          <iframe
            key={iframeKey}
            srcDoc={srcdoc}
            sandbox="allow-scripts"
            style={{ width: "100%", height: previewHeight, border: "none", borderRadius: 6, background: "#f4f4f5" }}
            title={title}
          />
        </div>
      )}
    </div>
  );
}
