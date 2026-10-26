import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@/components/ui/screen-container';
import { AppColors, Colors, Radius, Spacing, Typography } from '@/constants/theme';

type Props = {
  message: string;
  onRetry: () => void;
};

export function UnreachableScreen({ message, onRetry }: Props) {
  return (
    <ScreenContainer>
      <View style={styles.screen}>
        <Text style={styles.title}>Sunucuya ulaşılamıyor</Text>
        <Text style={styles.message}>{message}</Text>
        <Pressable style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>Tekrar dene</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  title: {
    fontSize: Typography.title,
    fontWeight: '700',
    marginBottom: Spacing.two,
    color: Colors.dark.text,
  },
  message: {
    fontSize: Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.four,
    color: Colors.dark.textSecondary,
  },
  button: {
    backgroundColor: AppColors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: Radius.md,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: Typography.body,
  },
});