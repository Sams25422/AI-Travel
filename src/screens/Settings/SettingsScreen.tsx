import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useApp} from '../../context/AppContext';
import {COLORS, FONT_SIZES, SPACING} from '../../theme';

export default function SettingsScreen() {
  const {permissions, settings} = useApp();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.section}>Privacy</Text>
      <Text style={styles.row}>Demo mode: {settings.demoMode ? 'On' : 'Off'}</Text>
      <Text style={styles.row}>Privacy mode: {settings.privacyMode ? 'On' : 'Off'}</Text>
      <Text style={styles.section}>Permissions</Text>
      <Text style={styles.row}>
        Location: {permissions.locationAlways || permissions.locationWhenInUse ? 'Granted' : 'Needed'}
      </Text>
      <Text style={styles.row}>
        Photos: {permissions.photoLibrary ? 'Granted' : 'Needed'}
      </Text>
      <Text style={styles.note}>
        Atlas keeps location and photo analysis on-device. Book checkout is a local demo
        flow until Stripe + print partners are connected.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg},
  title: {fontSize: FONT_SIZES.xxl, fontWeight: '700', color: COLORS.primary, marginBottom: SPACING.lg},
  section: {fontSize: FONT_SIZES.lg, fontWeight: '600', marginTop: SPACING.lg, marginBottom: SPACING.sm, color: COLORS.textPrimary},
  row: {color: COLORS.textSecondary, marginBottom: SPACING.xs, fontSize: FONT_SIZES.md},
  note: {marginTop: SPACING.xl, color: COLORS.textSecondary, lineHeight: 22},
});
