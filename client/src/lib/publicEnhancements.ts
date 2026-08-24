export type DownloadFilterRecord = { category?: string | null };

export function hasApprovedContactAction(phone?: string | null, whatsapp?: string | null) {
  return Boolean(phone?.trim() || whatsapp?.trim());
}

export function shouldShowAdmissionsBanner(value: Record<string, unknown>) {
  const enabled = value.enabled === true || value.enabled === "true";
  const title = typeof value.title === "string" ? value.title.trim() : "";
  const message = typeof value.message === "string" ? value.message.trim() : "";
  return enabled && Boolean(title && message);
}

export function filterDownloadsByCategory<T extends DownloadFilterRecord>(downloads: T[], category: string) {
  return category === "all" ? downloads : downloads.filter(document => document.category === category);
}
