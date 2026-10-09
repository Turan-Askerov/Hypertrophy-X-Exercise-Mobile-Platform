export type QueryValue = string | number | boolean | undefined;

export function buildUrl(
  baseUrl: string,
  path: string,
  query?: Record<string, QueryValue>
): string {
        // 1. path "/" ile başlamıyorsa başına "/" ekle
        if (!path.startsWith("/")) {
        path = "/" + path;
        }

        // 2. const params = new URLSearchParams();
        const params = new URLSearchParams();
        //    query içindeki her [anahtar, değer] çifti için, değer undefined DEĞİLSE
        for (const [key, value] of Object.entries(query ?? {})) {
            if (value !== undefined) {
                params.append(key, String(value));
            }
        }

        // 3. const queryString = params.toString();
        const queryString = params.toString();
        // 4. Eğer queryString boş değilse, path + "?" + queryString, aksi halde path
        const fullPath = queryString ? `${path}?${queryString}` : path;
        // 5. return baseUrl + fullPath
        return baseUrl + fullPath;
}