import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { theme } from '../styles/theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { events } from '../data/mockData';

const CheckoutScreen = () => {
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
    alert(`Thank you for your purchase! ${event.quantity} ticket(s) for ${event.name} ordered successfully.`);
    navigation.navigate('MainTabs', { screen: 'Home' });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.topBar}><Text style={styles.topBarBrand}>ticketmaster</Text><Text style={styles.topBarText}>Secure checkout</Text></View>
      <View style={styles.checkout}>
        <View style={styles.checkoutHeader}>
          <Text style={styles.checkoutTitle}>Buy Tickets</Text>
          <Text style={styles.checkoutEvent}>{event.name}</Text>
        </View>

        <View style={styles.checkoutContent}>
          <View style={styles.seating}>
            <Text style={styles.sectionTitle}>Select Seats</Text>
            <View style={styles.seatingMap}>
              <Text style={styles.stageLabel}>Stage A - Available</Text>
              <View style={styles.seats}>
                {[...Array(10)].map((_, i) => (
                  <TouchableOpacity key={i} style={styles.seat} disabled>
                    <Text style={styles.seatNumber}>{i + 1}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.orderSummary}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Event:</Text>
              <Text style={styles.orderValue}>{event.name}</Text>
            </View>
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Date:</Text>
              <Text style={styles.orderValue}>{new Date(event.date).toLocaleDateString()}</Text>
            </View>
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Venue:</Text>
              <Text style={styles.orderValue}>{event.venue}</Text>
            </View>
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Tickets:</Text>
              <Text style={styles.orderValue}>{event.quantity}</Text>
            </View>
            <View style={styles.orderRow.total}>
              <Text style={styles.orderLabelTotal}>Total:</Text>
              <Text style={styles.orderValueTotal}>${event.price * event.quantity}</Text>
            </View>
          </View>

          <View style={styles.payment}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={styles.paymentOptions}>
              <TouchableOpacity style={styles.paymentOption}>
                <Text style={styles.paymentOptionText}>Credit Card</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.paymentOption}>
                <Text style={styles.paymentOptionText}>PayPal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.paymentOption}>
                <Text style={styles.paymentOptionText}>Apple Pay</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.completeButton} onPress={handlePurchase}>
              <Text style={styles.completeButtonText}>Complete Purchase</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back to Event</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topBar: { backgroundColor: theme.colors.primaryDark, height: 58, paddingHorizontal: theme.spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topBarBrand: { color: '#fff', fontWeight: '800', fontSize: 20, letterSpacing: -1 },
  topBarText: { color: '#dcecff', fontWeight: '600', fontSize: 13 },
  checkout: {
    flex: 1, padding: theme.spacing.md,
  },
  checkoutHeader: {
    marginBottom: theme.spacing.lg,
  },
  checkoutTitle: {
    fontSize: 32, letterSpacing: -1,
    fontWeight: '800', color: theme.colors.primaryDark,
    marginBottom: theme.spacing.sm,
  },
  checkoutEvent: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  checkoutContent: { flex: 1 },
  seating: {
    backgroundColor: theme.colors.primaryLight, padding: theme.spacing.md, borderRadius: 6, marginBottom: theme.spacing.md,
  },
  orderSummary: {
    backgroundColor: '#fff', padding: theme.spacing.md, borderRadius: 6, ...theme.shadows.card,
  },
  payment: {
    marginTop: theme.spacing.md, backgroundColor: '#fff', padding: theme.spacing.md, borderRadius: 6, ...theme.shadows.card,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  stageLabel: {
    fontSize: 14,
    color: theme.colors.primaryDark, fontWeight: '700',
    marginBottom: theme.spacing.sm,
  },
  seats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  seat: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
  },
  seatNumber: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  orderLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  orderValue: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600', maxWidth: '65%', textAlign: 'right',
  },
  orderRowTotal: {
    marginTop: theme.spacing.sm,
  },
  orderLabelTotal: {
    fontSize: 16,
    fontWeight: '800', color: theme.colors.primaryDark,
  },
  orderValueTotal: {
    fontSize: 16,
    fontWeight: '800', color: theme.colors.primary,
  },
  paymentOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  paymentOption: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 12,
    borderRadius: theme.borderRadius,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  paymentOptionText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  completeButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: theme.borderRadius,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  backButton: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 14,
    color: theme.colors.primary,
  },
});

export default CheckoutScreen;
