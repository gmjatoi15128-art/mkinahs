const configuredBackend = String(import.meta.env.VITE_MANUS_BACKEND_URL || "").trim().replace(/\/$/, "");
const isVercelHost = typeof window !== "undefined" && window.location.hostname.endsWith(".vercel.app");
const defaultManusBackend = "https://mkinstitut-k6f3dinp.manus.space";

export const backendOrigin = configuredBackend || (isVercelHost ? defaultManusBackend : "");

export function backendUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${backendOrigin}${path.startsWith("/") ? path : `/${path}`}`;
}
