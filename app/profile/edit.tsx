import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, Camera, User } from 'lucide-react-native';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUser } from '@clerk/clerk-expo';
import { useThemeColors } from '@/providers/ThemeProvider';

export default function EditProfileScreen() {
  const { user } = useAuth();
  const { user: clerkUser } = useUser();
  const C = useThemeColors();

  const [name, setName] = useState(user?.name ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Name cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      const parts = name.trim().split(' ');
      const firstName = parts[0];
      const lastName = parts.slice(1).join(' ') || '';
      await clerkUser?.update({ firstName, lastName });
      await clerkUser?.update({
        unsafeMetadata: { ...clerkUser.unsafeMetadata, bio: bio.trim() },
      });
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: C.text }]}>Edit Profile</Text>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: C.accent }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            {user?.photoUrl ? (
              <Image source={{ uri: user.photoUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarFallback, { backgroundColor: C.accent }]}>
                <User size={40} color="#fff" />
              </View>
            )}
            <View style={[styles.cameraOverlay, { backgroundColor: C.accent }]}>
              <Camera size={14} color="#fff" />
            </View>
          </View>
          <Text style={[styles.avatarHint, { color: C.textMuted }]}>
            Profile picture is managed via Clerk
          </Text>
        </View>

        {/* Name */}
        <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Text style={[styles.label, { color: C.textMuted }]}>Display Name</Text>
          <TextInput
            style={[styles.input, { color: C.text, borderBottomColor: C.border }]}
            value={name}
            onChangeText={setName}
            placeholder="Your full name"
            placeholderTextColor={C.textMuted}
            returnKeyType="next"
          />
        </View>

        {/* Bio */}
        <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: C.textMuted }]}>About You</Text>
            <Text style={[styles.charCount, { color: bio.length > 140 ? '#FF453A' : C.textMuted }]}>
              {bio.length}/150
            </Text>
          </View>
          <TextInput
            style={[styles.bioInput, { color: C.text }]}
            value={bio}
            onChangeText={(t) => t.length <= 150 && setBio(t)}
            placeholder="Tell people a bit about yourself..."
            placeholderTextColor={C.textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Email (read-only) */}
        <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Text style={[styles.label, { color: C.textMuted }]}>Email</Text>
          <Text style={[styles.readOnly, { color: C.textSecondary }]}>{user?.email}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 18, fontWeight: '700' },
  saveBtn: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  content: { paddingHorizontal: 20, paddingTop: 10 },
  avatarSection: { alignItems: 'center', paddingVertical: 28 },
  avatarWrap: { position: 'relative', marginBottom: 10 },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  avatarFallback: {
    width: 96, height: 96, borderRadius: 48,
    justifyContent: 'center', alignItems: 'center',
  },
  cameraOverlay: {
    position: 'absolute', bottom: 0, right: 0,
    width: 30, height: 30, borderRadius: 15,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  avatarHint: { fontSize: 12 },
  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
  },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  charCount: { fontSize: 12 },
  input: {
    fontSize: 16,
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  bioInput: {
    fontSize: 15,
    lineHeight: 22,
    minHeight: 90,
  },
  readOnly: { fontSize: 16, paddingVertical: 4 },
});
