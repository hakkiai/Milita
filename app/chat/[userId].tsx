import {
  View, Text, StyleSheet, FlatList, Image, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform, Animated, Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Send, Paperclip, Check, CheckCheck } from 'lucide-react-native';
import { useState, useRef, useEffect, useCallback } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/api/firebase';
import { useThemeColors } from '@/providers/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import {
  useConversation, getOrCreateConversation, sendChatMessage, ChatMessage, FirestoreUser,
} from '@/hooks/useChat';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ── Typing Indicator ──────────────────────────────────────────────────────────

function TypingDots({ C }: { C: any }) {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  useEffect(() => {
    const anims = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(dot, { toValue: -6, duration: 300, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true, easing: Easing.in(Easing.quad) }),
          Animated.delay(600),
        ])
      )
    );
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, []);

  return (
    <View style={[typingStyles.wrap, { backgroundColor: C.surface, borderColor: C.border }]}>
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={[typingStyles.dot, { backgroundColor: C.textMuted, transform: [{ translateY: dot }] }]}
        />
      ))}
    </View>
  );
}

const typingStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 12, borderRadius: 18,
    borderWidth: 1, alignSelf: 'flex-start', marginLeft: 8,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
});

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function ChatConversationScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const C = useThemeColors();
  const { user } = useAuth();
  const myId = user?.id ?? null;

  const [partner, setPartner] = useState<FirestoreUser | null>(null);

  // Fetch partner profile from Firestore
  useEffect(() => {
    if (!userId) return;
    getDoc(doc(db, 'users', userId))
      .then((snap) => {
        if (snap.exists()) setPartner(snap.data() as FirestoreUser);
      })
      .catch(() => {});
  }, [userId]);

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  // Resolve conversation ID on mount
  useEffect(() => {
    if (!myId || !userId) return;
    getOrCreateConversation(myId, userId).then(setConversationId);
  }, [myId, userId]);

  const { messages, loading, partnerTyping, broadcastTyping } = useConversation(conversationId, myId);

  // Auto-scroll on new messages
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    }
  }, [messages.length]);

  const onChangeText = useCallback((text: string) => {
    setInput(text);
    broadcastTyping();
  }, [broadcastTyping]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || !conversationId || !myId || !userId) return;
    setSending(true);
    setInput('');
    await sendChatMessage(conversationId, myId, text, [myId, userId as string].sort());
    setSending(false);
  }, [input, conversationId, myId, userId]);

  // Last sent message with read status
  const lastSentMsg = [...messages].reverse().find((m) => m.sender_id === myId);

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isMe = item.sender_id === myId;
    const isLastSent = isMe && item.id === lastSentMsg?.id;
    const nextMsg = messages[index + 1];
    const showTime = !nextMsg || nextMsg.sender_id !== item.sender_id;

    return (
      <View style={[styles.bubbleWrap, isMe ? styles.bubbleWrapMe : styles.bubbleWrapThem]}>
        {/* Partner avatar (only on last consecutive bubble) */}
        {!isMe && (
          <View style={styles.avatarCol}>
            {showTime && partner?.photoUrl && (
              <Image source={{ uri: partner.photoUrl }} style={styles.bubbleAvatar} />
            )}
            {!showTime && <View style={{ width: 28 }} />}
          </View>
        )}

        <View style={styles.bubbleContent}>
          <View
            style={[
              styles.bubble,
              isMe
                ? { backgroundColor: C.accent, borderBottomRightRadius: 4 }
                : { backgroundColor: C.surface, borderColor: C.border, borderWidth: 1, borderBottomLeftRadius: 4 },
            ]}
          >
            <Text style={[styles.bubbleText, { color: isMe ? '#fff' : C.text }]}>
              {item.text}
            </Text>
          </View>

          {showTime && (
            <View style={[styles.metaRow, isMe ? styles.metaRowMe : styles.metaRowThem]}>
              <Text style={[styles.timeText, { color: C.textMuted }]}>{formatTime(item.created_at)}</Text>
              {isLastSent && (
                item.is_read
                  ? <CheckCheck size={12} color={C.accent} />
                  : <Check size={12} color={C.textMuted} />
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.background }]} edges={['top']}>
      {/* ── Header ── */}
      <View style={[styles.header, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={C.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerCenter} activeOpacity={0.8}>
          {partner?.photoUrl ? (
            <View style={styles.headerAvatarWrap}>
              <Image source={{ uri: partner.photoUrl }} style={styles.headerAvatar} />
              <View style={[styles.headerOnlineDot, { borderColor: C.surface }]} />
            </View>
          ) : (
            <View style={[styles.headerAvatarFallback, { backgroundColor: C.accent }]}>
              <Text style={styles.headerInitial}>{(partner?.name ?? '?')[0]}</Text>
            </View>
          )}
          <View>
            <Text style={[styles.headerName, { color: C.text }]}>
              {partner?.name ?? 'Unknown'}
            </Text>
            <Text style={[styles.headerStatus, { color: '#30D158' }]}>
              {partnerTyping ? 'typing...' : 'Online'}
            </Text>
          </View>
        </TouchableOpacity>
        <View style={{ width: 32 }} />
      </View>

      {/* ── Messages ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
          ListHeaderComponent={
            loading ? (
              <View style={styles.loadingRow}>
                <Text style={[styles.loadingText, { color: C.textMuted }]}>Loading messages...</Text>
              </View>
            ) : null
          }
          ListFooterComponent={
            partnerTyping ? <TypingDots C={C} /> : null
          }
        />

        {/* ── Input bar ── */}
        <SafeAreaView
          edges={['bottom']}
          style={[styles.inputBar, { backgroundColor: C.surface, borderTopColor: C.border }]}
        >
          {/* Attachment (future-ready) */}
          <TouchableOpacity style={styles.attachBtn} disabled>
            <Paperclip size={20} color={C.textMuted} />
          </TouchableOpacity>

          <TextInput
            style={[styles.input, { backgroundColor: C.surfaceAlt, color: C.text }]}
            value={input}
            onChangeText={onChangeText}
            placeholder="Message..."
            placeholderTextColor={C.textMuted}
            multiline
            maxLength={1000}
          />

          <TouchableOpacity
            style={[
              styles.sendBtn,
              { backgroundColor: input.trim() && !sending ? C.accent : C.surfaceAlt },
            ]}
            onPress={handleSend}
            disabled={!input.trim() || sending}
          >
            <Send size={18} color={input.trim() && !sending ? '#fff' : C.textMuted} />
          </TouchableOpacity>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1,
  },
  backBtn: { padding: 4, width: 32 },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatarWrap: { position: 'relative' },
  headerAvatar: { width: 40, height: 40, borderRadius: 20 },
  headerOnlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 11, height: 11, borderRadius: 6,
    backgroundColor: '#30D158', borderWidth: 2,
  },
  headerAvatarFallback: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  headerInitial: { color: '#fff', fontSize: 16, fontWeight: '700' },
  headerName: { fontSize: 15, fontWeight: '700' },
  headerStatus: { fontSize: 12, fontWeight: '500' },

  messageList: { paddingHorizontal: 12, paddingVertical: 16, gap: 4 },
  loadingRow: { alignItems: 'center', paddingBottom: 12 },
  loadingText: { fontSize: 13 },

  bubbleWrap: { flexDirection: 'row', marginVertical: 2, maxWidth: '82%' },
  bubbleWrapMe: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  bubbleWrapThem: { alignSelf: 'flex-start' },
  avatarCol: { justifyContent: 'flex-end', marginRight: 6 },
  bubbleAvatar: { width: 28, height: 28, borderRadius: 14 },
  bubbleContent: { flexShrink: 1 },
  bubble: {
    borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10,
  },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  metaRowMe: { justifyContent: 'flex-end' },
  metaRowThem: { justifyContent: 'flex-start' },
  timeText: { fontSize: 11 },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    paddingHorizontal: 12, paddingTop: 10, paddingBottom: 10,
    borderTopWidth: 1,
  },
  attachBtn: { padding: 6, marginBottom: 4 },
  input: {
    flex: 1, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 15, maxHeight: 110, minHeight: 42,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21,
    justifyContent: 'center', alignItems: 'center',
  },
});
