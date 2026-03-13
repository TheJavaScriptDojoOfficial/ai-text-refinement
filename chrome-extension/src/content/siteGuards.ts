// Placeholder for site-specific guards (e.g., skip certain domains or URL patterns).

export function isSiteSupported(url: string): boolean {
  // For now, support all sites.
  return Boolean(url);
}

