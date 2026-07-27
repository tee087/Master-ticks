import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { theme } from '../styles/theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { events } from '../data/mockData';

const EventDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;

  const event = events.find(e => e.id === parseInt(id));

  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Event not found</Text>
      </SafeAreaView>
    );
  }

  const handlePurchase = () => {
    navigation.navigate('Checkout', { id: event.id });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.topBar}><Text style={styles.topBarBrand}>ticketmaster</Text><Text style={styles.topBarAccount}>My Account</Text></View>
      <Image source={{ uri: event.image }} style={styles.heroImage} />
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.name}>{event.name}</Text>
          <Text style={styles.venue}>{event.venue}</Text>
          <Text style={styles.date}>
            {new Date(event.date).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </Text>
          <Text style={styles.time}>{event.time}</Text>
          <Text style={styles.price}>Starting at ${event.price}</Text>
          <TouchableOpacity style={styles.button} onPress={handlePurchase}>
            <Text style={styles.buttonText}>Buy Tickets</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About This Event</Text>
        <Text style={styles.description}>{event.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Seating Chart</Text>
        <View style={styles.seatingPlaceholder}>
          <Text style={styles.seatingText}>Seating chart available during checkout</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: '#fff', marginHorizontal: theme.spacing.md, marginTop: -24,
    borderRadius: 6, ...theme.shadows.card,
  },
  topBar: { height: 58, paddingHorizontal: theme.spacing.md, backgroundColor: theme.colors.primaryDark, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topBarBrand: { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: -1 },
  topBarAccount: { color: '#fff', fontSize: 13, fontWeight: '600' },
  heroImage: { width: '100%', height: 250 },
  image: {
    width: 100, height: 100,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 25, lineHeight: 29,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 4,
  },
  venue: {
    fontSize: 14,
    color: theme.colors.primary, fontWeight: '700',
    marginBottom: 4,
  },
  date: {
    fontSize: 13,
    color: theme.colors.primary, fontWeight: '700',
    marginBottom: 4,
  },
  time: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primaryDark,
    marginBottom: theme.spacing.md,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: theme.borderRadius,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  section: {
    padding: theme.spacing.md,
    backgroundColor: '#fff', marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md, borderRadius: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  seatingPlaceholder: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.disabled,
    borderRadius: theme.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
});

export default EventDetailScreen;
