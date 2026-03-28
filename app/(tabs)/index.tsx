import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Bell, Plus, MapPin, Calendar, Users, X } from 'lucide-react-native';
import { CourtCard } from '@/components/CourtCard';
import { EventCard } from '@/components/EventCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { mockCourts, mockEvents } from '@/utils/mockData';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import { useState, useMemo } from 'react';
import { Court } from '@/types/courts';

export default function HomeScreen() {
  const { user, isLoaded } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);

  const firstName = user?.name?.split(' ')[0] ?? 'Explorer';

  const filteredCourts = useMemo<Court[]>(() => {
    if (!searchQuery.trim()) return mockCourts;
    const q = searchQuery.toLowerCase();
    return mockCourts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.location.address.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q)) ||
        c.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return mockEvents;
    const q = searchQuery.toLowerCase();
    return mockEvents.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  if (!isLoaded) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      {searchVisible ? (
        <View style={styles.searchHeader}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search venues, events, tags..."
            placeholderTextColor="#aaa"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            returnKeyType="search"
          />
          <TouchableOpacity
            style={styles.searchClose}
            onPress={() => { setSearchVisible(false); setSearchQuery(''); }}
          >
            <X size={20} color="#666" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{firstName} 👋</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton} onPress={() => setSearchVisible(true)}>
              <Search size={24} color="#1A1A1A" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Bell size={24} color="#1A1A1A" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Search results banner */}
        {searchQuery.trim() ? (
          <View style={styles.searchBanner}>
            <Text style={styles.searchBannerText}>
              {filteredCourts.length + filteredEvents.length} results for "{searchQuery}"
            </Text>
          </View>
        ) : (
          /* Quick Stats */
          <View style={styles.quickStats}>
            <View style={styles.statCard}>
              <MapPin size={20} color="#FF6B35" />
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Venues Nearby</Text>
            </View>
            <View style={styles.statCard}>
              <Calendar size={20} color="#FF6B35" />
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Events Today</Text>
            </View>
            <View style={styles.statCard}>
              <Users size={20} color="#FF6B35" />
              <Text style={styles.statNumber}>28</Text>
              <Text style={styles.statLabel}>People Online</Text>
            </View>
          </View>
        )}

        {/* Venues Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {searchQuery.trim() ? 'Matching Venues' : 'Venues Near You'}
            </Text>
            {!searchQuery.trim() && (
              <TouchableOpacity>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            )}
          </View>
          {filteredCourts.length === 0 ? (
            <Text style={styles.emptyText}>No venues match your search.</Text>
          ) : (
            filteredCourts.slice(0, searchQuery.trim() ? undefined : 2).map((court) => (
              <CourtCard
                key={court.id}
                court={court}
                onPress={() => router.push({ pathname: '/venue/[id]', params: { id: court.id } })}
              />
            ))
          )}
        </View>

        {/* Events Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {searchQuery.trim() ? 'Matching Events' : 'Upcoming Events'}
            </Text>
            {!searchQuery.trim() && (
              <TouchableOpacity>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            )}
          </View>
          {filteredEvents.length === 0 ? (
            <Text style={styles.emptyText}>No events match your search.</Text>
          ) : (
            filteredEvents.slice(0, searchQuery.trim() ? undefined : 2).map((event) => (
              <EventCard key={event.id} event={event} onPress={() => {}} />
            ))
          )}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/(tabs)/add-court')}>
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  searchClose: { padding: 8, marginLeft: 8 },
  searchBanner: {
    backgroundColor: '#FFF4F0',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FFD9C7',
  },
  searchBannerText: { color: '#FF6B35', fontWeight: '600', fontSize: 14 },
  greeting: { fontSize: 16, color: '#666' },
  userName: { fontSize: 24, fontWeight: '700', color: '#1A1A1A' },
  headerActions: { flexDirection: 'row', gap: 12 },
  iconButton: { padding: 8, borderRadius: 12, backgroundColor: '#F8F9FA' },
  content: { flex: 1, paddingHorizontal: 20 },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: { fontSize: 24, fontWeight: '700', color: '#1A1A1A', marginTop: 8 },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4, textAlign: 'center' },
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#1A1A1A' },
  seeAll: { fontSize: 14, color: '#FF6B35', fontWeight: '600' },
  emptyText: { color: '#aaa', fontSize: 14, textAlign: 'center', paddingVertical: 24 },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});