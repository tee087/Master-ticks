import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../styles/theme';
import { useNavigation } from '@react-navigation/native';

const EventDetail = ({ route }) => {
  const { id } = route.params;
  const navigation = useNavigation();

  const event = {
    id: 1,
    name: 'Taylor Swift | The Eras Tour',
    image: 'https://picsum.photos/400/300?random=1',
    venue: 'SoFi Stadium - Los Angeles, CA',
    date: '2024-09-15T19:30:00',
    time: '7:30 PM',
    price: 125,
    quantity: 5400,
    description: 'Taylor Swift\'s highly anticipated The Eras Tour will make its way to Los Angeles for multiple nights at SoFi Stadium. This tour celebrates the evolution of Taylor\'s career with songs from all eras of her music career.'
  };

  const handlePurchase = () => {
    alert(`Thank you for your purchase! ${event.quantity} ticket(s) for ${event.name} ordered successfully.`);
    navigation.navigate('Home');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: event.image }} style={styles.image} />
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
          <TouchableOpacity 
            style={styles.button}
            onPress={handlePurchase}
          >
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
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: '#fff',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius,
    marginRight: theme.spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  venue: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  date: {
    fontSize: 13,
    color: theme.colors.textSecondary,
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
    color: theme.colors.text,
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
    fontWeight: '600',
  },
  section: {
    padding: theme.spacing.md,
    backgroundColor: '#fff',
    marginTop: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
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

export default EventDetail;