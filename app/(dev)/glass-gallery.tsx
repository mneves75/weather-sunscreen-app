/**
 * Glass Gallery - Live Examples and Performance Demos
 *
 * Demonstrates all Liquid Glass components with:
 * - Visual examples of each component
 * - Performance optimization patterns
 * - Accessibility fallback testing
 * - Platform-specific behaviors
 *
 * Use this screen to:
 * 1. Test glass effects on different platforms
 * 2. Validate performance with multiple glass elements
 * 3. Test accessibility settings (reduce transparency, high contrast)
 * 4. Verify scroll performance optimizations
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Switch,
} from 'react-native';
import { Stack } from 'expo-router';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import {
  GlassView,
  GlassCard,
  GlassContainer,
  useGlassEffect,
} from '@/src/components/glass';
import { useTheme, useThemeTokens } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';

export default function GlassGalleryScreen() {
  const { colors, isDark } = useTheme();
  const { spacing, borderRadius } = useThemeTokens();
  const glassEffect = useGlassEffect();

  // State for performance demo
  const [isScrolling, setIsScrolling] = useState(false);
  const [performanceMode, setPerformanceMode] = useState(glassEffect.performanceMode);
  const [glassCount, setGlassCount] = useState(5);

  // Platform detection
  const hasNativeGlass = Platform.OS === 'ios' && isLiquidGlassAvailable();
  const platformLabel = hasNativeGlass
    ? 'iOS 26+ (Native Liquid Glass)'
    : Platform.OS === 'ios'
    ? 'iOS < 26 (BlurView Fallback)'
    : Platform.OS === 'android'
    ? 'Android (Material Design 3)'
    : 'Web (CSS Backdrop Filter)';

  // Handle performance mode toggle
  const handlePerformanceModeToggle = (value: boolean) => {
    setPerformanceMode(value);
    glassEffect.setPerformanceMode(value);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Glass Gallery',
          headerTransparent: Platform.OS === 'ios',
          headerBlurEffect: Platform.OS === 'ios' ? 'systemMaterial' : undefined,
        }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: spacing.xl * 2 },
        ]}
        onScrollBeginDrag={() => setIsScrolling(true)}
        onScrollEndDrag={() => setIsScrolling(false)}
        onMomentumScrollEnd={() => setIsScrolling(false)}
      >
        {/* Platform Info */}
        <Section title="Platform Detection">
          <InfoCard
            label="Current Platform"
            value={platformLabel}
            icon="information-circle"
            colors={colors}
          />
          <InfoCard
            label="Glass Enabled"
            value={glassEffect.isEnabled ? 'Yes' : 'No'}
            icon={glassEffect.isEnabled ? 'checkmark-circle' : 'close-circle'}
            colors={colors}
          />
          <InfoCard
            label="Reduce Transparency"
            value={glassEffect.reduceTransparency ? 'Enabled' : 'Disabled'}
            icon="eye"
            colors={colors}
          />
        </Section>

        {/* Basic Glass View */}
        <Section title="1. Basic GlassView">
          <GlassView
            disabled={isScrolling}
            style={[styles.example, { padding: spacing.lg }]}
          >
            <Ionicons name="cube-outline" size={32} color={colors.primary} />
            <Text style={[styles.exampleText, { color: colors.text }]}>
              Basic glass effect
            </Text>
            <Text style={[styles.exampleSubtext, { color: colors.textSecondary }]}>
              {isScrolling ? 'Disabled during scroll' : 'Active glass effect'}
            </Text>
          </GlassView>
        </Section>

        {/* Glass Card */}
        <Section title="2. GlassCard with Elevation">
          <GlassCard
            elevation={1}
            disabled={isScrolling}
            style={styles.example}
          >
            <Ionicons name="layers-outline" size={32} color={colors.primary} />
            <Text style={[styles.exampleText, { color: colors.text }]}>
              Elevation 1 (Subtle)
            </Text>
          </GlassCard>

          <GlassCard
            elevation={3}
            disabled={isScrolling}
            style={styles.example}
          >
            <Ionicons name="layers-outline" size={32} color={colors.primary} />
            <Text style={[styles.exampleText, { color: colors.text }]}>
              Elevation 3 (Medium)
            </Text>
          </GlassCard>

          <GlassCard
            elevation={5}
            disabled={isScrolling}
            style={styles.example}
          >
            <Ionicons name="layers-outline" size={32} color={colors.primary} />
            <Text style={[styles.exampleText, { color: colors.text }]}>
              Elevation 5 (High)
            </Text>
          </GlassCard>
        </Section>

        {/* Glass Container - Merged Effects */}
        <Section title="3. GlassContainer (Merged Effects)">
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            On iOS 26+, multiple glass elements are merged into a single render pass for performance.
          </Text>

          <GlassContainer spacing={12} direction="row">
            <GlassView
              disabled={isScrolling}
              style={[styles.mergedItem, { padding: spacing.md }]}
            >
              <Ionicons name="home" size={24} color={colors.primary} />
            </GlassView>
            <GlassView
              disabled={isScrolling}
              style={[styles.mergedItem, { padding: spacing.md }]}
            >
              <Ionicons name="heart" size={24} color="#FF3B30" />
            </GlassView>
            <GlassView
              disabled={isScrolling}
              style={[styles.mergedItem, { padding: spacing.md }]}
            >
              <Ionicons name="settings" size={24} color="#8E8E93" />
            </GlassView>
          </GlassContainer>
        </Section>

        {/* Performance Control */}
        <Section title="4. Performance Control">
          <GlassCard disabled={isScrolling}>
            <View style={styles.controlRow}>
              <View style={styles.controlLabel}>
                <Ionicons name="flash" size={20} color={colors.primary} />
                <Text style={[styles.controlText, { color: colors.text }]}>
                  Performance Mode
                </Text>
              </View>
              <Switch
                value={performanceMode}
                onValueChange={handlePerformanceModeToggle}
                trackColor={{ false: '#767577', true: colors.primary }}
              />
            </View>
            <Text style={[styles.controlDescription, { color: colors.textSecondary }]}>
              Automatically disables glass when app is backgrounded to save battery.
            </Text>
          </GlassCard>

          <GlassCard disabled={isScrolling}>
            <View style={styles.controlRow}>
              <View style={styles.controlLabel}>
                <Ionicons name="speedometer" size={20} color={colors.primary} />
                <Text style={[styles.controlText, { color: colors.text }]}>
                  Scroll State
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: isScrolling ? '#FF3B30' : '#34C759',
                  },
                ]}
              >
                <Text style={styles.statusText}>
                  {isScrolling ? 'SCROLLING' : 'IDLE'}
                </Text>
              </View>
            </View>
            <Text style={[styles.controlDescription, { color: colors.textSecondary }]}>
              Glass effects are {isScrolling ? 'disabled' : 'enabled'} during scroll.
            </Text>
          </GlassCard>
        </Section>

        {/* Performance Stress Test */}
        <Section title="5. Performance Stress Test">
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Apple recommends 5-10 glass effects max. Test performance with different counts:
          </Text>

          <View style={styles.countControls}>
            <TouchableOpacity
              style={[styles.countButton, { backgroundColor: colors.primary }]}
              onPress={() => setGlassCount(Math.max(1, glassCount - 1))}
            >
              <Ionicons name="remove" size={20} color="#fff" />
            </TouchableOpacity>

            <Text style={[styles.countText, { color: colors.text }]}>
              {glassCount} Glass Elements
            </Text>

            <TouchableOpacity
              style={[styles.countButton, { backgroundColor: colors.primary }]}
              onPress={() => setGlassCount(Math.min(20, glassCount + 1))}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.stressTestGrid}>
            {Array.from({ length: glassCount }).map((_, index) => (
              <GlassCard
                key={index}
                elevation={2}
                disabled={isScrolling}
                style={styles.stressTestItem}
              >
                <Text style={[styles.stressTestText, { color: colors.text }]}>
                  {index + 1}
                </Text>
              </GlassCard>
            ))}
          </View>

          {glassCount > 10 && (
            <View
              style={[
                styles.warningBanner,
                { backgroundColor: '#FF9500', borderRadius: borderRadius.md },
              ]}
            >
              <Ionicons name="warning" size={20} color="#fff" />
              <Text style={styles.warningText}>
                ⚠️ Performance may degrade with {glassCount} glass elements
              </Text>
            </View>
          )}
        </Section>

        {/* Accessibility Testing */}
        <Section title="6. Accessibility">
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            To test accessibility fallbacks, enable these in device Settings:
          </Text>

          <GlassCard disabled={isScrolling}>
            <View style={styles.accessibilityItem}>
              <Ionicons name="eye-off" size={20} color={colors.primary} />
              <Text style={[styles.accessibilityText, { color: colors.text }]}>
                Settings → Accessibility → Display → Reduce Transparency
              </Text>
            </View>
          </GlassCard>

          <GlassCard disabled={isScrolling}>
            <View style={styles.accessibilityItem}>
              <Ionicons name="contrast" size={20} color={colors.primary} />
              <Text style={[styles.accessibilityText, { color: colors.text }]}>
                Settings → Accessibility → Display → Increase Contrast
              </Text>
            </View>
          </GlassCard>
        </Section>

        {/* Usage Examples */}
        <Section title="7. Code Examples">
          <CodeExample
            title="Basic GlassView"
            code={`<GlassView intensity={30}>
  <Text>Content</Text>
</GlassView>`}
            colors={colors}
          />

          <CodeExample
            title="Performance Optimization"
            code={`const [isScrolling, setIsScrolling] = useState(false);

<ScrollView
  onScrollBeginDrag={() => setIsScrolling(true)}
  onScrollEndDrag={() => setIsScrolling(false)}
>
  <GlassView disabled={isScrolling}>
    <Content />
  </GlassView>
</ScrollView>`}
            colors={colors}
          />

          <CodeExample
            title="With Context Provider"
            code={`const { isEnabled, forceDisable } = useGlassEffect();

<GlassView disabled={!isEnabled}>
  <Content />
</GlassView>`}
            colors={colors}
          />
        </Section>
      </ScrollView>
    </>
  );
}

// Helper Components

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors, spacing } = useThemeTokens();

  return (
    <View style={[styles.section, { marginBottom: spacing.xl }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {children}
    </View>
  );
}

function InfoCard({
  label,
  value,
  icon,
  colors,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  colors: any;
}) {
  return (
    <GlassCard elevation={1} style={styles.infoCard}>
      <View style={styles.infoRow}>
        <Ionicons name={icon} size={20} color={colors.primary} />
        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
      </View>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
    </GlassCard>
  );
}

function CodeExample({
  title,
  code,
  colors,
}: {
  title: string;
  code: string;
  colors: any;
}) {
  return (
    <GlassCard elevation={1} style={styles.codeExample}>
      <Text style={[styles.codeTitle, { color: colors.primary }]}>{title}</Text>
      <View style={[styles.codeBlock, { backgroundColor: colors.surfaceVariant }]}>
        <Text style={[styles.codeText, { color: colors.text }]}>{code}</Text>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  example: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    minHeight: 100,
  },
  exampleText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  exampleSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  mergedItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  controlLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlText: {
    fontSize: 16,
    fontWeight: '600',
  },
  controlDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  countControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16,
  },
  countButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 150,
    textAlign: 'center',
  },
  stressTestGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stressTestItem: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stressTestText: {
    fontSize: 20,
    fontWeight: '700',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
    marginTop: 12,
  },
  warningText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  accessibilityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  accessibilityText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  infoCard: {
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 13,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  codeExample: {
    marginBottom: 12,
  },
  codeTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  codeBlock: {
    padding: 12,
    borderRadius: 8,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
});
