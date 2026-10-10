import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type StepperProps = {
  label: string;
  value: number;
  onChange: (next: number) => void;
  step?: number;
  min?: number;
};

function Stepper({ label, value, onChange, step = 1, min = 0 }: StepperProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.controls}>
        <Pressable style={styles.button} onPress={() => onChange(Math.max(min, value - step))}>
          <Text style={styles.buttonText}>−</Text>
        </Pressable>
        <Text style={styles.value}>{value}</Text>
        <Pressable style={styles.button} onPress={() => onChange(value + step)}>
          <Text style={styles.buttonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

type SetEntry = { weight: number; reps: number };

export default function SetCounter() {
  const [weight, setWeight] = useState(60);
  const [reps, setReps] = useState(8);
  const [sets, setSets] = useState<SetEntry[]>([]);

  const volume = sets.reduce((sum, s) => sum + s.weight * s.reps, 0);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Set sayacı</Text>

      <Stepper label="Ağırlık (kg)" value={weight} onChange={setWeight} step={2.5} />
      <Stepper label="Tekrar" value={reps} onChange={setReps} />

      <Pressable
        style={styles.addButton}
        onPress={() => setSets([...sets, { weight, reps }])}
      >
        <Text style={styles.addText}>Seti ekle</Text>
      </Pressable>

      {sets.map((s, i) => (
        <Text key={i} style={styles.setLine}>
          {i + 1}. set: {s.weight} kg × {s.reps}
        </Text>
      ))}

      <Text style={styles.volume}>Toplam hacim: {volume} kg</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff", padding: 24, paddingTop: 64 },
  title: { fontSize: 22, fontWeight: "600", marginBottom: 24, color: "#111" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  label: { fontSize: 18, color: "#111" },
  controls: { flexDirection: "row", alignItems: "center", gap: 16 },
  button: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#e5e7eb", alignItems: "center", justifyContent: "center" },
  buttonText: { fontSize: 24, color: "#111" },
  value: { fontSize: 22, fontWeight: "600", minWidth: 64, textAlign: "center", color: "#111" },
  addButton: { backgroundColor: "#2563eb", padding: 14, borderRadius: 10, marginVertical: 16 },
  addText: { color: "#fff", textAlign: "center", fontWeight: "600" },
  setLine: { fontSize: 16, marginBottom: 6, color: "#111" },
  volume: { fontSize: 18, fontWeight: "600", marginTop: 16, color: "#111" },
});