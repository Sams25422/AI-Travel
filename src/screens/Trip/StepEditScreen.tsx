import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/types';
import type {Step} from '../../models';
import {stepStorage} from '../../utils/storage';
import JournalingService from '../../services/JournalingService';
import {COLORS, FONT_SIZES, SPACING, RADIUS} from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'StepEdit'>;

export default function StepEditScreen({navigation, route}: Props) {
  const {stepId} = route.params;
  const [step, setStep] = useState<Step | null>(null);
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const reload = async () => {
    if (!stepId) return;
    const found = await stepStorage.get(stepId);
    if (found) {
      setStep(found);
      setName(found.name);
      setNotes(found.notes || '');
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepId]);

  const save = async () => {
    if (!stepId) return;
    await JournalingService.updateStep(stepId, {name, notes});
    navigation.goBack();
  };

  const remove = async () => {
    if (!stepId) return;
    await JournalingService.deleteStep(stepId);
    navigation.goBack();
  };

  const attach = async () => {
    if (!stepId) return;
    setBusy(true);
    setError('');
    try {
      await JournalingService.attachFromLibrary(stepId, 3);
      await reload();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const removePhoto = async (nativeId: string) => {
    if (!stepId) return;
    setBusy(true);
    try {
      await JournalingService.removePhoto(stepId, nativeId);
      await reload();
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Place name" />
      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={[styles.input, styles.notes]}
        value={notes}
        onChangeText={setNotes}
        placeholder="What made this moment special?"
        multiline
      />

      <Text style={styles.label}>Photos</Text>
      <View style={styles.photos}>
        {(step?.photos || []).map(photo => (
          <View key={photo.nativeId} style={styles.photoWrap}>
            {photo.uri ? (
              <Image source={{uri: photo.uri}} style={styles.photo} />
            ) : (
              <View style={[styles.photo, styles.photoEmpty]}>
                <Text style={styles.photoEmptyText}>No URI</Text>
              </View>
            )}
            <Pressable onPress={() => removePhoto(photo.nativeId)} hitSlop={6}>
              <Text style={styles.removePhoto}>Remove</Text>
            </Pressable>
            {photo.location ? (
              <Text style={styles.exif}>
                EXIF {photo.location.latitude.toFixed(3)},{' '}
                {photo.location.longitude.toFixed(3)}
              </Text>
            ) : null}
          </View>
        ))}
        {!step?.photos?.length ? (
          <Text style={styles.noPhotos}>No photos attached yet.</Text>
        ) : null}
      </View>

      <Pressable style={styles.attach} onPress={attach} disabled={busy}>
        {busy ? (
          <ActivityIndicator color={COLORS.primary} />
        ) : (
          <Text style={styles.attachText}>Attach from library</Text>
        )}
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.save} onPress={save}>
        <Text style={styles.saveText}>Save</Text>
      </Pressable>
      <Pressable style={styles.delete} onPress={remove}>
        <Text style={styles.deleteText}>Delete step</Text>
      </Pressable>
      <Text style={styles.hint}>{step?.type || 'visit'} step</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  content: {padding: SPACING.lg, paddingBottom: SPACING.xxl},
  label: {fontWeight: '600', color: COLORS.textPrimary, marginBottom: SPACING.xs},
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    color: COLORS.textPrimary,
  },
  notes: {minHeight: 120, textAlignVertical: 'top'},
  photos: {flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, marginBottom: SPACING.md},
  photoWrap: {width: 104},
  photo: {width: 104, height: 104, borderRadius: RADIUS.md, backgroundColor: COLORS.parchment},
  photoEmpty: {alignItems: 'center', justifyContent: 'center'},
  photoEmptyText: {color: COLORS.textDisabled, fontSize: FONT_SIZES.xs},
  removePhoto: {marginTop: 4, color: COLORS.error, fontSize: FONT_SIZES.xs, fontWeight: '600'},
  exif: {marginTop: 2, color: COLORS.textSecondary, fontSize: 10},
  noPhotos: {color: COLORS.textSecondary, fontSize: FONT_SIZES.sm},
  attach: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  attachText: {color: COLORS.primary, fontWeight: '600'},
  error: {color: COLORS.error, marginBottom: SPACING.md},
  save: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  saveText: {color: COLORS.textInverse, fontWeight: '600'},
  delete: {marginTop: SPACING.md, alignItems: 'center', padding: SPACING.md},
  deleteText: {color: COLORS.error, fontWeight: '600'},
  hint: {marginTop: SPACING.lg, color: COLORS.textSecondary, fontSize: FONT_SIZES.sm},
});
