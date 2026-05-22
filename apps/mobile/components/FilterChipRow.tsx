import { ScrollView, Pressable, Text, StyleSheet } from "react-native";
import { colors } from "@/constants/theme";

type Chip<T extends string> = { value: T | null; label: string };

export function FilterChipRow<T extends string>({
  chips,
  selected,
  onSelect,
}: {
  chips: Chip<T>[];
  selected: T | null;
  onSelect: (value: T | null) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.content}
    >
      {chips.map((chip) => {
        const active = selected === chip.value;
        return (
          <Pressable
            key={chip.value ?? "__all__"}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onSelect(chip.value)}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {chip.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0, marginBottom: 8 },
  content: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignItems: "center",
    flexDirection: "row",
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 36,
    justifyContent: "center",
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  chipText: { fontSize: 13, color: colors.text, fontWeight: "500" },
  chipTextActive: { color: colors.primary, fontWeight: "700" },
});
