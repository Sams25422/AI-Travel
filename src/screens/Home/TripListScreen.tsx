import React from 'react';
import {View, Text, StyleSheet, FlatList, Pressable} from 'react-native';
import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import type {CompositeScreenProps} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {MainTabParamList, RootStackParamList} from '../../navigation/types';
import {useApp} from '../../context/AppContext';
import {COLORS, FONT_SIZES, SPACING, RADIUS} from '../../theme';
import {formatDate} from '../../utils/helpers';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Trips'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function TripListScreen({navigation}: Props) {
  const {trips, deleteTrip} = useApp();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My trips</Text>
      <FlatList
        data={trips}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>No trips yet. Run the Paris demo from Home.</Text>
        }
        renderItem={({item}) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('TripTimeline', {tripId: item.id})}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>
              {item.status} · {formatDate(item.startDate)}
              {item.countries?.length ? ` · ${item.countries.join(', ')}` : ''}
            </Text>
            <Text style={styles.steps}>{item.totalSteps} steps</Text>
            <Pressable
              onPress={() => deleteTrip(item.id)}
              hitSlop={8}
              style={styles.delete}>
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg},
  title: {fontSize: FONT_SIZES.xxl, fontWeight: '700', color: COLORS.primary, marginBottom: SPACING.md},
  empty: {color: COLORS.textSecondary, marginTop: SPACING.xl},
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  name: {fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.textPrimary},
  meta: {color: COLORS.textSecondary, marginTop: 4},
  steps: {color: COLORS.primary, marginTop: 6, fontWeight: '500'},
  delete: {position: 'absolute', right: SPACING.md, top: SPACING.md},
  deleteText: {color: COLORS.error, fontSize: FONT_SIZES.sm},
});
