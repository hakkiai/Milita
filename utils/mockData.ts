import { Court } from '@/types/courts';
import { Event } from '@/types/event';
import { User } from '@/types/user';
import { Club } from '@/types/club';

export const mockUser: User = {
  id: '1',
  email: 'john.doe@example.com',
  name: 'John Doe',
  avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
  createdAt: new Date().toISOString(),
  over18: true,
  clubs: [],
  courtHistory: [],
  badges: [],
};

export const mockCourts: Court[] = [
  {
    id: '1',
    name: 'Cubbon Park',
    description: 'A vast, lush urban park in the heart of Bangalore — ideal for outdoor meetups, morning yoga, photography walks, and casual picnics.',
    location: {
      latitude: 12.9763,
      longitude: 77.5929,
      geohash: '',
      address: 'Kasturba Road, Sampangi Rama Nagar, Bengaluru, Karnataka 560001',
    },
    images: [
      'https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1005417/pexels-photo-1005417.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    tags: ['Outdoor', 'Free', 'Pet Friendly', 'Wheelchair Accessible', 'Metro Accessible'],
    checkedInUsers: ['1', '2'],
    followers: ['1', '2', '3'],
    createdBy: '1',
    createdAt: new Date().toISOString(),
    rating: 4.7,
    reviews: [],
    openingHours: {
      alwaysOpen: true,
      monday: { alwaysOpen: true, openTime: '', closeTime: '' },
      tuesday: { alwaysOpen: true, openTime: '', closeTime: '' },
      wednesday: { alwaysOpen: true, openTime: '', closeTime: '' },
      thursday: { alwaysOpen: true, openTime: '', closeTime: '' },
      friday: { alwaysOpen: true, openTime: '', closeTime: '' },
      saturday: { alwaysOpen: true, openTime: '', closeTime: '' },
      sunday: { alwaysOpen: true, openTime: '', closeTime: '' },
    },
    verified: true,
  },
  {
    id: '2',
    name: 'Koramangala Social Hub',
    description: 'A vibrant co-working and community space in Koramangala, perfect for tech meetups, workshops, and networking events.',
    location: {
      latitude: 12.9352,
      longitude: 77.6245,
      geohash: '',
      address: '5th Block, Koramangala, Bengaluru, Karnataka 560095',
    },
    images: [
      'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    tags: ['Indoor', 'Café Nearby', 'Metro Accessible', 'Seating', 'Lighting'],
    checkedInUsers: ['3'],
    followers: ['1', '4'],
    createdBy: '2',
    createdAt: new Date().toISOString(),
    rating: 4.4,
    reviews: [],
    openingHours: {
      alwaysOpen: false,
      monday: { alwaysOpen: false, openTime: '09:00', closeTime: '21:00' },
      tuesday: { alwaysOpen: false, openTime: '09:00', closeTime: '21:00' },
      wednesday: { alwaysOpen: false, openTime: '09:00', closeTime: '21:00' },
      thursday: { alwaysOpen: false, openTime: '09:00', closeTime: '21:00' },
      friday: { alwaysOpen: false, openTime: '09:00', closeTime: '22:00' },
      saturday: { alwaysOpen: false, openTime: '10:00', closeTime: '22:00' },
      sunday: { alwaysOpen: false, openTime: '10:00', closeTime: '20:00' },
    },
    verified: false,
  },
  {
    id: '3',
    name: 'Indiranagar Rooftop Lounge',
    description: 'A chic rooftop social space in the heart of Indiranagar, perfect for evening gatherings, casual drinks, live acoustic sessions, and sunset city views.',
    location: {
      latitude: 12.9784,
      longitude: 77.6408,
      geohash: '',
      address: '100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038',
    },
    images: [
      'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2079438/pexels-photo-2079438.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1537634/pexels-photo-1537634.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    tags: ['Rooftop', 'Evening', 'Live Music', 'City View', 'Networking'],
    checkedInUsers: ['2', '4', '5'],
    followers: ['1', '2', '3', '5', '6'],
    createdBy: '3',
    createdAt: new Date().toISOString(),
    rating: 4.8,
    reviews: [],
    openingHours: {
      alwaysOpen: false,
      monday: { alwaysOpen: false, openTime: '17:00', closeTime: '23:00' },
      tuesday: { alwaysOpen: false, openTime: '17:00', closeTime: '23:00' },
      wednesday: { alwaysOpen: false, openTime: '17:00', closeTime: '23:00' },
      thursday: { alwaysOpen: false, openTime: '17:00', closeTime: '23:00' },
      friday: { alwaysOpen: false, openTime: '16:00', closeTime: '00:00' },
      saturday: { alwaysOpen: false, openTime: '15:00', closeTime: '00:00' },
      sunday: { alwaysOpen: false, openTime: '15:00', closeTime: '22:00' },
    },
    verified: true,
  },
  {
    id: '4',
    name: 'HSR Layout Sports Arena',
    description: 'A premium indoor sports facility in HSR Layout offering badminton, table tennis, and squash courts. Great for group sport sessions and weekend tournaments.',
    location: {
      latitude: 12.9116,
      longitude: 77.6389,
      geohash: '',
      address: 'Sector 7, HSR Layout, Bengaluru, Karnataka 560102',
    },
    images: [
      'https://images.pexels.com/photos/3825364/pexels-photo-3825364.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1311085/pexels-photo-1311085.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    tags: ['Indoor', 'Sports', 'Badminton', 'Parking Available', 'Air Conditioned'],
    checkedInUsers: ['1', '3'],
    followers: ['2', '3', '4'],
    createdBy: '2',
    createdAt: new Date().toISOString(),
    rating: 4.5,
    reviews: [],
    openingHours: {
      alwaysOpen: false,
      monday: { alwaysOpen: false, openTime: '06:00', closeTime: '22:00' },
      tuesday: { alwaysOpen: false, openTime: '06:00', closeTime: '22:00' },
      wednesday: { alwaysOpen: false, openTime: '06:00', closeTime: '22:00' },
      thursday: { alwaysOpen: false, openTime: '06:00', closeTime: '22:00' },
      friday: { alwaysOpen: false, openTime: '06:00', closeTime: '22:00' },
      saturday: { alwaysOpen: false, openTime: '07:00', closeTime: '21:00' },
      sunday: { alwaysOpen: false, openTime: '07:00', closeTime: '20:00' },
    },
    verified: true,
  },
  {
    id: '5',
    name: 'MG Road Community Garden',
    description: 'A serene open-air community garden on MG Road, ideal for morning yoga, meditation circles, reading groups, and peaceful outdoor meetups.',
    location: {
      latitude: 12.9757,
      longitude: 77.6066,
      geohash: '',
      address: 'MG Road, Prestige Meridian II, Bengaluru, Karnataka 560001',
    },
    images: [
      'https://images.pexels.com/photos/1470165/pexels-photo-1470165.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1005417/pexels-photo-1005417.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    tags: ['Outdoor', 'Free', 'Yoga', 'Pet Friendly', 'Peaceful', 'Metro Accessible'],
    checkedInUsers: ['5', '6'],
    followers: ['1', '3', '6', '7'],
    createdBy: '1',
    createdAt: new Date().toISOString(),
    rating: 4.6,
    reviews: [],
    openingHours: {
      alwaysOpen: false,
      monday: { alwaysOpen: false, openTime: '06:00', closeTime: '20:00' },
      tuesday: { alwaysOpen: false, openTime: '06:00', closeTime: '20:00' },
      wednesday: { alwaysOpen: false, openTime: '06:00', closeTime: '20:00' },
      thursday: { alwaysOpen: false, openTime: '06:00', closeTime: '20:00' },
      friday: { alwaysOpen: false, openTime: '06:00', closeTime: '20:00' },
      saturday: { alwaysOpen: false, openTime: '06:00', closeTime: '20:00' },
      sunday: { alwaysOpen: false, openTime: '06:00', closeTime: '20:00' },
    },
    verified: false,
  },
];

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Sunset Photography Walk',
    description: 'Join fellow photography enthusiasts for a golden-hour walk through Cubbon Park. All skill levels welcome!',
    courtId: '1',
    mainOrganiser: { type: 'user', id: '1' },
    organiserUserIds: ['1'],
    organiserClubIds: [],
    startDate: new Date(Date.now() + 86400000).toISOString(),
    endDate: new Date(Date.now() + 86400000 + 7200000).toISOString(),
    maxParticipants: 15,
    currentParticipants: 8,
    pricing: [],
    ticketDeadline: 'upcoming',
    isPrivate: false,
    participants: [],
    status: 'upcoming',
    createdAt: new Date().toISOString(),
    acceptingParticipants: true,
    verifyParticipants: false,
  },
  {
    id: '2',
    title: 'Language Exchange Meetup',
    description: 'Practice a new language and meet people from all over the world. Casual, conversational, and completely free!',
    courtId: '2',
    mainOrganiser: { type: 'user', id: '2' },
    organiserUserIds: ['2'],
    organiserClubIds: [],
    startDate: new Date(Date.now() + 259200000).toISOString(),
    endDate: new Date(Date.now() + 259200000 + 7200000).toISOString(),
    maxParticipants: 20,
    currentParticipants: 11,
    pricing: [],
    ticketDeadline: 'upcoming',
    isPrivate: false,
    participants: [],
    status: 'upcoming',
    createdAt: new Date().toISOString(),
    acceptingParticipants: true,
    verifyParticipants: false,
  },
  {
    id: '3',
    title: 'Rooftop Stargazing Night',
    description: 'An evening of constellation spotting and chill conversations under the open sky at Indiranagar Rooftop Lounge.',
    courtId: '3',
    mainOrganiser: { type: 'user', id: '1' },
    organiserUserIds: ['1'],
    organiserClubIds: [],
    startDate: new Date(Date.now() + 432000000).toISOString(),
    endDate: new Date(Date.now() + 432000000 + 10800000).toISOString(),
    maxParticipants: 30,
    currentParticipants: 18,
    pricing: [],
    ticketDeadline: 'upcoming',
    isPrivate: false,
    participants: [],
    status: 'upcoming',
    createdAt: new Date().toISOString(),
    acceptingParticipants: true,
    verifyParticipants: false,
  },
  {
    id: '4',
    title: 'Weekend Badminton Tournament',
    description: 'Friendly doubles tournament open to all skill levels. Come for the sport, stay for the community!',
    courtId: '4',
    mainOrganiser: { type: 'user', id: '2' },
    organiserUserIds: ['2'],
    organiserClubIds: [],
    startDate: new Date(Date.now() + 604800000).toISOString(),
    endDate: new Date(Date.now() + 604800000 + 18000000).toISOString(),
    maxParticipants: 32,
    currentParticipants: 24,
    pricing: [],
    ticketDeadline: 'upcoming',
    isPrivate: false,
    participants: [],
    status: 'upcoming',
    createdAt: new Date().toISOString(),
    acceptingParticipants: true,
    verifyParticipants: false,
  },
  {
    id: '5',
    title: 'Morning Yoga in the Garden',
    description: 'Start your Sunday right with a group yoga session on the garden lawns. All levels welcome, mats provided.',
    courtId: '5',
    mainOrganiser: { type: 'user', id: '1' },
    organiserUserIds: ['1'],
    organiserClubIds: [],
    startDate: new Date(Date.now() + 518400000).toISOString(),
    endDate: new Date(Date.now() + 518400000 + 5400000).toISOString(),
    maxParticipants: 25,
    currentParticipants: 14,
    pricing: [],
    ticketDeadline: 'upcoming',
    isPrivate: false,
    participants: [],
    status: 'upcoming',
    createdAt: new Date().toISOString(),
    acceptingParticipants: true,
    verifyParticipants: false,
  },
];

export const mockClubs: Club[] = [
  {
    id: '1',
    name: 'Bangalore Explorers',
    description: 'A thriving community for newcomers and locals alike in Bangalore. We organise hiking trips, cultural events, and casual meetups to help you connect with the city.',
    logo: 'https://images.pexels.com/photos/1005417/pexels-photo-1005417.jpeg?auto=compress&cs=tinysrgb&w=400',
    adminId: '1',
    members: ['1', '2', '3', '4', '5'],
    trainingSchedule: [
      {
        id: '1',
        title: 'Saturday Hike',
        courtId: '1',
        startTime: new Date(Date.now() + 86400000),
        endTime: new Date(Date.now() + 86400000 + 14400000),
        maxParticipants: 20,
        currentParticipants: 12,
        price: 0,
        recurringDays: ['Saturday'],
      },
    ],
    courtIds: ['1'],
    fees: {
      monthly: 0,
      session: 0,
    },
    createdAt: new Date(),
  },
];

export interface SocialUser {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  isFollowingYou: boolean;
}

export const mockSocialUsers: SocialUser[] = [
  {
    id: 'u1',
    name: 'Priya Sharma',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200',
    bio: 'Explorer, photographer & coffee addict ☕. Always looking for the next meetup!',
    followersCount: 312,
    followingCount: 189,
    isFollowing: true,
    isFollowingYou: true,
  },
  {
    id: 'u2',
    name: 'Arjun Mehta',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=200',
    bio: 'Badminton enthusiast and weekend hiker 🏸⛰️',
    followersCount: 204,
    followingCount: 133,
    isFollowing: true,
    isFollowingYou: false,
  },
  {
    id: 'u3',
    name: 'Sneha Kapoor',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
    bio: 'Yoga teacher by day, foodie by night 🧘‍♀️🍜',
    followersCount: 541,
    followingCount: 220,
    isFollowing: false,
    isFollowingYou: true,
  },
  {
    id: 'u4',
    name: 'Rahul Nair',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=200',
    bio: 'Tech startup founder. Love community meetups and brainstorming sessions.',
    followersCount: 880,
    followingCount: 412,
    isFollowing: false,
    isFollowingYou: false,
  },
  {
    id: 'u5',
    name: 'Aisha Patel',
    avatar: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=200',
    bio: 'Music, art, and spontaneous road trips 🎵🎨🚗',
    followersCount: 157,
    followingCount: 91,
    isFollowing: true,
    isFollowingYou: true,
  },
];

export interface MockMessage {
  id: string;
  senderId: string; // 'me' or a SocialUser id
  text: string;
  timestamp: string;
}

export interface MockThread {
  userId: string;
  messages: MockMessage[];
}

export const mockThreads: MockThread[] = [
  {
    userId: 'u1',
    messages: [
      { id: 'm1', senderId: 'u1', text: 'Hey! Are you coming to the rooftop meetup tonight?', timestamp: '2026-03-29T09:30:00Z' },
      { id: 'm2', senderId: 'me', text: 'Yes! Looking forward to it 🙌', timestamp: '2026-03-29T09:32:00Z' },
      { id: 'm3', senderId: 'u1', text: 'Amazing! I\'ll save you a spot 😊', timestamp: '2026-03-29T09:33:00Z' },
    ],
  },
  {
    userId: 'u2',
    messages: [
      { id: 'm4', senderId: 'u2', text: 'Wanna play badminton this weekend at HSR Arena?', timestamp: '2026-03-28T18:00:00Z' },
      { id: 'm5', senderId: 'me', text: 'Definitely! Saturday morning?', timestamp: '2026-03-28T18:10:00Z' },
    ],
  },
  {
    userId: 'u5',
    messages: [
      { id: 'm6', senderId: 'u5', text: 'Loved your check-in at Cubbon Park! Beautiful place.', timestamp: '2026-03-27T14:20:00Z' },
      { id: 'm7', senderId: 'me', text: 'Thank you! It\'s my go-to spot for weekends.', timestamp: '2026-03-27T14:25:00Z' },
      { id: 'm8', senderId: 'u5', text: 'We should go together sometime!', timestamp: '2026-03-27T14:26:00Z' },
    ],
  },
];