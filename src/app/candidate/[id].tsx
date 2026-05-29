import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { MatchBadge } from '@/components/MatchBadge';
import { PartyTag } from '@/components/PartyTag';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IssueMeta } from '@/data/questions';
import { Fonts, matchColor, partyColor, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { generateSummary } from '@/services/ai';
import { getCandidate } from '@/services/elections';
import { scoreCandidate } from '@/services/matching';
import { isEstimated } from '@/services/stanceEstimation';
import { getVideos } from '@/services/youtube';
import { useAppStore } from '@/store/useAppStore';
import type { MatchResult, VideoRecommendation } from '@/types';

export default function CandidateScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const candidate = useMemo(() => (id ? getCandidate(id) : undefined), [id]);
  const profile = useAppStore((s) => s.profile);

  const match: MatchResult | null = useMemo(
    () => (candidate && profile ? scoreCandidate(profile, candidate) : null),
    [candidate, profile],
  );

  const [summary, setSummary] = useState<string | null>(null);
  const [videos, setVideos] = useState<VideoRecommendation[] | null>(null);

  useEffect(() => {
    if (!candidate) return;
    let active = true;
    generateSummary(candidate).then((s) => active && setSummary(s));
    getVideos(candidate).then((v) => active && setVideos(v));
    return () => {
      active = false;
    };
  }, [candidate]);

  if (!candidate) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>Candidate not found.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.headerRow}>
          {candidate.photoUrl ? (
            <Image source={{ uri: candidate.photoUrl }} style={styles.photo} contentFit="cover" />
          ) : (
            <View style={[styles.photo, styles.photoFallback, { backgroundColor: partyColor(candidate.party) }]}>
              <ThemedText style={{ color: '#fff', fontSize: 28, fontWeight: '800' }}>
                {candidate.name.charAt(0)}
              </ThemedText>
            </View>
          )}
          <View style={{ flex: 1, gap: 6 }}>
            <ThemedText style={[styles.name, { fontFamily: Fonts?.serif }]}>{candidate.name}</ThemedText>
            <PartyTag party={candidate.party} />
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {candidate.office}
            </ThemedText>
          </View>
          {match ? <MatchBadge score={match.score} size="lg" /> : null}
        </View>

        {isEstimated(candidate) ? (
          <View style={[styles.warn, { borderColor: theme.warning }]}>
            <ThemedText type="small" style={{ color: theme.warning }}>
              Positions below are estimated from this candidate&apos;s party, not a verified voting
              record. Confirm with official sources before deciding.
            </ThemedText>
          </View>
        ) : null}

        {/* AI summary */}
        <Card>
          <ThemedText type="smallBold" style={styles.cardTitle}>Overview</ThemedText>
          {summary === null ? (
            <ActivityIndicator color={theme.tint} style={{ alignSelf: 'flex-start' }} />
          ) : (
            <ThemedText style={{ lineHeight: 22 }}>{summary}</ThemedText>
          )}
        </Card>

        {/* Match breakdown */}
        {match && match.byIssue.length > 0 ? (
          <Card>
            <ThemedText type="smallBold" style={styles.cardTitle}>Where you align</ThemedText>
            <View style={{ gap: Spacing.three, marginTop: Spacing.one }}>
              {match.byIssue.map((row) => (
                <IssueRow key={row.issue} row={row} />
              ))}
            </View>
          </Card>
        ) : null}

        {/* Videos */}
        <Card>
          <ThemedText type="smallBold" style={styles.cardTitle}>Watch &amp; learn</ThemedText>
          {videos === null ? (
            <ActivityIndicator color={theme.tint} style={{ alignSelf: 'flex-start' }} />
          ) : (
            <View style={{ gap: Spacing.two }}>
              {videos.map((v) => (
                <Pressable
                  key={v.id}
                  onPress={() => WebBrowser.openBrowserAsync(v.url)}
                  style={[styles.videoRow, { borderColor: theme.border }]}
                >
                  {v.thumbnailUrl ? (
                    <Image source={{ uri: v.thumbnailUrl }} style={styles.thumb} contentFit="cover" />
                  ) : (
                    <View style={[styles.thumb, { backgroundColor: theme.backgroundElement, alignItems: 'center', justifyContent: 'center' }]}>
                      <ThemedText style={{ fontSize: 20 }}>▶</ThemedText>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <ThemedText type="smallBold" numberOfLines={2}>{v.title}</ThemedText>
                    <ThemedText type="small" style={{ color: theme.textSecondary }}>{v.channelTitle}</ThemedText>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </Card>

        {candidate.website ? (
          <Button
            title="Visit official website"
            variant="ghost"
            onPress={() => WebBrowser.openBrowserAsync(candidate.website!)}
          />
        ) : null}

        <Button
          title="💬  Ask about this candidate"
          onPress={() => router.push(`/chat?candidateId=${encodeURIComponent(candidate.id)}`)}
        />
      </ScrollView>
    </ThemedView>
  );
}

function IssueRow({ row }: { row: MatchResult['byIssue'][number] }) {
  const theme = useTheme();
  const meta = IssueMeta[row.issue];
  const color = matchColor(row.score);
  // Map -2..+2 to 0..1 for marker placement.
  const toPct = (v: number) => ((v + 2) / 4) * 100;
  return (
    <View style={{ gap: 6 }}>
      <View style={styles.issueHead}>
        <ThemedText type="smallBold">{meta.label}</ThemedText>
        <ThemedText type="smallBold" style={{ color }}>{row.score}%</ThemedText>
      </View>
      <View style={[styles.axis, { backgroundColor: theme.backgroundElement }]}>
        <View style={[styles.marker, { left: `${toPct(row.candidateValue)}%`, backgroundColor: color, borderColor: theme.background }]} />
        <View style={[styles.markerYou, { left: `${toPct(row.userValue)}%`, borderColor: theme.text }]} />
      </View>
      <View style={styles.poleRow}>
        <ThemedText style={styles.pole}>{meta.negPole}</ThemedText>
        <ThemedText style={styles.pole}>{meta.posPole}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: Spacing.three, gap: Spacing.three },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  photo: { width: 72, height: 72, borderRadius: Radius.pill },
  photoFallback: { alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 24, fontWeight: '700' },
  cardTitle: { textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.two, opacity: 0.7 },
  warn: { borderWidth: 1, borderRadius: Radius.sm, padding: Spacing.three },
  videoRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.sm,
    padding: Spacing.two,
  },
  thumb: { width: 96, height: 54, borderRadius: Radius.sm },
  issueHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  axis: { height: 10, borderRadius: Radius.pill, justifyContent: 'center' },
  marker: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    marginLeft: -8,
  },
  markerYou: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    backgroundColor: 'transparent',
    marginLeft: -7,
  },
  poleRow: { flexDirection: 'row', justifyContent: 'space-between' },
  pole: { fontSize: 10, opacity: 0.6, maxWidth: '45%' },
});
