import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { ProgressBar } from '@/components/ProgressBar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IssueMeta, QUESTIONS } from '@/data/questions';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAppStore } from '@/store/useAppStore';
import type { AnswerValue } from '@/types';

const OPTIONS: { value: AnswerValue; label: string }[] = [
  { value: 2, label: 'Strongly agree' },
  { value: 1, label: 'Agree' },
  { value: 0, label: 'Neutral' },
  { value: -1, label: 'Disagree' },
  { value: -2, label: 'Strongly disagree' },
];

export default function QuestionnaireScreen() {
  const theme = useTheme();
  const router = useRouter();
  const answers = useAppStore((s) => s.answers);
  const setAnswer = useAppStore((s) => s.setAnswer);
  const finalizeProfile = useAppStore((s) => s.finalizeProfile);

  const [index, setIndex] = useState(() => {
    const firstUnanswered = QUESTIONS.findIndex((q) => answers[q.id] === undefined);
    return firstUnanswered === -1 ? 0 : firstUnanswered;
  });

  const question = QUESTIONS[index];
  const issue = IssueMeta[question.issue];
  const current = answers[question.id];
  const isLast = index === QUESTIONS.length - 1;

  function choose(value: AnswerValue) {
    setAnswer(question.id, value);
    // Small delay-free auto-advance for snappier feel.
    if (!isLast) {
      setIndex((i) => Math.min(i + 1, QUESTIONS.length - 1));
    }
  }

  function finish() {
    finalizeProfile();
    router.replace('/ballot');
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <View style={styles.header}>
          <ProgressBar value={(index + 1) / QUESTIONS.length} />
          <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.two }}>
            Question {index + 1} of {QUESTIONS.length} · {issue.label}
          </ThemedText>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText style={styles.prompt}>{question.prompt}</ThemedText>

          <View style={styles.options}>
            {OPTIONS.map((opt) => {
              const selected = current === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => choose(opt.value)}
                  style={[
                    styles.option,
                    {
                      backgroundColor: selected ? theme.tint : theme.card,
                      borderColor: selected ? theme.tint : theme.border,
                    },
                  ]}
                >
                  <ThemedText
                    type="smallBold"
                    style={{ color: selected ? theme.tintText : theme.text, fontSize: 16 }}
                  >
                    {opt.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Back"
            variant="ghost"
            onPress={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            style={{ flex: 1 }}
          />
          {isLast ? (
            <Button
              title="See my matches"
              onPress={finish}
              disabled={current === undefined}
              style={{ flex: 2 }}
            />
          ) : (
            <Button
              title="Next"
              variant="secondary"
              onPress={() => setIndex((i) => Math.min(i + 1, QUESTIONS.length - 1))}
              disabled={current === undefined}
              style={{ flex: 2 }}
            />
          )}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.four, paddingTop: Spacing.three },
  content: { padding: Spacing.four, gap: Spacing.four, flexGrow: 1, justifyContent: 'center' },
  prompt: { fontSize: 24, fontWeight: '700', lineHeight: 32, textAlign: 'center' },
  options: { gap: Spacing.two },
  option: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  footer: { flexDirection: 'row', gap: Spacing.two, padding: Spacing.four, paddingTop: Spacing.two },
});
