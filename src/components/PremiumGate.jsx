import { Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "./Button";

export function PremiumGate({ children, title = "Premium feature" }) {
  const auth = useAuth();

  if (auth.isPremium) return children;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-zinc-900">
        <Crown size={22} />
      </div>
      <h2 className="mt-5 text-2xl font-semibold">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">
        Upgrade to Premium for unlimited usage, full Drive sync, OCR, and batch workflows.
      </p>
      <Button className="mt-6" asChild>
        <Link to="/pricing">Upgrade to Premium</Link>
      </Button>
    </div>
  );
}
