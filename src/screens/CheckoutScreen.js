import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, FlatList } from 'react-native';
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

  const renderSection = (section, sectionIndex) => {
    const rowIndex = row => {
      const rows = section.rows;
      const rowObj = rows.find((_, i) => {
        const testRow = rows[i];
        return testRow === row;
      });
      return rowObj || rows[0];
    };
    const rows = section.rows || [];
    const seatsPerRow = section.seatsPerRow || 20;

    return (
      <View key={sectionIndex} style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>{section.name}</Text>
        {rows.map((row, rowIdx) => {
          const seatCount = typeof seatsPerRow === 'object' ? seatsPerRow[rowIdx] || seatsPerRow[0] : seatsPerRow;
          const emptySeats = Array.from({ length: seatCount }, (_, i) => i + 1);
          return (
            <View key={row} style={styles.rowContainer}>
              <Text style={styles.rowLabel}>{row}</Text>
              <View style={styles.seatRow}>
                {emptySeats.map(seat => (
                  <TouchableOpacity key={seat} style={styles.seat}>
                    <Text style={styles.seatText}>{seat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const seatingConfig = event.seatingConfig || { sections: [] };

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
            <Text style={styles.sectionTitle}>Pick Your Seats</Text>
            {seatingConfig.sections.length > 0 ? (
              seatingConfig.sections.map(renderSection)
            ) : (
              <View style={styles.seatingPlaceholder}>
                <Text style={styles.seatingText}>Seating chart not available for this event</Text>
              </View>
            )}
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
  sectionContainer: {
    backgroundColor: '#fff', padding: theme.spacing.md, borderRadius: 6, marginBottom: theme.spacing.md, ...theme.shadows.card,
  },
  sectionHeader: {
    fontSize: 16, fontWeight: '700', color: theme.colors.text, marginBottom: theme.spacing.sm,
  },
  rowContainer: {
    flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.xs,
  },
  rowLabel: {
    width: 40, fontSize: 14, fontWeight: '600', color: theme.colors.text,
  },
  seatRow: {
    flex: 1, flexDirection: 'row', flexWrap: 'wrap',
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
  seats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  seat: {
    width: 30,
    height: 30,
    borderRadius: theme.borderRadius,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
  },
  seatText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
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
