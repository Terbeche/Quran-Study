export function normalizeTag(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replaceAll(/\s+/g, ' ') // Replace multiple spaces with single space
    .replaceAll(/[^\w\s-]/g, '') // Remove special characters except hyphen
    .slice(0, 50); // Max 50 characters
}

export function isValidTag(tag: string): boolean {
  const normalized = normalizeTag(tag);
  return normalized.length >= 2 && normalized.length <= 50;
}
