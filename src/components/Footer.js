import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../styles/theme';
import { useNavigation } from '@react-navigation/native';

const Footer = () => {
  const footerLinks = {
    About: [
      { name: 'About Ticketmaster', path: '/about' },
      { name: 'Careers', path: '/careers' },
      { name: 'Press', path: '/press' },
    ],
    Support: [
      { name: 'Help Center', path: '/help' },
      { name: 'Manage Orders', path: '/orders' },
      { name: 'Contact Us', path: '/contact' },
    ],
    Legal: [
      { name: 'Terms of Use', path: '/terms' },
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Cookie Policy', path: '/cookies' },
    ],
    Follow: [
      { name: 'Facebook', path: '/facebook' },
      { name: 'Twitter', path: '/twitter' },
      { name: 'Instagram', path: '/instagram' },
      { name: 'YouTube', path: '/youtube' },
    ],
  };

  return (
    <View style={styles.footer}>
      <View style={styles.container}>
        <View style={styles.brand}>
          <Text style={styles.brandTitle}>Ticketmaster</Text>
          <Text style={styles.brandText}>The best seats for concerts, sports, and events.</Text>
        </View>

        <View style={styles.links}>
          {Object.entries(footerLinks).map(([title, links]) => (
            <View key={title} style={styles.column}>
              <Text style={styles.columnTitle}>{title}</Text>
              {links.map(link => (
                <TouchableOpacity key={link.name} style={styles.link}>
                  <Text style={styles.linkText}>{link.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.bottom}>
          <Text style={styles.copyright}>
            &copy; {new Date().getFullYear()} Ticketmaster. All rights reserved.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#f5f5f7',
    paddingVertical: theme.spacing.xl,
    marginTop: 'auto',
  },
  container: {
    paddingHorizontal: theme.spacing.md,
  },
  brand: {
    marginBottom: theme.spacing.xl,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  brandText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  links: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  column: {
    width: '24%',
    marginBottom: theme.spacing.lg,
  },
  columnTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  link: {
    marginBottom: theme.spacing.xs,
  },
  linkText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  bottom: {
    marginTop: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  copyright: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default Footer;