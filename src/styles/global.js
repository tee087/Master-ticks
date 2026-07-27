import { StyleSheet } from 'react-native';
import { theme } from './theme';

export const globalStyles = StyleSheet.create({
  background: {
    backgroundColor: theme.colors.background,
  },
  padding: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  margin: {
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.md,
  },
  flex: {
    flex: 1,
  },
});