import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/types';
import BookService from '../../services/BookService';
import type {BookOrder} from '../../models';
import {COLORS, FONT_SIZES, SPACING, RADIUS} from '../../theme';
import {formatCurrency} from '../../utils/helpers';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderConfirmation'>;

export default function OrderConfirmationScreen({navigation, route}: Props) {
  const {orderId} = route.params;
  const [order, setOrder] = useState<BookOrder | null>(null);

  useEffect(() => {
    BookService.getOrder(orderId).then(setOrder);
  }, [orderId]);

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>📘</Text>
      <Text style={styles.title}>Your book is being printed</Text>
      <Text style={styles.body}>
        Demo order {orderId.slice(0, 8)} is marked {order?.status || 'processing'}.
        {order ? ` Total ${formatCurrency(order.price)}.` : ''}
      </Text>
      <Pressable style={styles.cta} onPress={() => navigation.popToTop()}>
        <Text style={styles.ctaText}>Back to Atlas</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background, padding: SPACING.xl, justifyContent: 'center', alignItems: 'center'},
  emoji: {fontSize: 64, marginBottom: SPACING.md},
  title: {fontSize: FONT_SIZES.xxl, fontWeight: '700', color: COLORS.primary, textAlign: 'center'},
  body: {marginTop: SPACING.md, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22},
  cta: {marginTop: SPACING.xl, backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: RADIUS.lg},
  ctaText: {color: COLORS.textInverse, fontWeight: '700'},
});
