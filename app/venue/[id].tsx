import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { mockCourts } from '@/utils/mockData';
import { MapPin, Star, Users, Clock, ChevronLeft, CheckCircle, Tag, Phone, Globe } from 'lucide-react-native';

const DAY_LABELS: { [key: string]: string } = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed',
  thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
};

export default function VenueDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const venue = mockCourts.find((c) => c.id === id);

  if (!venue) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Venue not found.</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backPill}>
            <Text style={styles.backPillText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const hoursEntries = Object.entries(venue.openingHours).filter(([k]) => k !== 'alwaysOpen');

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroWrap}>
          <Image source={{ uri: venue.images?.[0] }} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.heroOverlay} />

          {/* Back button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ChevronLeft size={22} color="#fff" />
          </TouchableOpacity>

          {/* Badge */}
          {venue.verified && (
            <View style={styles.verifiedBadge}>
              <CheckCircle size={14} color="#fff" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}

          {/* Title overlay */}
          <View style={styles.heroTitle}>
            <Text style={styles.heroName}>{venue.name}</Text>
            <View style={styles.heroRow}>
              <MapPin size={14} color="#fff" />
              <Text style={styles.heroAddress} numberOfLines={1}>{venue.location.address}</Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.body}>
          {/* Key Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <Star size={16} color="#FFD700" />
              <Text style={styles.statValue}>{venue.rating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statChip}>
              <Users size={16} color="#FF6B35" />
              <Text style={styles.statValue}>{venue.checkedInUsers.length}</Text>
              <Text style={styles.statLabel}>Checked In</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statChip}>
              <Users size={16} color="#5B5BD6" />
              <Text style={styles.statValue}>{venue.followers.length}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
          </View>

          {/* About */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>About</Text>
            <Text style={styles.description}>{venue.description}</Text>
          </View>

          {/* Tags */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Tag size={16} color="#FF6B35" />
              <Text style={styles.cardTitle}>Features</Text>
            </View>
            <View style={styles.tagsWrap}>
              {venue.tags.map((tag, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Opening Hours */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Clock size={16} color="#FF6B35" />
              <Text style={styles.cardTitle}>Opening Hours</Text>
            </View>
            {venue.openingHours.alwaysOpen ? (
              <View style={styles.openAllDay}>
                <Text style={styles.openAllDayText}>🟢 Open 24 / 7</Text>
              </View>
            ) : (
              hoursEntries.map(([day, hours]: [string, any]) => (
                <View key={day} style={styles.hoursRow}>
                  <Text style={styles.hoursDay}>{DAY_LABELS[day]}</Text>
                  <Text style={styles.hoursTime}>
                    {hours.alwaysOpen ? '24h' : `${hours.openTime} – ${hours.closeTime}`}
                  </Text>
                </View>
              ))
            )}
          </View>

          {/* Additional images */}
          {venue.images.length > 1 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Gallery</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {venue.images.slice(1).map((img, i) => (
                  <Image key={i} source={{ uri: img }} style={styles.galleryImage} resizeMode="cover" />
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      {/* CTA bottom bar */}
      <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
        <TouchableOpacity style={styles.ctaButton}>
          <Text style={styles.ctaText}>Check In Here 📍</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.followButton}>
          <Text style={styles.followText}>Follow</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFoundText: { fontSize: 18, color: '#666', marginBottom: 16 },
  backPill: { backgroundColor: '#FF6B35', borderRadius: 20, paddingHorizontal: 24, paddingVertical: 10 },
  backPillText: { color: '#fff', fontWeight: '600' },

  heroWrap: { position: 'relative', height: 300 },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  backBtn: {
    position: 'absolute', top: 52, left: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20, padding: 8,
  },
  verifiedBadge: {
    position: 'absolute', top: 56, right: 16,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#28A745',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
  },
  verifiedText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  heroTitle: { position: 'absolute', bottom: 20, left: 16, right: 16 },
  heroName: { fontSize: 26, fontWeight: '700', color: '#fff', marginBottom: 4 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroAddress: { color: 'rgba(255,255,255,0.85)', fontSize: 13, flex: 1 },

  body: { paddingHorizontal: 16, paddingBottom: 100 },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statChip: { flex: 1, alignItems: 'center', gap: 2 },
  statDivider: { width: 1, backgroundColor: '#F0F0F0' },
  statValue: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginTop: 4 },
  statLabel: { fontSize: 12, color: '#666' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 10 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  description: { fontSize: 14, color: '#555', lineHeight: 22 },

  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    backgroundColor: '#FFF4F0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#FFD9C7',
  },
  tagText: { fontSize: 12, color: '#FF6B35', fontWeight: '600' },

  openAllDay: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  openAllDayText: { fontSize: 14, fontWeight: '600', color: '#2E7D32' },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  hoursDay: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', width: 40 },
  hoursTime: { fontSize: 14, color: '#555' },

  galleryImage: { width: 160, height: 110, borderRadius: 12, marginRight: 10 },

  bottomBar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  ctaButton: {
    flex: 1,
    backgroundColor: '#FF6B35',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  followButton: {
    borderWidth: 2,
    borderColor: '#FF6B35',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  followText: { color: '#FF6B35', fontWeight: '700', fontSize: 15 },
});
