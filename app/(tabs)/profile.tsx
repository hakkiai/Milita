import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
  Animated, Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CreditCard as Edit, Trophy, Calendar, MapPin, Users, Star,
  ChevronRight, Bell, Shield, MessageCircle, Sun, Moon, Smartphone,
  UserCheck, UserPlus, Settings,
} from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';
import { useState, useRef } from 'react';
import { useTheme, useThemeColors, ThemeMode } from '@/providers/ThemeProvider';
import { mockSocialUsers } from '@/utils/mockData';

const THEME_OPTIONS: { label: string; value: ThemeMode; Icon: any }[] = [
  { label: 'System', value: 'system', Icon: Smartphone },
  { label: 'Light', value: 'light', Icon: Sun },
  { label: 'Dark', value: 'dark', Icon: Moon },
];

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const C = useThemeColors();
  const { theme, setTheme } = useTheme();
  const [showThemePicker, setShowThemePicker] = useState(false);
  const themeAnim = useRef(new Animated.Value(0)).current;

  const followersCount = mockSocialUsers.filter((u) => u.isFollowingYou).length;
  const followingCount = mockSocialUsers.filter((u) => u.isFollowing).length;

  const firstName = user?.name?.split(' ')[0] ?? 'User';

  const toggleThemePicker = () => {
    const toValue = showThemePicker ? 0 : 1;
    setShowThemePicker(!showThemePicker);
    Animated.timing(themeAnim, {
      toValue,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  };

  const stats = [
    { label: 'Events\nJoined', value: '12', icon: Calendar },
    { label: 'Venues\nVisited', value: '8', icon: MapPin },
    { label: 'Meetups', value: '45', icon: Trophy },
    { label: 'Rating', value: '4.8', icon: Star },
  ];

  const themePickerHeight = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 62],
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <Text style={[styles.headerTitle, { color: C.text }]}>Profile</Text>
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: C.surfaceAlt }]}
          onPress={() => router.push('/profile/edit')}
        >
          <Settings size={20} color={C.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>

        {/* ── Avatar Card ─────────────────────────────────────────── */}
        <View style={[styles.card, styles.profileCard, { backgroundColor: C.surface }]}>
          <View style={styles.profileTop}>
            <View style={styles.avatarWrap}>
              {user?.photoUrl ? (
                <Image source={{ uri: user.photoUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarFallback, { backgroundColor: C.accent }]}>
                  <Text style={styles.avatarInitial}>{firstName.charAt(0)}</Text>
                </View>
              )}
              <View style={[styles.activeDot, { borderColor: C.surface }]} />
            </View>

            <View style={styles.profileMeta}>
              <Text style={[styles.userName, { color: C.text }]}>{user?.name ?? 'User'}</Text>
              <Text style={[styles.userEmail, { color: C.textMuted }]}>{user?.email}</Text>
              <View style={[styles.badge, { backgroundColor: C.successLight }]}>
                <Text style={[styles.badgeText, { color: C.success }]}>Active Member</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.editBtn, { backgroundColor: C.accentLight }]}
              onPress={() => router.push('/profile/edit')}
            >
              <Edit size={18} color={C.accent} />
            </TouchableOpacity>
          </View>

          {/* ── Followers / Following row ────────────────────── */}
          <View style={[styles.socialRow, { borderTopColor: C.border }]}>
            <TouchableOpacity
              style={styles.socialItem}
              onPress={() => router.push('/profile/followers')}
            >
              <Text style={[styles.socialCount, { color: C.text }]}>{followersCount}</Text>
              <Text style={[styles.socialLabel, { color: C.textMuted }]}>Followers</Text>
            </TouchableOpacity>
            <View style={[styles.socialDivider, { backgroundColor: C.border }]} />
            <TouchableOpacity
              style={styles.socialItem}
              onPress={() => router.push('/profile/following')}
            >
              <Text style={[styles.socialCount, { color: C.text }]}>{followingCount}</Text>
              <Text style={[styles.socialLabel, { color: C.textMuted }]}>Following</Text>
            </TouchableOpacity>
            <View style={[styles.socialDivider, { backgroundColor: C.border }]} />
            <View style={styles.socialItem}>
              <Text style={[styles.socialCount, { color: C.text }]}>45</Text>
              <Text style={[styles.socialLabel, { color: C.textMuted }]}>Meetups</Text>
            </View>
          </View>
        </View>

        {/* ── About Section ────────────────────────────────────────── */}
        <View style={[styles.card, { backgroundColor: C.surface }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.sectionTitle, { color: C.text }]}>About</Text>
            <TouchableOpacity onPress={() => router.push('/profile/edit')}>
              <Edit size={16} color={C.accent} />
            </TouchableOpacity>
          </View>
          {user?.bio ? (
            <Text style={[styles.bioText, { color: C.textSecondary }]}>{user.bio}</Text>
          ) : (
            <TouchableOpacity onPress={() => router.push('/profile/edit')}>
              <Text style={[styles.bioPlaceholder, { color: C.textMuted }]}>
                + Add a short bio about yourself…
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Stats Grid ───────────────────────────────────────────── */}
        <Text style={[styles.sectionHeading, { color: C.text }]}>Your Stats</Text>
        <View style={styles.statsGrid}>
          {stats.map((stat, i) => (
            <View key={i} style={[styles.statCard, { backgroundColor: C.surface }]}>
              <stat.icon size={22} color={C.accent} />
              <Text style={[styles.statValue, { color: C.text }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: C.textMuted }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Achievements ─────────────────────────────────────────── */}
        <Text style={[styles.sectionHeading, { color: C.text }]}>Achievements</Text>
        <View style={[styles.card, { backgroundColor: C.surface }]}>
          {[
            { icon: Trophy, color: '#FFD700', bg: '#FFF9E0', title: 'Top Connector', desc: 'Organized 3 meetups this month' },
            { icon: Users, color: C.accent, bg: C.accentLight, title: 'Regular Attendee', desc: 'Attended 10 meetups this month' },
          ].map((a, i, arr) => (
            <View
              key={i}
              style={[
                styles.achieveRow,
                { borderBottomColor: C.border, borderBottomWidth: i < arr.length - 1 ? 1 : 0 },
              ]}
            >
              <View style={[styles.achieveIcon, { backgroundColor: a.bg }]}>
                <a.icon size={18} color={a.color} />
              </View>
              <View style={styles.achieveInfo}>
                <Text style={[styles.achieveTitle, { color: C.text }]}>{a.title}</Text>
                <Text style={[styles.achieveDesc, { color: C.textMuted }]}>{a.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Settings Menu ────────────────────────────────────────── */}
        <Text style={[styles.sectionHeading, { color: C.text }]}>Settings</Text>
        <View style={[styles.card, styles.menuCard, { backgroundColor: C.surface, borderColor: C.border }]}>

          {/* Edit Profile */}
          <MenuItem
            icon={<Edit size={20} color={C.accent} />}
            label="Edit Profile"
            C={C}
            onPress={() => router.push('/profile/edit')}
          />

          {/* Messages */}
          <MenuItem
            icon={<MessageCircle size={20} color="#5B5BD6" />}
            label="Messages"
            C={C}
            onPress={() => router.push('/chat')}
            badgeCount={3}
          />

          {/* Followers */}
          <MenuItem
            icon={<UserCheck size={20} color="#30D158" />}
            label="Followers"
            C={C}
            onPress={() => router.push('/profile/followers')}
          />

          {/* Following */}
          <MenuItem
            icon={<UserPlus size={20} color="#FF6B35" />}
            label="Following"
            C={C}
            onPress={() => router.push('/profile/following')}
          />

          {/* Theme */}
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: C.border }]}
            onPress={toggleThemePicker}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconWrap, { backgroundColor: '#FFF4E0' }]}>
                <Sun size={18} color="#FF9500" />
              </View>
              <Text style={[styles.menuLabel, { color: C.text }]}>Theme</Text>
            </View>
            <View style={styles.menuRight}>
              <Text style={[styles.menuValue, { color: C.textMuted }]}>
                {THEME_OPTIONS.find((o) => o.value === theme)?.label}
              </Text>
              <ChevronRight size={16} color={C.textMuted} />
            </View>
          </TouchableOpacity>

          {/* Theme picker inline */}
          <Animated.View style={[styles.themePicker, { height: themePickerHeight, borderBottomColor: C.border }]}>
            <View style={styles.themePickerInner}>
              {THEME_OPTIONS.map((opt) => {
                const active = theme === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.themeOption,
                      {
                        backgroundColor: active ? C.accentLight : C.surfaceAlt,
                        borderColor: active ? C.accent : 'transparent',
                      },
                    ]}
                    onPress={() => { setTheme(opt.value); setShowThemePicker(false); }}
                  >
                    <opt.Icon size={14} color={active ? C.accent : C.textMuted} />
                    <Text
                      style={[styles.themeOptionText, { color: active ? C.accent : C.textMuted }]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>

          {/* Notifications */}
          <MenuItem icon={<Bell size={20} color="#FF9500" />} label="Notifications" C={C} onPress={() => {}} />

          {/* Privacy */}
          <MenuItem icon={<Shield size={20} color="#5B5BD6" />} label="Privacy & Security" C={C} onPress={() => {}} isLast />
        </View>

        {/* ── Log Out ──────────────────────────────────────────────── */}
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: C.surface }]}
          onPress={signOut}
        >
          <Text style={[styles.logoutText, { color: C.danger }]}>Log Out</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Shared MenuItem Component ────────────────────────────────────────────────
function MenuItem({
  icon, label, C, onPress, badgeCount, isLast, value,
}: {
  icon: React.ReactNode;
  label: string;
  C: any;
  onPress: () => void;
  badgeCount?: number;
  isLast?: boolean;
  value?: string;
}) {
  return (
    <TouchableOpacity
      style={[styles.menuItem, { borderBottomColor: C.border, borderBottomWidth: isLast ? 0 : 1 }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuLeft}>
        <View style={[styles.menuIconWrap, { backgroundColor: C.surfaceAlt }]}>{icon}</View>
        <Text style={[styles.menuLabel, { color: C.text }]}>{label}</Text>
      </View>
      <View style={styles.menuRight}>
        {badgeCount ? (
          <View style={[styles.badge2, { backgroundColor: C.accent }]}>
            <Text style={styles.badge2Text}>{badgeCount}</Text>
          </View>
        ) : null}
        {value ? <Text style={[styles.menuValue, { color: C.textMuted }]}>{value}</Text> : null}
        <ChevronRight size={16} color={C.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1, paddingHorizontal: 16 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  iconBtn: { padding: 8, borderRadius: 12 },

  // Card base
  card: {
    borderRadius: 16, padding: 16, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },

  // Profile card
  profileCard: { padding: 20, paddingBottom: 0, marginTop: 20 },
  profileTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatarWrap: { position: 'relative', marginRight: 14 },
  avatar: { width: 76, height: 76, borderRadius: 38 },
  avatarFallback: {
    width: 76, height: 76, borderRadius: 38,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarInitial: { fontSize: 30, fontWeight: '700', color: '#fff' },
  activeDot: {
    position: 'absolute', bottom: 3, right: 3,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#30D158', borderWidth: 2,
  },
  profileMeta: { flex: 1 },
  userName: { fontSize: 19, fontWeight: '700', marginBottom: 2 },
  userEmail: { fontSize: 13, marginBottom: 8 },
  badge: { alignSelf: 'flex-start', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  editBtn: { padding: 10, borderRadius: 12 },

  // Social row
  socialRow: {
    flexDirection: 'row', borderTopWidth: 1, paddingTop: 14, paddingBottom: 16,
  },
  socialItem: { flex: 1, alignItems: 'center', gap: 2 },
  socialDivider: { width: 1, marginVertical: 4 },
  socialCount: { fontSize: 20, fontWeight: '700' },
  socialLabel: { fontSize: 12 },

  // Bio
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  bioText: { fontSize: 15, lineHeight: 22 },
  bioPlaceholder: { fontSize: 14, fontStyle: 'italic' },

  // Stats
  sectionHeading: { fontSize: 18, fontWeight: '700', marginBottom: 12, marginTop: 6 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 14 },
  statCard: {
    flex: 1, minWidth: 120, borderRadius: 14, padding: 14, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2,
  },
  statValue: { fontSize: 22, fontWeight: '700', marginTop: 6 },
  statLabel: { fontSize: 11, marginTop: 3, textAlign: 'center' },

  // Achievements
  achieveRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  achieveIcon: {
    width: 38, height: 38, borderRadius: 19,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  achieveInfo: { flex: 1 },
  achieveTitle: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  achieveDesc: { fontSize: 13 },

  // Menu
  menuCard: { padding: 0, overflow: 'hidden' },
  menuItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  menuIconWrap: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { fontSize: 15, fontWeight: '500' },
  menuValue: { fontSize: 13 },
  badge2: { borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  badge2Text: { color: '#fff', fontSize: 11, fontWeight: '700' },

  // Theme picker
  themePicker: { overflow: 'hidden' },
  themePickerInner: {
    flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingBottom: 14,
  },
  themeOption: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, borderRadius: 20, paddingVertical: 8, borderWidth: 1.5,
  },
  themeOptionText: { fontSize: 13, fontWeight: '600' },

  // Logout
  logoutBtn: {
    borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2,
  },
  logoutText: { fontSize: 16, fontWeight: '700' },
});