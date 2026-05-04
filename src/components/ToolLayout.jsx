import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export function ToolLayout({ title, description, children }) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        to="/tools"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
      >
        <ArrowLeft size={16} />
        Tools
      </Link>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">{description}</p>
      </div>
      {children}
    </main>
  );
}
