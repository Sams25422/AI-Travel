import React, {useState} from 'react';
import {View, Text, StyleSheet, Pressable, ActivityIndicator} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {OnboardingStackParamList} from '../../navigation/types';
import {useApp} from '../../context/AppContext';
import {COLORS, FONT_SIZES, SPACING, RADIUS} from '../../theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'PhotoPermission'>;

export default function PhotoPermissionScreen({navigation}: Props) {
  const {requestPhotos} = useApp();
  const [busy, setBusy] = useState(false);

  const onEnable = async () => {
    setBusy(true);
    try {
      await requestPhotos();
    } finally {
      setBusy(false);
      navigation.navigate('OnboardingDone');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Find your best moments</Text>
      <Text style={styles.body}>
        Atlas scans photos on your phone to filter screenshots and feature the
        shots worth keeping. Photos are never uploaded.
      </Text>
      <Pressable style={styles.cta} onPress={onEnable} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.ctaText}>Enable photos</Text>}
      </Pressable>
      <Pressable onPress={() => navigation.navigate('OnboardingDone')}>
        <Text style={styles.skip}>Not now</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background, padding: SPACING.xl, justifyContent: 'center'},
  title: {fontSize: FONT_SIZES.xxl, fontWeight: '700', color: COLORS.primary, marginBottom: SPACING.md},
  body: {fontSize: FONT_SIZES.md, lineHeight: 24, color: COLORS.textSecondary, marginBottom: SPACING.xl},
  cta: {backgroundColor: COLORS.primary, paddingVertical: SPACING.md, borderRadius: RADIUS.lg, alignItems: 'center'},
  ctaText: {color: COLORS.textInverse, fontSize: FONT_SIZES.lg, fontWeight: '600'},
  skip: {textAlign: 'center', marginTop: SPACING.lg, color: COLORS.textSecondary},
});
