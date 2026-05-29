import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { chat as aiChat } from '@/services/ai';
import { getCandidate } from '@/services/elections';
import type { ChatMessage } from '@/types';

const SUGGESTIONS = [
  'What are their top priorities?',
  'How do they stand on healthcare?',
  'What experience do they have?',
  'Who funds their campaign?',
];

let msgCounterSeed = 0;
function nextId() {
  msgCounterSeed += 1;
  return `m${msgCounterSeed}`;
}

export default function ChatScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { candidateId } = useLocalSearchParams<{ candidateId: string }>();
  const candidate = useMemo(() => (candidateId ? getCandidate(candidateId) : undefined), [candidateId]);

  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    candidate
      ? [
          {
            id: nextId(),
            role: 'assistant',
            content: `Hi! Ask me anything about ${candidate.name} (${candidate.party ?? 'Independent'}), running for ${candidate.office}. I'll answer neutrally from the information on file.`,
          },
        ]
      : [],
  );
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useLayoutEffect(() => {
    navigation.setOptions({ title: candidate ? candidate.name : 'Assistant' });
  }, [navigation, candidate]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || !candidate || busy) return;
    setInput('');

    const userMsg: ChatMessage = { id: nextId(), role: 'user', content: trimmed };
    const pending: ChatMessage = { id: nextId(), role: 'assistant', content: '', pending: true };
    const history = [...messages, userMsg];
    setMessages([...history, pending]);
    setBusy(true);
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));

    try {
      const reply = await aiChat(candidate, history);
      setMessages((prev) =>
        prev.map((m) => (m.id === pending.id ? { ...m, content: reply, pending: false } : m)),
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === pending.id
            ? { ...m, content: 'Sorry, something went wrong. Please try again.', pending: false }
            : m,
        ),
      );
    } finally {
      setBusy(false);
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    }
  }

  if (!candidate) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>Candidate not found.</ThemedText>
      </ThemedView>
    );
  }

  const showSuggestions = messages.filter((m) => m.role === 'user').length === 0;

  return (
    <ThemedView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 96 : 0}
      >
        <ScrollView ref={scrollRef} contentContainerStyle={styles.messages}>
          {messages.map((m) => (
            <Bubble key={m.id} message={m} />
          ))}

          {showSuggestions ? (
            <View style={styles.suggestions}>
              {SUGGESTIONS.map((s) => (
                <Pressable
                  key={s}
                  onPress={() => send(s)}
                  style={[styles.chip, { borderColor: theme.tint }]}
                >
                  <ThemedText type="small" style={{ color: theme.tint }}>{s}</ThemedText>
                </Pressable>
              ))}
            </View>
          ) : null}
        </ScrollView>

        <SafeAreaView edges={['bottom']}>
          <View style={[styles.inputBar, { borderColor: theme.border, backgroundColor: theme.background }]}>
            <TextInput
              style={[styles.input, { color: theme.text, backgroundColor: theme.card, borderColor: theme.border }]}
              placeholder={`Ask about ${candidate.name}…`}
              placeholderTextColor={theme.textSecondary}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => send(input)}
              returnKeyType="send"
              editable={!busy}
            />
            <Pressable
              onPress={() => send(input)}
              disabled={busy || !input.trim()}
              style={[styles.sendBtn, { backgroundColor: theme.tint, opacity: busy || !input.trim() ? 0.5 : 1 }]}
            >
              <ThemedText style={{ color: theme.tintText, fontWeight: '800' }}>↑</ThemedText>
            </Pressable>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

function Bubble({ message }: { message: ChatMessage }) {
  const theme = useTheme();
  const isUser = message.role === 'user';
  return (
    <View
      style={[
        styles.bubble,
        {
          alignSelf: isUser ? 'flex-end' : 'flex-start',
          backgroundColor: isUser ? theme.tint : theme.backgroundElement,
        },
      ]}
    >
      {message.pending ? (
        <ThemedText style={{ color: theme.textSecondary }}>Thinking…</ThemedText>
      ) : (
        <ThemedText style={{ color: isUser ? theme.tintText : theme.text, lineHeight: 22 }}>
          {message.content}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  messages: { padding: Spacing.three, gap: Spacing.two },
  bubble: { maxWidth: '85%', padding: Spacing.three, borderRadius: Radius.lg },
  suggestions: { gap: Spacing.two, marginTop: Spacing.two },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    alignSelf: 'flex-start',
  },
  inputBar: {
    flexDirection: 'row',
    gap: Spacing.two,
    padding: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
    maxHeight: 120,
  },
  sendBtn: { width: 44, height: 44, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
});
