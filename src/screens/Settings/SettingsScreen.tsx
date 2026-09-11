import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Pressable,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {useApp} from '../../context/AppContext';
import {COLORS, FONT_SIZES, SPACING, RADIUS} from '../../theme';

export default function SettingsScreen() {
  const {
    permissions,
    settings,
    updateSettings,
    requestLocation,
    requestPhotos,
  } = useApp();
  const [busy, setBusy] = useState<string | null>(null);

  const onToggleDemo = async (value: boolean) => {
    if (Platform.OS === 'web') return;
    setBusy('demo');
    try {
      await updateSettings({demoMode: value});
    } finally {
      setBusy(null);
    }
  };

  const onTogglePrivacy = async (value: boolean) => {
    setBusy('privacy');
    try {
      await updateSettings({privacyMode: value});
    } finally {
      setBusy(null);
    }
  };

  const onToggleUnits = async () => {
    const next = settings.preferredUnits === 'metric' ? 'imperial' : 'metric';
    setBusy('units');
    try {
      await updateSettings({preferredUnits: next});
    } finally {
      setBusy(null);
    }
  };

  const locationOk = permissions.locationAlways || permissions.locationWhenInUse;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.lede}>
        Atlas stays local-first. Toggles below control tracking, privacy, and how
        distances are shown.
      </Text>

      <Text style={styles.section}>Tracking</Text>
      <View style={styles.row}>
        <View style={styles.rowText}>
          <Text style={styles.rowLabel}>Demo mode</Text>
          <Text style={styles.rowHint}>
            {Platform.OS === 'web'
              ? 'Always on for web — Paris path simulator.'
              : 'Off uses live GPS. On replays a Paris sample path.'}
          </Text>
        </View>
        <Switch
          value={settings.demoMode}
          onValueChange={onToggleDemo}
          disabled={Platform.OS === 'web' || busy === 'demo'}
          trackColor={{false: COLORS.gray300, true: COLORS.primaryLight}}
          thumbColor={settings.demoMode ? COLORS.primary : COLORS.gray100}
        />
      </View>

      <Text style={styles.section}>Privacy</Text>
      <View style={styles.row}>
        <View style={styles.rowText}>
          <Text style={styles.rowLabel}>Privacy mode</Text>
          <Text style={styles.rowHint}>
            Keep location and photo analysis on-device.
          </Text>
        </View>
        <Switch
          value={settings.privacyMode}
          onValueChange={onTogglePrivacy}
          disabled={busy === 'privacy'}
          trackColor={{false: COLORS.gray300, true: COLORS.primaryLight}}
          thumbColor={settings.privacyMode ? COLORS.primary : COLORS.gray100}
        />
      </View>

      <Text style={styles.section}>Units</Text>
      <Pressable style={styles.row} onPress={onToggleUnits}>
        <View style={styles.rowText}>
          <Text style={styles.rowLabel}>Preferred units</Text>
          <Text style={styles.rowHint}>
            Currently {settings.preferredUnits}
            {busy === 'units' ? '…' : ''}
          </Text>
        </View>
        <Text style={styles.chip}>
          {settings.preferredUnits === 'metric' ? 'km' : 'mi'}
        </Text>
      </Pressable>

      <Text style={styles.section}>Permissions</Text>
      <View style={styles.permCard}>
        <Text style={styles.rowLabel}>
          Location: {locationOk ? 'Granted' : 'Needed'}
        </Text>
        {!locationOk ? (
          <Pressable
            style={styles.permBtn}
            onPress={async () => {
              setBusy('loc');
              try {
                await requestLocation();
              } finally {
                setBusy(null);
              }
            }}>
            {busy === 'loc' ? (
              <ActivityIndicator color={COLORS.textInverse} />
            ) : (
              <Text style={styles.permBtnText}>Request location</Text>
            )}
          </Pressable>
        ) : null}
      </View>
      <View style={styles.permCard}>
        <Text style={styles.rowLabel}>
          Photos: {permissions.photoLibrary ? 'Granted' : 'Needed'}
        </Text>
        {!permissions.photoLibrary ? (
          <Pressable
            style={styles.permBtn}
            onPress={async () => {
              setBusy('photos');
              try {
                await requestPhotos();
              } finally {
                setBusy(null);
              }
            }}>
            {busy === 'photos' ? (
              <ActivityIndicator color={COLORS.textInverse} />
            ) : (
              <Text style={styles.permBtnText}>Request photos</Text>
            )}
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.note}>
        Book checkout is a local demo until Stripe and print partners are
        connected. Photos stay on this device.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  content: {padding: SPACING.lg, paddingBottom: SPACING.xxl},
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  lede: {color: COLORS.textSecondary, lineHeight: 22, marginBottom: SPACING.lg},
  section: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    color: COLORS.textPrimary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  rowText: {flex: 1},
  rowLabel: {fontWeight: '600', color: COLORS.textPrimary, fontSize: FONT_SIZES.md},
  rowHint: {color: COLORS.textSecondary, fontSize: FONT_SIZES.sm, marginTop: 2},
  chip: {
    backgroundColor: COLORS.parchment,
    color: COLORS.primary,
    fontWeight: '700',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  permCard: {
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  permBtn: {
    marginTop: SPACING.sm,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  permBtnText: {color: COLORS.textInverse, fontWeight: '600'},
  note: {marginTop: SPACING.xl, color: COLORS.textSecondary, lineHeight: 22},
});
