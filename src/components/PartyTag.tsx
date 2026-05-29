import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { partyColor, Radius } from '@/constants/theme';

export function PartyTag({ party }: { party?: string | null }) {
  const color = partyColor(party);
  const label = party && party.trim().length ? party : 'Independent';
  return (
    <View style={[styles.tag, { borderColor: color, backgroundColor: `${color}1A` }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <ThemedText style={{ color, fontWeight: '700', fontSize: 12 }}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignSelf: 'flex-start',
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
