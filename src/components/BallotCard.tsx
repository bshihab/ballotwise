import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { MatchBadge } from '@/components/MatchBadge';
import { PartyTag } from '@/components/PartyTag';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Candidate } from '@/types';

/**
 * A single candidate row styled like a line on an optical-scan paper ballot:
 * a fillable oval on the left, the candidate's name in serif, party + office
 * below, and the alignment match on the right.
 */
export function BallotCard({
  candidate,
  score,
  selected,
  estimated,
  onPress,
  onSelect,
}: {
  candidate: Candidate;
  score?: number;
  selected?: boolean;
  estimated?: boolean;
  onPress?: () => void;
  onSelect?: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: selected ? theme.backgroundSelected : theme.card,
          borderColor: selected ? theme.tint : theme.border,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      {/* Fillable oval bubble — tap to mark this candidate on your ballot */}
      <Pressable
        onPress={onSelect}
        hitSlop={10}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: !!selected }}
        style={[styles.bubble, { borderColor: theme.text }]}
      >
        {selected && <View style={[styles.bubbleFill, { backgroundColor: theme.text }]} />}
      </Pressable>

      {candidate.photoUrl ? (
        <Image source={{ uri: candidate.photoUrl }} style={styles.avatar} contentFit="cover" />
      ) : null}

      <View style={styles.body}>
        <ThemedText style={[styles.name, { fontFamily: Fonts?.serif }]} numberOfLines={1}>
          {candidate.name}
        </ThemedText>
        <View style={styles.metaRow}>
          <PartyTag party={candidate.party} />
        </View>
        {estimated ? (
          <ThemedText type="small" style={{ color: theme.warning, marginTop: 2 }}>
            Match estimated from party
          </ThemedText>
        ) : null}
      </View>

      {typeof score === 'number' ? <MatchBadge score={score} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1.5,
  },
  bubble: {
    width: 22,
    height: 30,
    borderRadius: Radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleFill: {
    width: 12,
    height: 20,
    borderRadius: Radius.pill,
  },
  avatar: { width: 44, height: 44, borderRadius: Radius.pill },
  body: { flex: 1, gap: 4 },
  name: { fontSize: 19, fontWeight: '700' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
});
