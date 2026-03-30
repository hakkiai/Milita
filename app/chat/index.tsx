import {
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity,
  TextInput, Modal, Animated, Easing, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ChevronLeft, MessageCircle, Search, Edit3, X, Plus, Check, User,
} from 'lucide-react-native';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useThemeColors } from '@/providers/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import {
  useInbox, getOrCreateConversation, Conversation,
  useUserSearch, FirestoreUser,
} from '@/hooks/useChat';
import { getDocs, query, collection, where } from 'firebase/firestore';
import { db } from '@/api/firebase';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTimestamp(iso: string | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

// ── Shimmer Skeleton ──────────────────────────────────────────────────────────

function SkeletonRow({ C }: { C: any }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(anim, { toValue: 0, duration: 900, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    ).start();
  }, [anim]);
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.9] });
  return (
    <Animated.View style={[skeletonStyles.row, { opacity }]}>
      <View style={[skeletonStyles.avatar, { backgroundColor: C.surfaceAlt }]} />
      <View style={skeletonStyles.lines}>
        <View style={[skeletonStyles.line, { width: '55%', backgroundColor: C.surfaceAlt }]} />
        <View style={[skeletonStyles.line, { width: '80%', height: 10, backgroundColor: C.surfaceAlt }]} />
      </View>
    </Animated.View>
  );
}
const skeletonStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  lines: { flex: 1, gap: 10 },
  line: { height: 13, borderRadius: 6 },
});

// ── Avatar Helper ─────────────────────────────────────────────────────────────

function UserAvatar({ photoUrl, name, size = 56, C }: { photoUrl?: string; name?: string; size?: number; C: any }) {
  if (photoUrl) return <Image source={{ uri: photoUrl }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: C.accent, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#fff', fontSize: size * 0.38, fontWeight: '700' }}>
        {(name ?? '?')[0].toUpperCase()}
      </Text>
    </View>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ChatInboxScreen() {
  const C = useThemeColors();
  const { user } = useAuth();
  const myId = user?.id ?? null;

  const { conversations, loading } = useInbox(myId);

  const [search, setSearch] = useState('');
  const [newChatModal, setNewChatModal] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [startingChat, setStartingChat] = useState<string | null>(null);

  // Live Firestore user search for New Chat modal
  const { users: foundUsers, loading: usersLoading } = useUserSearch(userSearch, myId);

  // Cache of partnerId → FirestoreUser for the conversation list
  const [partnerCache, setPartnerCache] = useState<Record<string, FirestoreUser>>({});

  // Fetch partner profiles for all conversations
  useEffect(() => {
    if (!myId || conversations.length === 0) return;
    const partnerIds = conversations
      .map((c) => c.participant_ids.find((id) => id !== myId))
      .filter(Boolean) as string[];

    const missing = partnerIds.filter((id) => !partnerCache[id]);
    if (missing.length === 0) return;

    // Fetch missing profiles from Firestore
    Promise.all(
      missing.map(async (pid) => {
        try {
          const snap = await getDocs(
            query(collection(db, 'users'), where('id', '==', pid))
          );
          if (!snap.empty) return snap.docs[0].data() as FirestoreUser;
        } catch { }
        return null;
      })
    ).then((results) => {
      const updates: Record<string, FirestoreUser> = {};
      results.forEach((u, i) => { if (u) updates[missing[i]] = u; });
      if (Object.keys(updates).length > 0) {
        setPartnerCache((prev) => ({ ...prev, ...updates }));
      }
    });
  }, [conversations, myId]);

  const getPartner = (conv: Conversation): FirestoreUser | undefined => {
    const partnerId = conv.participant_ids.find((id) => id !== myId);
    return partnerId ? partnerCache[partnerId] : undefined;
  };

  // Filter conversation list by partner name
  const filteredConversations = conversations.filter((conv) => {
    if (!search.trim()) return true;
    const partner = getPartner(conv);
    return partner?.name?.toLowerCase().includes(search.toLowerCase());
  });

  const openOrCreateChat = useCallback(async (chatUser: FirestoreUser) => {
    if (!myId) return;
    setStartingChat(chatUser.id);
    const convId = await getOrCreateConversation(myId, chatUser.id);
    setStartingChat(null);
    setNewChatModal(false);
    if (convId) {
      router.push({ pathname: '/chat/[userId]', params: { userId: chatUser.id } });
    }
  }, [myId]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.background }]}>
      {/* ── Header ── */}
      <View style={[styles.header, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: C.text }]}>Messages</Text>
        <TouchableOpacity
          style={[styles.composeBtn, { backgroundColor: C.accentLight }]}
          onPress={() => setNewChatModal(true)}
        >
          <Edit3 size={18} color={C.accent} />
        </TouchableOpacity>
      </View>

      {/* ── Search bar ── */}
      <View style={[styles.searchWrap, { borderBottomColor: C.border }]}>
        <View style={[styles.searchBar, { backgroundColor: C.surfaceAlt }]}>
          <Search size={16} color={C.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: C.text }]}
            placeholder="Search conversations..."
            placeholderTextColor={C.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <X size={14} color={C.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Conversation List ── */}
      {loading ? (
        <View>{[0, 1, 2, 3].map((i) => <SkeletonRow key={i} C={C} />)}</View>
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={filteredConversations.length === 0 ? styles.emptyContainer : undefined}
          ItemSeparatorComponent={() => (
            <View style={[styles.separator, { backgroundColor: C.border, marginLeft: 86 }]} />
          )}
          renderItem={({ item }) => {
            const partner = getPartner(item);
            const isUnread = item.unread_count > 0;
            const isFromMe = item.last_message?.sender_id === myId;
            const partnerId = item.participant_ids.find((id) => id !== myId) ?? '';

            return (
              <TouchableOpacity
                style={[styles.convRow, { backgroundColor: C.surface }]}
                onPress={() => router.push({ pathname: '/chat/[userId]', params: { userId: partnerId } })}
                activeOpacity={0.75}
              >
                <View style={styles.avatarWrap}>
                  <UserAvatar photoUrl={partner?.photoUrl} name={partner?.name} C={C} />
                  <View style={[styles.onlineDot, { borderColor: C.surface }]} />
                </View>
                <View style={styles.convInfo}>
                  <View style={styles.convTop}>
                    <Text
                      style={[styles.partnerName, { color: C.text, fontWeight: isUnread ? '700' : '600' }]}
                      numberOfLines={1}
                    >
                      {partner?.name ?? 'Loading...'}
                    </Text>
                    <Text style={[styles.timestamp, { color: isUnread ? C.accent : C.textMuted }]}>
                      {formatTimestamp(item.last_message?.created_at ?? item.updated_at)}
                    </Text>
                  </View>
                  <View style={styles.convBottom}>
                    <Text
                      style={[
                        styles.preview,
                        { color: isUnread ? C.text : C.textMuted, fontWeight: isUnread ? '600' : '400' },
                      ]}
                      numberOfLines={1}
                    >
                      {isFromMe
                        ? `You: ${item.last_message?.text ?? ''}`
                        : (item.last_message?.text ?? 'Start a conversation')}
                    </Text>
                    {isUnread && (
                      <View style={[styles.unreadBadge, { backgroundColor: C.accent }]}>
                        <Text style={styles.unreadText}>{item.unread_count > 99 ? '99+' : item.unread_count}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={[styles.emptyIcon, { backgroundColor: C.accentLight }]}>
                <MessageCircle size={36} color={C.accent} />
              </View>
              <Text style={[styles.emptyTitle, { color: C.text }]}>No messages yet</Text>
              <Text style={[styles.emptySubtext, { color: C.textMuted }]}>
                Tap the compose button to start your first conversation
              </Text>
              <TouchableOpacity
                style={[styles.emptyBtn, { backgroundColor: C.accent }]}
                onPress={() => setNewChatModal(true)}
              >
                <Text style={styles.emptyBtnText}>Start a Chat</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* ── FAB ── */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: C.accent }]}
        onPress={() => setNewChatModal(true)}
      >
        <Plus size={24} color="#fff" />
      </TouchableOpacity>

      {/* ── New Chat Modal ── */}
      <Modal
        visible={newChatModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setNewChatModal(false)}
      >
        <SafeAreaView style={[styles.modal, { backgroundColor: C.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: C.border }]}>
            <TouchableOpacity onPress={() => setNewChatModal(false)}>
              <X size={22} color={C.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: C.text }]}>New Message</Text>
            <View style={{ width: 22 }} />
          </View>

          {/* Search */}
          <View style={[styles.searchWrap, { borderBottomColor: C.border }]}>
            <View style={[styles.searchBar, { backgroundColor: C.surfaceAlt }]}>
              <Search size={16} color={C.textMuted} />
              <TextInput
                style={[styles.searchInput, { color: C.text }]}
                placeholder="Search by name..."
                placeholderTextColor={C.textMuted}
                value={userSearch}
                onChangeText={setUserSearch}
                autoFocus
              />
            </View>
          </View>

          {usersLoading ? (
            <View style={styles.loaderWrap}>
              <ActivityIndicator color={C.accent} />
            </View>
          ) : (
            <FlatList
              data={foundUsers}
              keyExtractor={(u) => u.id}
              ItemSeparatorComponent={() => (
                <View style={[styles.separator, { backgroundColor: C.border, marginLeft: 72 }]} />
              )}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.userRow, { backgroundColor: C.surface }]}
                  onPress={() => openOrCreateChat(item)}
                  disabled={startingChat === item.id}
                >
                  <UserAvatar photoUrl={item.photoUrl} name={item.name} size={48} C={C} />
                  <View style={[styles.userInfo, { marginLeft: 14 }]}>
                    <Text style={[styles.userName, { color: C.text }]}>{item.name}</Text>
                    <Text style={[styles.userEmail, { color: C.textMuted }]} numberOfLines={1}>{item.email}</Text>
                  </View>
                  {startingChat === item.id ? (
                    <View style={[styles.actionBtn, { backgroundColor: C.accentLight }]}>
                      <Check size={14} color={C.accent} />
                    </View>
                  ) : (
                    <View style={[styles.actionBtn, { backgroundColor: C.accentLight }]}>
                      <MessageCircle size={16} color={C.accent} />
                    </View>
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyWrap}>
                  <User size={36} color={C.textMuted} />
                  <Text style={[styles.emptyTitle, { color: C.text, fontSize: 16 }]}>
                    {userSearch.trim() ? 'No users found' : 'No users yet'}
                  </Text>
                  <Text style={[styles.emptySubtext, { color: C.textMuted }]}>
                    {userSearch.trim()
                      ? 'Try a different name'
                      : 'Users will appear here once they sign up'}
                  </Text>
                </View>
              }
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1,
  },
  backBtn: { padding: 4, width: 32 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  composeBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  searchWrap: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: 24, paddingHorizontal: 14, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 15 },
  separator: { height: 1 },
  convRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  avatarWrap: { position: 'relative', marginRight: 14 },
  onlineDot: {
    position: 'absolute', bottom: 2, right: 2,
    width: 13, height: 13, borderRadius: 7,
    backgroundColor: '#30D158', borderWidth: 2.5,
  },
  convInfo: { flex: 1 },
  convTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  partnerName: { fontSize: 15, flex: 1, marginRight: 8 },
  timestamp: { fontSize: 12 },
  convBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  preview: { fontSize: 14, flex: 1, marginRight: 8 },
  unreadBadge: {
    minWidth: 20, height: 20, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5,
  },
  unreadText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  emptyContainer: { flex: 1 },
  emptyWrap: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingTop: 60, gap: 12, paddingHorizontal: 40,
  },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { fontSize: 20, fontWeight: '700' },
  emptySubtext: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  emptyBtn: { borderRadius: 24, paddingHorizontal: 28, paddingVertical: 12, marginTop: 8 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 54, height: 54, borderRadius: 27,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 8,
  },
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 17, fontWeight: '700' },
  loaderWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  userRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '600', marginBottom: 3 },
  userEmail: { fontSize: 13 },
  actionBtn: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
});
