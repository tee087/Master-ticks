import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

const Header = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerContainer}>
        <View style={styles.brandRow}>
          <View style={styles.mark}><Text style={styles.markText}>tm</Text></View>
          <Text style={styles.logo}>ticketmaster</Text>
          <TouchableOpacity style={styles.accountButton}><Text style={styles.accountText}>My Account</Text></TouchableOpacity>
        </View>
        
        <View style={styles.nav}>
          <TouchableOpacity style={styles.navLink}>
            <Text style={styles.navLinkText}>Events</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navLink}>
            <Text style={styles.navLinkText}>Concerts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navLink}>
            <Text style={styles.navLinkText}>Sports</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navLink}>
            <Text style={styles.navLinkText}>Theater</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navLink}>
            <Text style={styles.navLinkText}>Festivals</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search events, artists, venues..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>⌕</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: theme.colors.primaryDark,
    paddingBottom: theme.spacing.sm,
  },
  headerContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  brandRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md,
  },
  mark: {
    width: 26, height: 26, borderWidth: 2, borderColor: '#fff', borderRadius: 13,
    alignItems: 'center', justifyContent: 'center', marginRight: 5,
  },
  markText: { color: '#fff', fontWeight: '800', fontSize: 11, letterSpacing: -1 },
  accountButton: { marginLeft: 'auto', paddingVertical: 6 },
  accountText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  nav: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.sm,
  },
  navLink: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  navLinkText: {
    color: '#fff', fontWeight: '600', fontSize: 13,
  },
  searchContainer: {
    flexDirection: 'row',
    height: 42, marginBottom: 0, backgroundColor: '#fff', borderRadius: theme.borderRadius, overflow: 'hidden',
  },
  searchInput: {
    flex: 1,
    borderWidth: 0,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  searchButton: {
    width: 48, backgroundColor: '#fff', borderLeftWidth: 1, borderLeftColor: theme.colors.border,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: theme.colors.primaryDark, fontSize: 25, fontWeight: '600',
  },
});

export default Header;
