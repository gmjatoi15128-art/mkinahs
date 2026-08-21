export type SettingsRow = { key: string; value: unknown };

export function settingMap(settings?: SettingsRow[]) {
  return Object.fromEntries((settings ?? []).map(setting => [setting.key, setting.value]));
}

export function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
}

export function asObjectArray(value: unknown) {
  return Array.isArray(value) ? value.filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === "object" && !Array.isArray(entry)) : [];
}

export function dateLabel(value?: Date | string | null) {
  if (!value) return "Date to be announced";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date to be announced" : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
