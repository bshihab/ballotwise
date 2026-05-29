import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { dataSource } from '@/services/elections';
import { useAppStore } from '@/store/useAppStore';
import type { Address } from '@/types';

export default function LocationScreen() {
  const theme = useTheme();
  const router = useRouter();
  const existing = useAppStore((s) => s.address);
  const setAddress = useAppStore((s) => s.setAddress);

  const [line1, setLine1] = useState(existing?.line1 ?? '');
  const [city, setCity] = useState(existing?.city ?? '');
  const [state, setState] = useState(existing?.state ?? '');
  const [zip, setZip] = useState(existing?.zip ?? '');
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const source = dataSource();
  const canContinue = city.trim().length > 0 && (state.trim().length > 0 || zip.trim().length > 0);

  async function useMyLocation() {
    setError(null);
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied. You can enter your address manually.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const places = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      const p = places[0];
      if (p) {
        setLine1([p.streetNumber, p.street].filter(Boolean).join(' '));
        setCity(p.city ?? p.subregion ?? '');
        setState(p.region ?? '');
        setZip(p.postalCode ?? '');
      } else {
        setError('Could not determine your address. Please enter it manually.');
      }
    } catch {
      setError('Location lookup failed. Please enter your address manually.');
    } finally {
      setLocating(false);
    }
  }

  function onContinue() {
    const address: Address = {
      line1: line1.trim(),
      city: city.trim(),
      state: state.trim(),
      zip: zip.trim(),
    };
    setAddress(address);
    router.push('/elections');
  }

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.card, borderColor: theme.border, color: theme.text },
  ];

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.hero}>
              <ThemedText style={[styles.brand, { fontFamily: Fonts?.serif }]}>
                Ballotwise
              </ThemedText>
              <ThemedText type="default" style={{ color: theme.textSecondary, textAlign: 'center' }}>
                Find the candidates who match your values — on your actual ballot.
              </ThemedText>
            </View>

            <View style={styles.form}>
              <Button
                title={locating ? 'Locating…' : '📍  Use my current location'}
                variant="secondary"
                loading={locating}
                onPress={useMyLocation}
              />

              <View style={styles.dividerRow}>
                <View style={[styles.line, { backgroundColor: theme.border }]} />
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  or enter your address
                </ThemedText>
                <View style={[styles.line, { backgroundColor: theme.border }]} />
              </View>

              <TextInput
                style={inputStyle}
                placeholder="Street address"
                placeholderTextColor={theme.textSecondary}
                value={line1}
                onChangeText={setLine1}
                autoCapitalize="words"
              />
              <TextInput
                style={inputStyle}
                placeholder="City"
                placeholderTextColor={theme.textSecondary}
                value={city}
                onChangeText={setCity}
                autoCapitalize="words"
              />
              <View style={styles.cityRow}>
                <TextInput
                  style={[...inputStyle, { flex: 1 }]}
                  placeholder="State"
                  placeholderTextColor={theme.textSecondary}
                  value={state}
                  onChangeText={setState}
                  autoCapitalize="characters"
                  maxLength={20}
                />
                <TextInput
                  style={[...inputStyle, { flex: 1 }]}
                  placeholder="ZIP"
                  placeholderTextColor={theme.textSecondary}
                  value={zip}
                  onChangeText={setZip}
                  keyboardType="number-pad"
                  maxLength={10}
                />
              </View>

              {error ? (
                <ThemedText type="small" style={{ color: theme.danger }}>
                  {error}
                </ThemedText>
              ) : null}
            </View>

            <View style={styles.footer}>
              <Button title="Find my elections" onPress={onContinue} disabled={!canContinue} />
              <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: 'center' }}>
                {source.label}
              </ThemedText>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.four, gap: Spacing.five, flexGrow: 1, justifyContent: 'center' },
  hero: { alignItems: 'center', gap: Spacing.two },
  brand: { fontSize: 44, fontWeight: '700', letterSpacing: -0.5 },
  form: { gap: Spacing.two },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
  },
  cityRow: { flexDirection: 'row', gap: Spacing.two },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginVertical: Spacing.one },
  line: { flex: 1, height: StyleSheet.hairlineWidth },
  footer: { gap: Spacing.two },
});
