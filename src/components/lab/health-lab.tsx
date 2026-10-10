import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ApiError } from "@/api/api-error";
import { api } from "@/api/client";

type Status =
  | { phase: "loading" }
  | { phase: "ok"; data: unknown }
  | { phase: "error"; message: string };

export default function HealthLab() {
  const [status, setStatus] = useState<Status>({ phase: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus({ phase: "loading" });

    api
      .call<unknown>("/api/health", { auth: false })
      .then((data) => {
        if (!cancelled) setStatus({ phase: "ok", data });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setStatus({
            phase: "error",
            message: err instanceof ApiError ? err.message : String(err),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Sunucu durumu</Text>

      {status.phase === "loading" && <Text style={styles.text}>Kontrol ediliyor...</Text>}
      {status.phase === "ok" && (
        <Text style={styles.text}>✅ Bağlantı var: {JSON.stringify(status.data)}</Text>
      )}
      {status.phase === "error" && <Text style={styles.text}>❌ {status.message}</Text>}

      <Pressable style={styles.button} onPress={() => setAttempt(attempt + 1)}>
        <Text style={styles.buttonText}>Tekrar dene</Text>
      </Pressable>
      <Text style={styles.small}>Deneme sayısı: {attempt}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff", padding: 24, paddingTop: 64 },
  title: { fontSize: 22, fontWeight: "600", marginBottom: 24, color: "#111" },
  text: { fontSize: 18, marginBottom: 24, color: "#111" },
  button: { backgroundColor: "#2563eb", padding: 14, borderRadius: 10, marginBottom: 12 },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "600" },
  small: { color: "#6b7280" },
});