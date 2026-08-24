import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { KeyRound, ShieldCheck } from "lucide-react";
import { useState } from "react";

export default function CmsAccess() {
  const { data: setup, isLoading } = trpc.auth.setupStatus.useQuery();
  const login = trpc.auth.login.useMutation();
  const setupAdmin = trpc.auth.setup.useMutation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [setupToken, setSetupToken] = useState("");
  const [error, setError] = useState("");
  const requiresSetup = setup?.requiresSetup === true;
  const busy = login.isPending || setupAdmin.isPending;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      if (requiresSetup) await setupAdmin.mutateAsync({ name, email, password, setupToken });
      else await login.mutateAsync({ email, password });
      window.location.assign("/admin");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to sign in. Please try again.");
    }
  };

  if (isLoading) return <div className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-600">Loading CMS access…</div>;
  return <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[1.1fr_.9fr]"><section className="hidden bg-navy p-12 text-white lg:flex lg:flex-col lg:justify-between"><div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-gold-300 text-navy"><ShieldCheck /></div><div><p className="font-bold">MK Institute</p><p className="text-sm text-slate-300">Content Management System</p></div></div><div><p className="eyebrow text-teal-200">Secure administration</p><h1 className="academic-display mt-4 max-w-lg text-5xl">Manage institutional information with confidence.</h1><p className="mt-6 max-w-md text-slate-300">This private workspace uses its own CMS credentials. It is independent of Manus and Google sign-in.</p></div><p className="text-sm text-slate-400">Role-based access · Secure session cookies · Published-content controls</p></section><section className="grid place-items-center p-6 sm:p-10"><form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9"><div className="grid h-11 w-11 place-items-center rounded-xl bg-teal-50 text-teal-700"><KeyRound className="h-5 w-5" /></div><p className="eyebrow mt-5">CMS access</p><h2 className="mt-2 text-2xl font-bold text-navy">{requiresSetup ? "Create the first Super Admin" : "Sign in to the CMS"}</h2><p className="mt-3 text-sm leading-6 text-slate-600">{requiresSetup ? "Enter the private bootstrap token, then choose the CMS owner credentials. This setup is available only until the first account is created." : "Use the CMS email address and password assigned to you."}</p>{requiresSetup ? <><div className="mt-6 grid gap-2"><Label htmlFor="cms-token">Bootstrap token</Label><Input id="cms-token" type="password" value={setupToken} onChange={event => setSetupToken(event.target.value)} required autoComplete="off" /></div><div className="mt-5 grid gap-2"><Label htmlFor="cms-name">Full name</Label><Input id="cms-name" value={name} onChange={event => setName(event.target.value)} required minLength={2} autoComplete="name" /></div></> : null}<div className="mt-6 grid gap-2"><Label htmlFor="cms-email">Email address</Label><Input id="cms-email" type="email" value={email} onChange={event => setEmail(event.target.value)} required autoComplete="email" /></div><div className="mt-5 grid gap-2"><Label htmlFor="cms-password">Password</Label><Input id="cms-password" type="password" value={password} onChange={event => setPassword(event.target.value)} required minLength={12} autoComplete={requiresSetup ? "new-password" : "current-password"} /><p className="text-xs text-slate-500">Use at least 12 characters.</p></div>{error ? <p role="alert" className="mt-5 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}<Button type="submit" className="mt-7 w-full" disabled={busy}>{busy ? "Please wait…" : requiresSetup ? "Create Super Admin account" : "Sign in securely"}</Button><a href="/" className="mt-5 block text-center text-sm font-semibold text-teal-700 hover:text-teal-800">Return to public website</a></form></section></main>;
}
