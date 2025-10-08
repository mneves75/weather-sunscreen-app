/**
 * Glass Components - Barrel Export
 *
 * Centralized export for all Liquid Glass components and utilities.
 * Provides clean imports: import { GlassView, useGlassEffect } from '@/src/components/glass';
 *
 * COMPONENTS:
 * - GlassView: Main glass effect wrapper with iOS 26+ support and fallbacks
 * - GlassCard: Pre-styled glass card with padding, borders, and elevation
 * - GlassContainer: Container for merging multiple glass effects (iOS 26+ performance optimization)
 *
 * CONTEXT:
 * - GlassEffectProvider: App-wide glass effect control provider
 * - useGlassEffect: Hook to access glass effect state and controls
 *
 * @example
 * // Basic usage
 * import { GlassView, GlassCard } from '@/src/components/glass';
 *
 * <GlassCard elevation={2}>
 *   <Text>Glass Card Content</Text>
 * </GlassCard>
 *
 * @example
 * // With provider
 * import { GlassEffectProvider, useGlassEffect } from '@/src/components/glass';
 *
 * // In app/_layout.tsx
 * <GlassEffectProvider>
 *   <App />
 * </GlassEffectProvider>
 *
 * // In any component
 * const { isEnabled, forceDisable } = useGlassEffect();
 * <GlassView disabled={!isEnabled} />
 */

// Components
export { GlassView } from './GlassView';
export { GlassCard } from './GlassCard';
export { GlassContainer } from './GlassContainer';

// Context and Hooks
export {
  GlassEffectProvider,
  useGlassEffect,
  type GlassEffectContextType,
  type GlassEffectProviderProps,
} from './GlassEffectProvider';
