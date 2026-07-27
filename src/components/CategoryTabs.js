import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../styles/theme';
import { useNavigation } from '@react-navigation/native';
import { events } from '../data/mockData';

const CategoryTabs = () => {
  const categories = [
    { name: 'Concerts', path: 'Concerts', icon: '🎵' },
    { name: 'Sports', path: 'Sports', icon: '⚽' },
    { name: 'Theater', path: 'Theater', icon: '🎭' },
    { name: 'Festivals', path: 'Festivals', icon: '🎪' },
    { name: 'Family', path: 'Family', icon: '👨‍👩‍👧‍👦' },
  ];

  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.path}
            style={styles.tab}
            onPress={() => navigation.navigate(cat.path)}
          >
            <Text style={styles.icon}>{cat.icon}</Text>
            <Text style={styles.name}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 0,
    backgroundColor: '#fff',
  },
  tab: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: theme.spacing.md, paddingVertical: 18,
    borderBottomWidth: 3, borderBottomColor: 'transparent',
  },
  icon: {
    fontSize: 19, marginRight: 7,
  },
  name: {
    fontSize: 13, fontWeight: '700', color: theme.colors.text,
  },
});

export default CategoryTabs;
