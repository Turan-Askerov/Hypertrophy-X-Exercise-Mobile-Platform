export function parseResponseBody(text: string): unknown {
  // 1. text boşsa (trim sonrası) null döndür
  if (!text.trim()) {
    return null;
  }
  // 2. try { return JSON.parse(text) } catch { ham metni döndür }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}