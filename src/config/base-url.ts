export function normalizeBaseUrl(raw: string | undefined): string {
  const value = (raw ?? "").trim();
  if (value === "") {
    throw new Error(
      "EXPO_PUBLIC_API_URL tanımlı değil. .env dosyasına örneğin EXPO_PUBLIC_API_URL=http://192.168.1.89:8000 yaz."
    );
  }

    if (!(value.startsWith("http://") || value.startsWith("https://"))) {
      throw new Error(
        "EXPO_PUBLIC_API_URL, http:// veya https:// ile başlamalıdır."
      );
    }
    return value.replace(/\/+$/, "");
}