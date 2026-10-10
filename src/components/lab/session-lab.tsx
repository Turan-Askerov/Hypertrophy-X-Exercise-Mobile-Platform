import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ApiError } from "@/api/api-error";
import { useAuth } from "@/auth/auth-provider";

export default function SessionLab() {
  const { state, signIn, signOut, retry } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSignIn() {
    setBusy(true);
    setError(null);
    try {
      await signIn(username, password);
      setPassword("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Beklenmeyen bir hata oluştu.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Oturum laboratuvarı</Text>
      <Text style={styles.small}>Durum: {state.status}</Text>

      {state.status === "loading" && <ActivityIndicator size="large" />}

      {state.status === "unreachable" && (
        <View>
          <Text style={styles.text}>❌ {state.message}</Text>
          <Pressable style={styles.button} onPress={retry}>
            <Text style={styles.buttonText}>Tekrar dene</Text>
          </Pressable>
        </View>
      )}

      {state.status === "signedIn" && (
        <View>
          <Text style={styles.text}>✅ Giriş yapıldı: {state.user.username}</Text>
          <Text style={styles.small}>
            Rol: {state.user.role} · Hedef: {state.user.goal}
          </Text>
          <Pressable style={styles.button} onPress={signOut}>
            <Text style={styles.buttonText}>Çıkış yap</Text>
          </Pressable>
        </View>
      )}

      {state.status === "signedOut" && (
        <View>
          <TextInput
            style={styles.input}
            placeholder="Kullanıcı adı"
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
            autoCorrect={false}
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="Şifre"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
          />
          {error !== null && <Text style={styles.error}>{error}</Text>}
          <Pressable
            style={[styles.button, busy && styles.buttonDisabled]}
            disabled={busy}
            onPress={handleSignIn}
          >
            <Text style={styles.buttonText}>{busy ? "Bekleyin..." : "Giriş yap"}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff", padding: 24, paddingTop: 64 },
  title: { fontSize: 22, fontWeight: "600", marginBottom: 8, color: "#111" },
  small: { color: "#6b7280", marginBottom: 16 },
  text: { fontSize: 18, marginBottom: 8, color: "#111" },
  input: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10, padding: 12, fontSize: 16, marginBottom: 12, color: "#111" },
  error: { color: "#dc2626", marginBottom: 12 },
  button: { backgroundColor: "#2563eb", padding: 14, borderRadius: 10, marginTop: 8 },
  buttonDisabled: { backgroundColor: "#9ca3af" },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "600" },
});