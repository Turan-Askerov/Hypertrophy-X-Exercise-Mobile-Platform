import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ScreenContainer } from '@/components/ui/screen-container';
import { AppColors } from '@/constants/theme';

export function LoadingScreen() {
  return (
    <ScreenContainer>
      <View style={styles.screen}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});