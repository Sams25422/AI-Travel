import React, {useEffect, useState} from 'react';
import {View, Text, TextInput, StyleSheet, Pressable} from 'react-native';
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

  useEffect(() => {
    (async () => {
      if (!stepId) return;
      const found = await stepStorage.get(stepId);
      if (found) {
        setStep(found);
        setName(found.name);
        setNotes(found.notes || '');
      }
    })();
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

  return (
    <View style={styles.container}>
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
      <Pressable style={styles.save} onPress={save}>
        <Text style={styles.saveText}>Save</Text>
      </Pressable>
      <Pressable style={styles.delete} onPress={remove}>
        <Text style={styles.deleteText}>Delete step</Text>
      </Pressable>
      <Text style={styles.hint}>{step?.type || 'visit'} step</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg},
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
