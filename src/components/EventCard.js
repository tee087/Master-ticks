import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';
import { useNavigation } from '@react-navigation/native';

const EventCard = ({ event }) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('EventDetail', { id: event.id })}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: event.image }} style={styles.image} />
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{event.category}</Text>
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>{event.name}</Text>
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
        <View style={styles.footer}>
          <Text style={styles.price}>From ${event.price}</Text>
          <Text style={styles.link}>View Tickets</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 0,
    overflow: 'visible',
    marginRight: theme.spacing.sm,
    width: 272,
  },
  imageContainer: {
    position: 'relative', borderRadius: theme.borderRadius, overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 170,
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 0, left: 0, backgroundColor: '#111', paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderTopRightRadius: theme.borderRadius,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    paddingTop: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  venue: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '700',
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', borderTopWidth: 1, borderTopColor: '#dedede', paddingTop: 10,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  link: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});

export default EventCard;
