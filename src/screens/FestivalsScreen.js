import React from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { theme } from '../styles/theme';
import EventCard from '../components/EventCard';
import Header from '../components/Header';
import { events } from '../data/mockData';

const FestivalsScreen = () => {
  const festivalEvents = events.filter(e => e.category === 'Festivals');

  const renderEvent = ({ item }) => (
    <View style={styles.eventWrapper}>
      <EventCard event={item} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={styles.content}>
        <Text style={styles.eyebrow}>ALL WEEKEND</Text><Text style={styles.title}>Festivals near you</Text>
        <FlatList
          data={festivalEvents}
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
    padding: theme.spacing.lg, backgroundColor: theme.colors.primaryLight, flex: 1,
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

export default FestivalsScreen;
