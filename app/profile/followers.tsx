import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useState } from 'react';
import { mockSocialUsers, SocialUser } from '@/utils/mockData';
import { useThemeColors } from '@/providers/ThemeProvider';

export default function FollowersScreen() {
  const C = useThemeColors();
  const initialFollowers = mockSocialUsers.filter((u) => u.isFollowingYou);
  const [followers, setFollowers] = useState<(SocialUser & { followedBack: boolean })[]>(
    initialFollowers.map((u) => ({ ...u, followedBack: u.isFollowing }))
  );

  const toggleFollow = (id: string) => {
    setFollowers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, followedBack: !u.followedBack } : u))
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.background }]}>
      <View style={[styles.header, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: C.text }]}>Followers</Text>
        <View style={{ width: 32 }} />
      </View>

      <FlatList
        data={followers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: C.border }]} />}
        renderItem={({ item }) => (
          <View style={[styles.row, { backgroundColor: C.surface }]}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.info}>
              <Text style={[styles.name, { color: C.text }]}>{item.name}</Text>
              <Text style={[styles.bio, { color: C.textMuted }]} numberOfLines={1}>{item.bio}</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.btn,
                item.followedBack
                  ? { backgroundColor: C.surfaceAlt, borderColor: C.border, borderWidth: 1 }
                  : { backgroundColor: C.accent },
              ]}
              onPress={() => toggleFollow(item.id)}
            >
              <Text
                style={[styles.btnText, { color: item.followedBack ? C.text : '#fff' }]}
              >
                {item.followedBack ? 'Following' : 'Follow Back'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: C.textMuted }]}>No followers yet.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 18, fontWeight: '700' },
  list: { paddingVertical: 8 },
  separator: { height: 1, marginLeft: 76 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  info: { flex: 1, marginRight: 10 },
  name: { fontSize: 15, fontWeight: '600', marginBottom: 3 },
  bio: { fontSize: 13 },
  btn: {
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, minWidth: 100,
    alignItems: 'center',
  },
  btnText: { fontSize: 13, fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 60, fontSize: 15 },
});
