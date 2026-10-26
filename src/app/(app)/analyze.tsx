import { StyleSheet, Text, View } from 'react-native';

import { ScreenContainer } from '@/components/ui/screen-container';
import { Colors, Spacing, Typography } from '@/constants/theme';

export default function Screen() {
  return (
    <ScreenContainer>
      <View style={styles.center}>
        <Text style={styles.title}>Analiz</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  title: {
    fontSize: Typography.title,
    fontWeight: '700',
    color: Colors.dark.text,
  },
});
