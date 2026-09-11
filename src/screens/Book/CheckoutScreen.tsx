import React, {useState} from 'react';
import {View, Text, TextInput, StyleSheet, Pressable, ActivityIndicator, ScrollView} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/types';
import BookService from '../../services/BookService';
import {COLORS, FONT_SIZES, SPACING, RADIUS} from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

export default function CheckoutScreen({navigation, route}: Props) {
  const {tripId} = route.params;
  const [busy, setBusy] = useState(false);
  const [fullName, setFullName] = useState('Alex Traveler');
  const [line1, setLine1] = useState('123 Memory Lane');
  const [city, setCity] = useState('San Francisco');
  const [state, setState] = useState('CA');
  const [postal, setPostal] = useState('94110');
  const [country, setCountry] = useState('United States');
  const [error, setError] = useState('');

  const placeOrder = async () => {
    setBusy(true);
    setError('');
    try {
      const order = await BookService.createOrder({
        tripId,
        bookType: 'hardcover',
        bookSize: '8x10',
        shippingAddress: {
          fullName,
          addressLine1: line1,
          city,
          state,
          postalCode: postal,
          country,
        },
      });
      const paid = await BookService.completeDemoCheckout(order.id);
      navigation.replace('OrderConfirmation', {orderId: paid.id, tripId});
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{padding: SPACING.lg}}>
      <Text style={styles.title}>Shipping</Text>
      <Text style={styles.note}>Demo checkout — no real charge. Stripe-ready order model.</Text>
      {[
        ['Full name', fullName, setFullName],
        ['Address', line1, setLine1],
        ['City', city, setCity],
        ['State', state, setState],
        ['Postal code', postal, setPostal],
        ['Country', country, setCountry],
      ].map(([label, value, setter]) => (
        <View key={label as string} style={{marginBottom: SPACING.md}}>
          <Text style={styles.label}>{label as string}</Text>
          <TextInput
            style={styles.input}
            value={value as string}
            onChangeText={setter as (v: string) => void}
          />
        </View>
      ))}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable style={styles.cta} onPress={placeOrder} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.ctaText}>Place demo order</Text>}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  title: {fontSize: FONT_SIZES.xxl, fontWeight: '700', color: COLORS.primary},
  note: {color: COLORS.textSecondary, marginVertical: SPACING.md, lineHeight: 20},
  label: {fontWeight: '600', marginBottom: 4, color: COLORS.textPrimary},
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    color: COLORS.textPrimary,
  },
  error: {color: COLORS.error, marginBottom: SPACING.sm},
  cta: {backgroundColor: COLORS.primary, padding: SPACING.md, borderRadius: RADIUS.lg, alignItems: 'center', marginTop: SPACING.md},
  ctaText: {color: COLORS.textInverse, fontWeight: '700'},
});
