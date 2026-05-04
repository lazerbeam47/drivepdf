import {
  ArrowRight,
  Combine,
  FileDown,
  Gauge,
  Lock,
  RotateCw,
  Scissors,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";

const features = [
  {
    icon: Lock,
    title: "Private by default",
    text: "Merge, split, compress, and rotate PDFs locally in the browser.",
  },
  {
    icon: Gauge,
    title: "Built for speed",
    text: "Small interactions, direct downloads, and no upload queue.",
  },
  {
    icon: ShieldCheck,
    title: "Simple controls",
    text: "Clean tool screens with only the settings needed for the job.",
  },
];

const tools = [
  { icon: Combine, title: "Merge PDFs" },
  { icon: Scissors, title: "Split pages" },
  { icon: FileDown, title: "Compress files" },
  { icon: RotateCw, title: "Rotate pages" },
];

export function Landing() {
  return (
    <main>
      <section className="border-b border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:py-24">
          <div className="flex flex-col justify-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Privacy-first PDF tools
            </p>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-6xl">
              DrivePDF
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              A fast online PDF toolkit for everyday document work. Edit files in
              your browser, keep the flow focused, and download the result
              immediately.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link to="/tools">
                  Open tools
                  <ArrowRight size={18} />
                </Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link to="/tools/compress">Try compression</Link>
              </Button>
            </div>
          </div>

          <div className="grid content-end gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
              <div className="grid grid-cols-2 gap-3">
                {tools.map((tool) => (
                  <div
                    key={tool.title}
                    className="rounded-lg border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <tool.icon className="mb-8 text-slate-800 dark:text-slate-100" size={24} />
                    <p className="text-sm font-medium">{tool.title}</p>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Client-side PDF editing powered by pdf-lib.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-xl border border-slate-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <feature.icon className="mb-8 text-slate-900 dark:text-slate-100" size={24} />
              <h2 className="text-lg font-semibold">{feature.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {feature.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Free to start, Premium when you scale</h2>
            <p className="mt-2 max-w-xl text-slate-600 dark:text-slate-300">
              Core PDF tools include generous free limits. Premium unlocks
              unlimited usage, full Drive sync, OCR, and batch workflows.
            </p>
          </div>
          <Button variant="secondary" asChild>
            <Link to="/pricing">See pricing</Link>
          </Button>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <p>DrivePDF</p>
        <p>Fast PDF tools. Browser-first. Minimal by design.</p>
      </footer>
    </main>
  );
}
