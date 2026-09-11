import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/types';
import type {Step} from '../../models';
import {useApp} from '../../context/AppContext';
import {COLORS, FONT_SIZES, SPACING, RADIUS} from '../../theme';
import {formatDateTime} from '../../utils/helpers';
import TripService from '../../services/TripService';

type Props = NativeStackScreenProps<RootStackParamList, 'TripTimeline'>;

export default function TripTimelineScreen({navigation, route}: Props) {
  const {tripId} = route.params;
  const {getSteps, refreshJournal, completeTrip, addManualStep} = useApp();
  const [steps, setSteps] = useState<Step[]>([]);
  const [title, setTitle] = useState('Trip');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const trip = await TripService.getTrip(tripId);
    if (trip) setTitle(trip.name);
    setSteps(await getSteps(tripId));
  }, [getSteps, tripId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onRefresh = async () => {
    setBusy(true);
    try {
      setSteps(await refreshJournal(tripId));
    } finally {
      setBusy(false);
    }
  };

  const onAdd = async () => {
    const step = await addManualStep(tripId, 'Custom stop', 'Added by hand');
    setSteps(await getSteps(tripId));
    navigation.navigate('StepEdit', {tripId, stepId: step.id});
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.meta}>{steps.length} steps</Text>
      </View>
      <FlatList
        data={steps}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={busy} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No steps yet. Pull to refresh after tracking, or add one manually.
          </Text>
        }
        renderItem={({item}) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('StepEdit', {tripId, stepId: item.id})}>
            {item.photos[0]?.uri ? (
              <Image source={{uri: item.photos[0].uri}} style={styles.photo} />
            ) : (
              <View style={[styles.photo, styles.photoPlaceholder]}>
                <Text style={styles.placeholderText}>{item.type}</Text>
              </View>
            )}
            <View style={styles.cardBody}>
              <Text style={styles.stepName}>{item.name}</Text>
              <Text style={styles.stepMeta}>
                {item.type} · {formatDateTime(item.startTime)}
              </Text>
              {item.notes ? <Text style={styles.notes} numberOfLines={2}>{item.notes}</Text> : null}
            </View>
          </Pressable>
        )}
      />
      <View style={styles.actions}>
        <Pressable style={styles.secondary} onPress={onAdd}>
          <Text style={styles.secondaryText}>Add step</Text>
        </Pressable>
        <Pressable
          style={styles.primary}
          onPress={() => navigation.navigate('BookPreview', {tripId})}>
          <Text style={styles.primaryText}>Preview book</Text>
        </Pressable>
        <Pressable
          style={styles.accent}
          onPress={async () => {
            setBusy(true);
            try {
              await completeTrip(tripId);
              await load();
            } finally {
              setBusy(false);
            }
          }}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Complete trip</Text>}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  header: {padding: SPACING.lg, paddingBottom: SPACING.sm},
  title: {fontSize: FONT_SIZES.xxl, fontWeight: '700', color: COLORS.primary},
  meta: {color: COLORS.textSecondary, marginTop: 4},
  empty: {padding: SPACING.lg, color: COLORS.textSecondary},
  card: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  photo: {width: 88, height: 88},
  photoPlaceholder: {backgroundColor: COLORS.parchment, alignItems: 'center', justifyContent: 'center'},
  placeholderText: {color: COLORS.textSecondary, fontSize: FONT_SIZES.xs, textTransform: 'uppercase'},
  cardBody: {flex: 1, padding: SPACING.md},
  stepName: {fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.textPrimary},
  stepMeta: {color: COLORS.textSecondary, marginTop: 4, fontSize: FONT_SIZES.sm},
  notes: {marginTop: 6, color: COLORS.textSecondary, fontSize: FONT_SIZES.sm},
  actions: {padding: SPACING.lg, gap: SPACING.sm},
  primary: {backgroundColor: COLORS.primary, padding: SPACING.md, borderRadius: RADIUS.lg, alignItems: 'center'},
  secondary: {backgroundColor: COLORS.surface, padding: SPACING.md, borderRadius: RADIUS.lg, alignItems: 'center', borderWidth: 1, borderColor: COLORS.primary},
  accent: {backgroundColor: COLORS.accent, padding: SPACING.md, borderRadius: RADIUS.lg, alignItems: 'center'},
  primaryText: {color: COLORS.textInverse, fontWeight: '600'},
  secondaryText: {color: COLORS.primary, fontWeight: '600'},
});
