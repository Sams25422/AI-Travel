import React, {useState} from 'react';
import {View, Text, StyleSheet, Pressable, ActivityIndicator} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {OnboardingStackParamList} from '../../navigation/types';
import {useApp} from '../../context/AppContext';
import {COLORS, FONT_SIZES, SPACING, RADIUS} from '../../theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingDone'>;

export default function OnboardingDoneScreen(_props: Props) {
  const {completeOnboarding} = useApp();
  const [busy, setBusy] = useState(false);

  const finish = async () => {
    setBusy(true);
    await completeOnboarding();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>You're all set</Text>
      <Text style={styles.body}>
        Enjoy your trip. Atlas will quietly build your journal in the background.
        You can also run a Paris demo anytime from Home.
      </Text>
      <Pressable style={styles.cta} onPress={finish} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.ctaText}>Open Atlas</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background, padding: SPACING.xl, justifyContent: 'center'},
  title: {fontSize: FONT_SIZES.xxl, fontWeight: '700', color: COLORS.primary, marginBottom: SPACING.md},
  body: {fontSize: FONT_SIZES.md, lineHeight: 24, color: COLORS.textSecondary, marginBottom: SPACING.xl},
  cta: {backgroundColor: COLORS.accent, paddingVertical: SPACING.md, borderRadius: RADIUS.lg, alignItems: 'center'},
  ctaText: {color: COLORS.textInverse, fontSize: FONT_SIZES.lg, fontWeight: '600'},
});
