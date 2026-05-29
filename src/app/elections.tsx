import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { dataSource, getElections } from '@/services/elections';
import { useAppStore } from '@/store/useAppStore';
import { formatAddress, type Election } from '@/types';

function levelLabel(level?: Election['level']) {
  switch (level) {
    case 'federal':
      return 'Federal';
    case 'state':
      return 'State';
    case 'local':
      return 'Local';
    default:
      return 'Election';
  }
}

function formatDate(iso: string): string {
  // Keep dependency-free: parse YYYY-MM-DD safely.
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function ElectionsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const address = useAppStore((s) => s.address);
  const selectElection = useAppStore((s) => s.selectElection);
  const isComplete = useAppStore((s) => s.isComplete);

  const [elections, setElections] = useState<Election[] | null>(null);
  const source = dataSource();

  useEffect(() => {
    let active = true;
    getElections(address ?? undefined).then((e) => {
      if (active) setElections(e);
    });
    return () => {
      active = false;
    };
  }, [address]);

  function onSelect(election: Election) {
    selectElection(election);
    router.push(isComplete() ? '/ballot' : '/questionnaire');
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      {elections === null ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.tint} />
          <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.two }}>
            Looking up elections{address ? ` for ${address.city || formatAddress(address)}` : ''}…
          </ThemedText>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={elections}
          keyExtractor={(e) => e.id}
          ListHeaderComponent={
            <View style={{ gap: Spacing.two, marginBottom: Spacing.two }}>
              <ThemedText type="subtitle">Active elections</ThemedText>
              {address ? (
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {formatAddress(address)}
                </ThemedText>
              ) : null}
              {!source.live ? (
                <View style={[styles.banner, { backgroundColor: theme.backgroundElement }]}>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    {source.label}
                  </ThemedText>
                </View>
              ) : null}
            </View>
          }
          ItemSeparatorComponent={() => <View style={{ height: Spacing.two }} />}
          renderItem={({ item }) => (
            <Pressable onPress={() => onSelect(item)}>
              <Card>
                <View style={styles.rowBetween}>
                  <View style={[styles.levelTag, { borderColor: theme.tint }]}>
                    <ThemedText style={{ color: theme.tint, fontSize: 11, fontWeight: '700' }}>
                      {levelLabel(item.level).toUpperCase()}
                    </ThemedText>
                  </View>
                  <ThemedText style={{ color: theme.tint, fontSize: 22 }}>›</ThemedText>
                </View>
                <ThemedText style={styles.electionName}>{item.name}</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {formatDate(item.electionDay)}
                </ThemedText>
              </Card>
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <ThemedText style={{ textAlign: 'center' }}>
                No active elections found for this address right now.
              </ThemedText>
            </View>
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.four },
  list: { padding: Spacing.three },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  electionName: { fontSize: 19, fontWeight: '700', marginTop: Spacing.two },
  levelTag: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  banner: { padding: Spacing.two, borderRadius: Radius.sm },
});
