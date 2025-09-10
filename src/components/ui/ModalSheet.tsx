import React, { PropsWithChildren, useCallback, useEffect } from 'react';
import { StyleSheet, View, Pressable, AccessibilityInfo } from 'react-native';
import Animated, {
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type Props = PropsWithChildren<{ visible: boolean; onClose: () => void }>;

export default function ModalSheet({ visible, onClose, children }: Props) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, { duration: 150 });
    if (visible) AccessibilityInfo.announceForAccessibility('Modal aberto');
  }, [opacity, visible]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const handleOverlayPress = useCallback(() => onClose(), [onClose]);

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          accessibilityRole="button"
          accessibilityLabel="Fechar"
          onPress={handleOverlayPress}
        />
      </Animated.View>
      <Animated.View
        entering={SlideInDown}
        exiting={SlideOutDown}
        style={styles.sheet}
        accessibilityViewIsModal
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    minHeight: 160,
  },
});
