import { Combine, FileDown, Files, ScanText, RotateCw, Scissors } from "lucide-react";
import { Link } from "react-router-dom";

const tools = [
  {
    href: "/tools/merge",
    icon: Combine,
    title: "Merge PDFs",
    text: "Combine multiple files into one PDF.",
  },
  {
    href: "/tools/split",
    icon: Scissors,
    title: "Split PDF",
    text: "Extract a range or specific pages.",
  },
  {
    href: "/tools/compress",
    icon: FileDown,
    title: "Compress PDF",
    text: "Optimize and preview output before download.",
  },
  {
    href: "/tools/rotate",
    icon: RotateCw,
    title: "Rotate Pages",
    text: "Turn every page by 90, 180, or 270 degrees.",
  },
  {
    href: "/tools/ocr",
    icon: ScanText,
    title: "OCR PDF",
    text: "Extract text from scanned PDFs. Premium.",
  },
  {
    href: "/tools/batch",
    icon: Files,
    title: "Batch Workflows",
    text: "Process multiple PDFs in one run. Premium.",
  },
];

export function Dashboard() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">PDF tools</h1>
        <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
          Choose a tool, add PDFs, and export the result without leaving your browser.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            to={tool.href}
            className="group rounded-xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
          >
            <tool.icon className="mb-10 text-slate-800 dark:text-slate-100" size={24} />
            <h2 className="text-lg font-semibold">{tool.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {tool.text}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
