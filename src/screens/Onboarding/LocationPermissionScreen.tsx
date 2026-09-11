import React, {useState} from 'react';
import {View, Text, StyleSheet, Pressable, ActivityIndicator} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {OnboardingStackParamList} from '../../navigation/types';
import {useApp} from '../../context/AppContext';
import {COLORS, FONT_SIZES, SPACING, RADIUS} from '../../theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'LocationPermission'>;

export default function LocationPermissionScreen({navigation}: Props) {
  const {requestLocation} = useApp();
  const [busy, setBusy] = useState(false);

  const onEnable = async () => {
    setBusy(true);
    try {
      await requestLocation();
    } finally {
      setBusy(false);
      navigation.navigate('PhotoPermission');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Build your magic map</Text>
      <Text style={styles.body}>
        Atlas needs location access to detect flights, find the places you linger,
        and draw your path. We never sell this data.
      </Text>
      <Pressable style={styles.cta} onPress={onEnable} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.ctaText}>Enable location</Text>}
      </Pressable>
      <Pressable onPress={() => navigation.navigate('PhotoPermission')}>
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
