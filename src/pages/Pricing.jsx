import { Check, Crown, Loader2, Sparkles, Zap } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/Button";
import { useAuth } from "../hooks/useAuth";
import { apiRequest } from "../lib/api";
import { openRazorpayCheckout } from "../lib/razorpayCheckout";

const freeFeatures = [
  "100 PDF actions per month",
  "Merge, split, compress, rotate",
  "Google Drive import",
  "25 MB recommended file size",
  "Client-side processing",
];

const premiumFeatures = [
  "Unlimited PDF actions",
  "Full Google Drive sync",
  "OCR for scanned PDFs",
  "Batch workflows",
  "Priority processing limits",
];

const premiumPlans = [
  {
    id: "premium_monthly",
    price: "₹299",
    cadence: "/mo",
    note: "Flexible monthly billing",
  },
  {
    id: "premium_yearly",
    price: "₹2499",
    cadence: "/year",
    note: "Save ₹1089 annually",
  },
];

export function Pricing() {
  const auth = useAuth();
  const [authMode, setAuthMode] = useState("register");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [selectedPlan, setSelectedPlan] = useState("premium_monthly");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function ensureUser() {
    if (auth.user) return auth.user;

    if (authMode === "login") {
      return auth.login({
        email: form.email,
        password: form.password,
      });
    }

    return auth.register(form);
  }

  async function handleCheckout(planId = selectedPlan) {
    setBusy(true);
    setError("");

    try {
      const user = await ensureUser();
      const token = auth.token || localStorage.getItem("drivepdf_token");
      const orderData = await apiRequest("/billing/orders", {
        method: "POST",
        token,
        body: { planId },
      });

      await openRazorpayCheckout({
        keyId: orderData.keyId,
        order: orderData.order,
        user,
        onSuccess: async (response) => {
          const verified = await apiRequest("/billing/verify", {
            method: "POST",
            token,
            body: response,
          });
          auth.updateUser(verified.user);
        },
      });
    } catch (err) {
      setError(err.message || "Unable to start checkout.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Simple pricing
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          Start free. Upgrade when PDF work gets serious.
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
          DrivePDF stays fast and private for everyday use, with Premium for
          unlimited actions, full Drive sync, OCR, and batch processing.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-zinc-900">
              <Zap size={21} />
            </span>
            <div>
              <h2 className="text-xl font-semibold">Free</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Generous limits</p>
            </div>
          </div>
          <div className="mt-8">
            <span className="text-4xl font-semibold">₹0</span>
            <span className="text-slate-500"> forever</span>
          </div>
          <FeatureList features={freeFeatures} />
          <Button className="mt-8 w-full" variant="secondary" disabled>
            Current free tier
          </Button>
        </section>

        <section className="rounded-2xl border border-slate-950 bg-slate-950 p-6 text-white shadow-sm dark:border-white dark:bg-white dark:text-slate-950">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-white/10 dark:bg-slate-100">
                <Crown size={21} />
              </span>
              <div>
                <h2 className="text-xl font-semibold">Premium</h2>
                <p className="text-sm text-slate-300 dark:text-slate-600">
                  Unlimited with advanced workflows
                </p>
              </div>
            </div>
            {auth.isPremium && (
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200 dark:text-emerald-700">
                <Sparkles size={14} />
                Active
              </span>
            )}
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {premiumPlans.map((plan) => (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlan(plan.id)}
                className={`rounded-xl border p-4 text-left transition ${
                  selectedPlan === plan.id
                    ? "border-white bg-white text-slate-950 dark:border-slate-950 dark:bg-slate-950 dark:text-white"
                    : "border-white/20 bg-white/5 hover:bg-white/10 dark:border-slate-200 dark:bg-slate-50 dark:hover:bg-slate-100"
                }`}
              >
                <div>
                  <span className="text-3xl font-semibold">{plan.price}</span>
                  <span className="text-sm opacity-70">{plan.cadence}</span>
                </div>
                <p className="mt-2 text-sm opacity-75">{plan.note}</p>
              </button>
            ))}
          </div>

          <FeatureList
            features={premiumFeatures}
            className="text-slate-100 dark:text-slate-800"
            iconClassName="text-emerald-300 dark:text-emerald-600"
          />

          {!auth.user && (
            <AuthPanel
              authMode={authMode}
              setAuthMode={setAuthMode}
              form={form}
              setForm={setForm}
            />
          )}

          {auth.user && (
            <p className="mt-6 text-sm text-slate-300 dark:text-slate-600">
              Signed in as {auth.user.email}
            </p>
          )}

          {error && <p className="mt-4 text-sm text-rose-300 dark:text-rose-600">{error}</p>}

          <Button
            className="mt-6 w-full bg-white text-slate-950 hover:bg-slate-200 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-800"
            disabled={busy || auth.isPremium}
            onClick={() => handleCheckout()}
          >
            {busy && <Loader2 className="animate-spin" size={16} />}
            {auth.isPremium ? "Premium active" : "Upgrade with Razorpay"}
          </Button>
        </section>
      </div>
    </main>
  );
}

function FeatureList({ features, className = "text-slate-700 dark:text-slate-300", iconClassName }) {
  return (
    <ul className={`mt-8 space-y-3 text-sm ${className}`}>
      {features.map((feature) => (
        <li key={feature} className="flex items-center gap-3">
          <Check className={iconClassName || "text-emerald-600"} size={17} />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  );
}

function AuthPanel({ authMode, setAuthMode, form, setForm }) {
  return (
    <div className="mt-6 rounded-xl border border-white/15 bg-white/5 p-4 dark:border-slate-200 dark:bg-slate-50">
      <div className="mb-4 grid grid-cols-2 gap-2">
        {["register", "login"].map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setAuthMode(mode)}
            className={`h-9 rounded-lg text-sm font-medium capitalize transition ${
              authMode === mode
                ? "bg-white text-slate-950 dark:bg-slate-950 dark:text-white"
                : "text-slate-300 hover:bg-white/10 dark:text-slate-600 dark:hover:bg-slate-100"
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {authMode === "register" && (
        <AuthInput
          label="Name"
          value={form.name}
          onChange={(value) => setForm((current) => ({ ...current, name: value }))}
        />
      )}
      <AuthInput
        label="Email"
        type="email"
        value={form.email}
        onChange={(value) => setForm((current) => ({ ...current, email: value }))}
      />
      <AuthInput
        label="Password"
        type="password"
        value={form.password}
        onChange={(value) => setForm((current) => ({ ...current, password: value }))}
      />
    </div>
  );
}

function AuthInput({ label, value, onChange, type = "text" }) {
  return (
    <label className="mt-3 block text-sm font-medium">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-lg border border-white/15 bg-white px-3 text-sm text-slate-950 outline-none focus:border-white dark:border-slate-200 dark:bg-white dark:focus:border-slate-950"
      />
    </label>
  );
}
