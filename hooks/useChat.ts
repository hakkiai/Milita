import { useState, useEffect, useRef, useCallback } from 'react';
import {
  collection, doc, query, where, orderBy, addDoc,
  updateDoc, onSnapshot, getDocs, serverTimestamp,
  Timestamp, writeBatch,
} from 'firebase/firestore';
import {
  ref as rtdbRef, onValue, set, serverTimestamp as rtdbTimestamp,
  onDisconnect,
} from 'firebase/database';
import { db, rtdb } from '@/api/firebase';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  participant_ids: string[];
  created_at: string;
  updated_at: string;
  last_message?: ChatMessage;
  unread_count: number;
}

export interface FirestoreUser {
  id: string;
  name: string;
  email: string;
  photoUrl: string;
  updatedAt: string;
}

// ── Firestore collection refs ─────────────────────────────────────────────────
const convCol = () => collection(db, 'conversations');
const msgCol = () => collection(db, 'messages');
const usersCol = () => collection(db, 'users');

// ── Hook: Search users by name ────────────────────────────────────────────────

export function useUserSearch(searchText: string, myId: string | null) {
  const [users, setUsers] = useState<FirestoreUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const text = searchText.trim();

    // Load all users when search is empty, filter locally
    setLoading(true);
    const q = query(usersCol(), orderBy('name'));
    getDocs(q)
      .then((snap) => {
        const all = snap.docs
          .map((d) => d.data() as FirestoreUser)
          .filter((u) => u.id !== myId); // exclude self

        if (!text) {
          setUsers(all);
        } else {
          const lower = text.toLowerCase();
          setUsers(all.filter((u) => u.name.toLowerCase().includes(lower)));
        }
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [searchText, myId]);

  return { users, loading };
}


// ── Helpers ───────────────────────────────────────────────────────────────────

function tsToISO(ts: any): string {
  if (!ts) return new Date().toISOString();
  if (ts instanceof Timestamp) return ts.toDate().toISOString();
  if (typeof ts === 'string') return ts;
  return new Date().toISOString();
}

/** Find or create a 1-on-1 conversation between two Clerk user IDs */
export async function getOrCreateConversation(
  myId: string,
  otherId: string
): Promise<string | null> {
  try {
    const participants = [myId, otherId].sort();

    // Search for existing conversation
    const q = query(
      convCol(),
      where('participant_ids', 'array-contains', myId)
    );
    const snap = await getDocs(q);
    const existing = snap.docs.find((d) => {
      const ids: string[] = d.data().participant_ids ?? [];
      return ids.length === 2 && ids.includes(otherId);
    });
    if (existing) return existing.id;

    // Create new
    const docRef = await addDoc(convCol(), {
      participant_ids: participants,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    return docRef.id;
  } catch (e) {
    console.error('getOrCreateConversation error', e);
    return null;
  }
}

/** Insert a new message and update conversation with last_message + unread_counts */
export async function sendChatMessage(
  conversationId: string,
  senderId: string,
  text: string,
  participantIds: string[]
): Promise<boolean> {
  try {
    const batch = writeBatch(db);
    const now = serverTimestamp();
    const msgRef = doc(msgCol());

    // Write the message
    batch.set(msgRef, {
      conversation_id: conversationId,
      sender_id: senderId,
      text,
      is_read: false,
      created_at: now,
    });

    // Build unread increment — add 1 for every participant except sender
    const unreadIncrements: Record<string, number> = {};
    participantIds.forEach((pid) => {
      if (pid !== senderId) unreadIncrements[`unread_counts.${pid}`] = 1;
    });

    // Update conversation: last_message snapshot + updated_at + increment unread
    const convRef = doc(convCol(), conversationId);
    batch.update(convRef, {
      updated_at: now,
      last_message: { id: msgRef.id, sender_id: senderId, text, is_read: false, created_at: now },
      ...unreadIncrements,
    });

    await batch.commit();
    return true;
  } catch (e) {
    console.error('sendChatMessage error', e);
    return false;
  }
}

/** Reset unread count for myId on a conversation */
export async function markConversationRead(
  conversationId: string,
  myId: string
): Promise<void> {
  try {
    const convRef = doc(convCol(), conversationId);
    await updateDoc(convRef, { [`unread_counts.${myId}`]: 0 });
  } catch (e) {
    console.error('markConversationRead error', e);
  }
}

// ── Hook: Inbox ────────────────────────────────────────────────────────────────

export function useInbox(myId: string | null) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!myId) { setLoading(false); return; }

    // Single query — no sub-queries needed. last_message and unread_counts
    // are stored directly on the conversation doc by sendChatMessage.
    const q = query(
      convCol(),
      where('participant_ids', 'array-contains', myId),
      orderBy('updated_at', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const convs: Conversation[] = snap.docs.map((convDoc) => {
        const d = convDoc.data();
        const lm = d.last_message;
        const last_message: ChatMessage | undefined = lm
          ? {
              id: lm.id ?? '',
              conversation_id: convDoc.id,
              sender_id: lm.sender_id ?? '',
              text: lm.text ?? '',
              is_read: lm.is_read ?? false,
              created_at: tsToISO(lm.created_at),
            }
          : undefined;

        const unreadCounts: Record<string, number> = d.unread_counts ?? {};
        const unread_count = unreadCounts[myId] ?? 0;

        return {
          id: convDoc.id,
          participant_ids: d.participant_ids ?? [],
          created_at: tsToISO(d.created_at),
          updated_at: tsToISO(d.updated_at),
          last_message,
          unread_count,
        };
      });
      setConversations(convs);
      setLoading(false);
    }, (e) => {
      console.error('inbox error', e);
      setLoading(false);
    });

    return () => unsub();
  }, [myId]);

  const refetch = useCallback(() => {}, []);
  return { conversations, loading, refetch };
}

// ── Hook: Conversation ─────────────────────────────────────────────────────────

export function useConversation(conversationId: string | null, myId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [partnerTyping, setPartnerTyping] = useState(false);

  useEffect(() => {
    if (!conversationId || !myId) { setLoading(false); return; }

    // ── Firestore: live message stream ──────────────────────────────────────
    const q = query(
      msgCol(),
      where('conversation_id', '==', conversationId),
      orderBy('created_at', 'asc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const msgs: ChatMessage[] = snap.docs.map((d) => ({
        id: d.id,
        conversation_id: d.data().conversation_id,
        sender_id: d.data().sender_id,
        text: d.data().text,
        is_read: d.data().is_read ?? false,
        created_at: tsToISO(d.data().created_at),
      }));
      setMessages(msgs);
      setLoading(false);
      // Mark as read
      markConversationRead(conversationId, myId);
    });

    // ── RTDB: typing presence ───────────────────────────────────────────────
    const typingPath = rtdbRef(rtdb, `typing/${conversationId}`);
    const typingUnsub = onValue(typingPath, (snapshot) => {
      const val = snapshot.val() ?? {};
      const isPartnerTyping = Object.entries(val).some(
        ([uid, data]: [string, any]) => uid !== myId && data?.typing === true
      );
      setPartnerTyping(isPartnerTyping);
    });

    // ── RTDB: own online/presence ───────────────────────────────────────────
    const myOnlineRef = rtdbRef(rtdb, `online/${myId}`);
    set(myOnlineRef, { online: true, last_seen: rtdbTimestamp() });
    onDisconnect(myOnlineRef).set({ online: false, last_seen: rtdbTimestamp() });

    return () => {
      unsub();
      typingUnsub();
    };
  }, [conversationId, myId]);

  // Broadcast typing to RTDB
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const broadcastTyping = useCallback(() => {
    if (!conversationId || !myId) return;
    const typingRef = rtdbRef(rtdb, `typing/${conversationId}/${myId}`);
    set(typingRef, { typing: true });
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      set(typingRef, { typing: false });
    }, 3000);
  }, [conversationId, myId]);

  return { messages, loading, partnerTyping, broadcastTyping };
}

// ── Hook: Total Unread Count ───────────────────────────────────────────────────

export function useTotalUnread(myId: string | null): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!myId) { setCount(0); return; }

    // Listen to all conversations where I am a participant
    const convQ = query(
      convCol(),
      where('participant_ids', 'array-contains', myId)
    );

    const unsub = onSnapshot(convQ, (snap) => {
      let total = 0;
      snap.docs.forEach((convDoc) => {
        const unreadCounts: Record<string, number> = convDoc.data().unread_counts ?? {};
        total += unreadCounts[myId] ?? 0;
      });
      setCount(total);
    });

    return () => unsub();
  }, [myId]);

  return count;
}

// ── Hook: Online status of a specific user ─────────────────────────────────────

export function useOnlineStatus(userId: string | null): boolean {
  const [online, setOnline] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const ref = rtdbRef(rtdb, `online/${userId}`);
    const unsub = onValue(ref, (snap) => {
      setOnline(snap.val()?.online === true);
    });
    return () => unsub();
  }, [userId]);

  return online;
}
