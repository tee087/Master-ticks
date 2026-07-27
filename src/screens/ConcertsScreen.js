import React from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { theme } from '../styles/theme';
import EventCard from '../components/EventCard';
import Header from '../components/Header';
import { events } from '../data/mockData';

const ConcertsScreen = () => {
  const concertEvents = events.filter(e => e.category === 'Concerts');

  const renderEvent = ({ item }) => (
    <View style={styles.eventWrapper}>
      <EventCard event={item} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={styles.content}>
        <Text style={styles.eyebrow}>LIVE MUSIC</Text><Text style={styles.title}>Concerts near you</Text>
        <FlatList
          data={concertEvents}
          renderItem={renderEvent}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.eventsList}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.primaryLight, flex: 1,
  },
  title: {
    fontSize: 30, letterSpacing: -1, fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  eyebrow: { color: theme.colors.primary, fontWeight: '800', letterSpacing: 1, fontSize: 11, marginBottom: 8 },
  eventsList: {
    paddingBottom: theme.spacing.sm,
  },
  eventWrapper: {
    marginRight: theme.spacing.sm,
  },
});

export default ConcertsScreen;
