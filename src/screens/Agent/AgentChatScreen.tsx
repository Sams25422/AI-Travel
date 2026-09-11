import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/types';
import AgentService, {type AgentMessage} from '../../services/AgentService';
import TravelLinksService from '../../services/TravelLinksService';
import PlanService from '../../services/PlanService';
import {COLORS, FONT_SIZES, SPACING, RADIUS} from '../../theme';
import {generateUUID, nowISO} from '../../utils/helpers';

type Props = NativeStackScreenProps<RootStackParamList, 'AgentChat'>;

export default function AgentChatScreen({route}: Props) {
  const {destinationId, tripId, destinationName} = route.params || {};
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const listRef = useRef<FlatList<AgentMessage>>(null);

  useEffect(() => {
    setMessages([
      AgentService.buildWelcome({
        destinationId,
        destinationName,
        tripId,
      }),
    ]);
  }, [destinationId, destinationName, tripId]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    const userMsg: AgentMessage = {
      id: generateUUID(),
      role: 'user',
      text: trimmed,
      createdAt: nowISO(),
    };
    setMessages(prev => [...prev, userMsg]);
    setDraft('');
    setBusy(true);
    try {
      const itinerary = tripId ? await PlanService.getItinerary(tripId) : [];
      const reply = await AgentService.reply(
        trimmed,
        {destinationId, destinationName, tripId},
        itinerary,
      );
      setMessages(prev => [...prev, reply]);
      requestAnimationFrame(() =>
        listRef.current?.scrollToEnd({animated: true}),
      );
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          id: generateUUID(),
          role: 'agent',
          createdAt: nowISO(),
          text: (e as Error).message || 'Something went wrong — try again.',
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const renderMessage = ({item}: {item: AgentMessage}) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.agentBubble]}>
        {!isUser ? <Text style={styles.agentLabel}>Atlas agent</Text> : null}
        <Text style={[styles.bubbleText, isUser && styles.userText]}>{item.text}</Text>

        {item.weather ? (
          <View style={styles.weatherCard}>
            <Text style={styles.weatherNow}>
              {item.weather.currentTempC}°C · {item.weather.currentLabel}
            </Text>
            {item.weather.daily.slice(0, 3).map(d => (
              <Text key={d.date} style={styles.weatherDay}>
                {d.date.slice(5)} · {d.label} · {d.tempMinC}–{d.tempMaxC}°C
              </Text>
            ))}
          </View>
        ) : null}

        {item.activities?.length ? (
          <View style={styles.activityList}>
            {item.activities.map(a => (
              <View key={a.id} style={styles.activityCard}>
                <Image source={{uri: a.imageUri}} style={styles.activityImage} />
                <View style={styles.activityBody}>
                  <Text style={styles.heat}>Heat {a.heat}</Text>
                  <Text style={styles.activityTitle}>{a.title}</Text>
                  <Text style={styles.activityBlurb} numberOfLines={2}>
                    {a.blurb}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {item.links?.length ? (
          <View style={styles.linkList}>
            {item.links.map(link => (
              <Pressable
                key={link.id}
                style={styles.linkBtn}
                onPress={() => TravelLinksService.open(link)}>
                <Text style={styles.linkLabel}>{link.label}</Text>
                <Text style={styles.linkSub}>{link.subtitle}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {item.suggestions?.length ? (
          <View style={styles.suggestionRow}>
            {item.suggestions.map(s => (
              <Pressable key={s} style={styles.chip} onPress={() => send(s)}>
                <Text style={styles.chipText}>{s}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={88}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={m => m.id}
        contentContainerStyle={styles.list}
        renderItem={renderMessage}
        onContentSizeChange={() => listRef.current?.scrollToEnd({animated: true})}
      />
      {busy ? <ActivityIndicator color={COLORS.primary} style={styles.busy} /> : null}
      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder="Ask about weather, flights, stays…"
          placeholderTextColor={COLORS.textDisabled}
          onSubmitEditing={() => send(draft)}
          returnKeyType="send"
        />
        <Pressable
          style={[styles.send, (!draft.trim() || busy) && styles.sendDisabled]}
          onPress={() => send(draft)}
          disabled={!draft.trim() || busy}>
          <Text style={styles.sendText}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  list: {padding: SPACING.md, paddingBottom: SPACING.lg, gap: SPACING.sm},
  bubble: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    maxWidth: '92%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
  },
  agentBubble: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  agentLabel: {
    color: COLORS.accent,
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  bubbleText: {color: COLORS.textPrimary, lineHeight: 22, fontSize: FONT_SIZES.md},
  userText: {color: COLORS.textInverse},
  weatherCard: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.parchment,
  },
  weatherNow: {fontWeight: '700', color: COLORS.primary, marginBottom: 4},
  weatherDay: {color: COLORS.textSecondary, fontSize: FONT_SIZES.sm, marginTop: 2},
  activityList: {marginTop: SPACING.sm, gap: SPACING.sm},
  activityCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.parchment,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  activityImage: {width: 72, height: 72},
  activityBody: {flex: 1, padding: SPACING.sm},
  heat: {color: COLORS.accent, fontSize: FONT_SIZES.xs, fontWeight: '700'},
  activityTitle: {color: COLORS.textPrimary, fontWeight: '700', marginTop: 2},
  activityBlurb: {color: COLORS.textSecondary, fontSize: FONT_SIZES.sm, marginTop: 2},
  linkList: {marginTop: SPACING.sm, gap: SPACING.xs},
  linkBtn: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  linkLabel: {color: COLORS.primary, fontWeight: '700'},
  linkSub: {color: COLORS.textSecondary, fontSize: FONT_SIZES.sm, marginTop: 2},
  suggestionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  chip: {
    backgroundColor: COLORS.parchment,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
  },
  chipText: {color: COLORS.primary, fontSize: FONT_SIZES.sm, fontWeight: '600'},
  busy: {marginBottom: SPACING.xs},
  composer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    backgroundColor: COLORS.surface,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.background,
  },
  send: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    justifyContent: 'center',
  },
  sendDisabled: {opacity: 0.45},
  sendText: {color: COLORS.textInverse, fontWeight: '700'},
});
