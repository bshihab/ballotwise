import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { BallotCard } from '@/components/BallotCard';
import { Button } from '@/components/Button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { cacheCandidates, dataSource, getBallot } from '@/services/elections';
import { rankCandidates } from '@/services/matching';
import { isEstimated } from '@/services/stanceEstimation';
import { useAppStore } from '@/store/useAppStore';
import type { Contest } from '@/types';

export default function BallotScreen() {
  const theme = useTheme();
  const router = useRouter();

  const address = useAppStore((s) => s.address);
  const election = useAppStore((s) => s.selectedElection);
  const profile = useAppStore((s) => s.profile);
  const selections = useAppStore((s) => s.selections);
  const setSelection = useAppStore((s) => s.setSelection);

  const [contests, setContests] = useState<Contest[] | null>(null);
  const source = dataSource();

  useEffect(() => {
    if (!election) return;
    let active = true;
    getBallot(election.id, address ?? undefined).then((c) => {
      if (!active) return;
      cacheCandidates(c);
      setContests(c);
    });
    return () => {
      active = false;
    };
  }, [election, address]);

  // Rank candidates within each contest by alignment with the user's profile.
  const ranked = useMemo(() => {
    if (!contests || !profile) return null;
    return contests.map((contest) => ({
      contest,
      results: rankCandidates(profile, contest.candidates),
    }));
  }, [contests, profile]);

  if (!election) {
    return (
      <Empty
        title="Pick an election first"
        action={<Button title="Choose election" onPress={() => router.replace('/elections')} />}
      />
    );
  }

  if (!profile) {
    return (
      <Empty
        title="Answer a few questions to see your matches"
        action={<Button title="Start questionnaire" onPress={() => router.replace('/questionnaire')} />}
      />
    );
  }

  if (!ranked) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.tint} />
        <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.two }}>
          Building your ballot…
        </ThemedText>
      </View>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Ballot header, styled like the top of a paper ballot */}
        <View style={[styles.ballotHead, { borderColor: theme.text }]}>
          <ThemedText style={styles.ballotTitle}>OFFICIAL SAMPLE BALLOT</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: 'center' }}>
            {election.name}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: 'center' }}>
            Ranked by how well each candidate matches your answers
          </ThemedText>
        </View>

        {!source.live ? (
          <View style={[styles.banner, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {source.label}
            </ThemedText>
          </View>
        ) : null}

        {ranked.map(({ contest, results }) => {
          const topId = results[0]?.candidateId;
          const chosen = selections[contest.id] ?? topId;
          return (
            <View key={contest.id} style={styles.contest}>
              <View style={[styles.contestHeader, { backgroundColor: theme.text }]}>
                <ThemedText style={[styles.contestOffice, { color: theme.background }]}>
                  {contest.office}
                </ThemedText>
                {contest.district ? (
                  <ThemedText style={{ color: theme.background, fontSize: 12, opacity: 0.8 }}>
                    {contest.district} · Vote for {contest.numberElected ?? 1}
                  </ThemedText>
                ) : null}
              </View>

              <View style={styles.candidates}>
                {results.map((r, i) => {
                  const cand = contest.candidates.find((c) => c.id === r.candidateId)!;
                  return (
                    <BallotCard
                      key={cand.id}
                      candidate={cand}
                      score={r.score}
                      selected={chosen === cand.id}
                      estimated={isEstimated(cand)}
                      onSelect={() => setSelection(contest.id, cand.id)}
                      onPress={() => router.push(`/candidate/${encodeURIComponent(cand.id)}`)}
                    />
                  );
                })}
              </View>
            </View>
          );
        })}

        <View style={{ gap: Spacing.two, marginTop: Spacing.two }}>
          <Button
            title="Retake questionnaire"
            variant="secondary"
            onPress={() => router.push('/questionnaire')}
          />
          <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: 'center' }}>
            Fill a bubble to mark your choice. Tap a name to learn more or ask the assistant.
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function Empty({ title, action }: { title: string; action: React.ReactNode }) {
  return (
    <ThemedView style={styles.center}>
      <ThemedText style={{ textAlign: 'center', marginBottom: Spacing.three }}>{title}</ThemedText>
      {action}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.four },
  content: { padding: Spacing.three, gap: Spacing.four },
  ballotHead: {
    borderWidth: 2,
    borderRadius: Radius.sm,
    padding: Spacing.three,
    gap: 4,
    alignItems: 'center',
  },
  ballotTitle: { fontSize: 18, fontWeight: '800', letterSpacing: 1 },
  banner: { padding: Spacing.two, borderRadius: Radius.sm },
  contest: { gap: Spacing.two },
  contestHeader: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.sm,
  },
  contestOffice: { fontSize: 16, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  candidates: { gap: Spacing.two },
});
