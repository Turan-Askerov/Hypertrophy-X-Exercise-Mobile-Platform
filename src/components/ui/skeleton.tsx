import { StyleSheet, View } from 'react-native';

type Props = {
  height?: number;
  radius?: number;
  style?: any;
};

export function Skeleton({ height = 16, radius = 6, style }: Props) {
  return <View style={[styles.skeleton, { height, borderRadius: radius }, style]} />;
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#f1f5f9',
    overflow: 'hidden',
  },
});