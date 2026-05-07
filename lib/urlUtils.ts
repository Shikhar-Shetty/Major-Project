/**
 * URL extraction and validation utilities
 */

export function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s'"<>]+/g;
  const matches = text.match(urlRegex) || [];
  // Deduplicate
  return Array.from(new Set(matches));
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
