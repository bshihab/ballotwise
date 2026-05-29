import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { matchColor, Radius } from '@/constants/theme';

export function MatchBadge({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const color = matchColor(score);
  const dim = size === 'lg' ? 64 : size === 'sm' ? 40 : 52;
  const fontSize = size === 'lg' ? 20 : size === 'sm' ? 13 : 16;

  return (
    <View
      style={[
        styles.badge,
        { width: dim, height: dim, borderRadius: Radius.pill, borderColor: color, backgroundColor: `${color}1A` },
      ]}
    >
      <ThemedText style={{ color, fontWeight: '800', fontSize }}>{score}</ThemedText>
      {size !== 'sm' && (
        <ThemedText style={{ color, fontWeight: '700', fontSize: 9, marginTop: -2 }}>MATCH</ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
});
