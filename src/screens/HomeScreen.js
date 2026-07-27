import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { theme } from '../styles/theme';
import EventCard from '../components/EventCard';
import CategoryTabs from '../components/CategoryTabs';
import Header from '../components/Header';
import { events as mockEvents } from '../data/mockData';

const HomeScreen = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setEvents(mockEvents);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  const featuredEvents = events.slice(0, 6);
  const categoryEvents = {
    concerts: events.filter(e => e.category === 'Concerts').slice(0, 4),
    sports: events.filter(e => e.category === 'Sports').slice(0, 4),
    theater: events.filter(e => e.category === 'Theater').slice(0, 4),
    festivals: events.filter(e => e.category === 'Festivals'),
  };

  const renderEvent = ({ item }) => (
    <View style={styles.eventWrapper}>
      <EventCard event={item} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll}>
        <Header />
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>LIVE EVENTS, MADE EASY</Text>
          <Text style={styles.heroTitle}>Find tickets for your next live event</Text>
          <Text style={styles.heroSubtitle}>Discover concerts, sports, theatre and more happening near you.</Text>
          <View style={styles.heroSearch}>
            <TextInput style={styles.heroSearchInput} placeholder="Search by artist, event or venue" placeholderTextColor="#666" />
            <TouchableOpacity style={styles.heroSearchButton}><Text style={styles.heroSearchButtonText}>Search</Text></TouchableOpacity>
          </View>
        </View>

        <CategoryTabs />

        <View style={[styles.section, styles.featuredSection]}>
          <Text style={styles.sectionTitle}>Featured Events</Text>
          <FlatList
            data={featuredEvents}
            renderItem={renderEvent}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.eventsList}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Concerts</Text>
          <FlatList
            data={categoryEvents.concerts}
            renderItem={renderEvent}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.eventsList}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sports</Text>
          <FlatList
            data={categoryEvents.sports}
            renderItem={renderEvent}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.eventsList}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Theater</Text>
          <FlatList
            data={categoryEvents.theater}
            renderItem={renderEvent}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.eventsList}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Festivals</Text>
          <FlatList
            data={categoryEvents.festivals}
            renderItem={renderEvent}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.eventsList}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    flex: 1,
  },
  hero: {
    backgroundColor: theme.colors.primaryDark,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 48, paddingBottom: 46,
  },
  heroTitle: {
    fontSize: 38, lineHeight: 40, letterSpacing: -1.5,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 14,
  },
  heroSubtitle: {
    fontSize: 15, color: '#e7f1ff', marginBottom: 24, lineHeight: 21,
  },
  eyebrow: {
    color: theme.colors.accent, fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginBottom: 12,
  },
  heroSearch: {
    flexDirection: 'row', height: 54,
    width: '100%',
  },
  heroSearchInput: {
    flex: 1,
    borderWidth: 0,
    borderRadius: theme.borderRadius,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10, color: theme.colors.text,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  heroSearchButton: {
    marginLeft: theme.spacing.sm, backgroundColor: '#fff', paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius,
    justifyContent: 'center', alignItems: 'center',
  },
  heroSearchButtonText: {
    color: theme.colors.primary, fontWeight: '800', fontSize: 15,
  },
  section: {
    paddingHorizontal: theme.spacing.md,
    marginTop: 36,
  },
  sectionTitle: {
    fontSize: 25, letterSpacing: -0.5,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  eventsList: {
    paddingBottom: theme.spacing.sm,
  },
  eventWrapper: {
    marginRight: theme.spacing.sm,
  },
  featuredSection: {
    backgroundColor: theme.colors.primaryLight, paddingVertical: 30, marginTop: 0,
  },
});

export default HomeScreen;
