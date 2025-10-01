/**
 * Message Filters Component
 * Provides filtering options for messages (categories, read status, severity)
 */

import { Text, TouchableOpacity } from '@/src/components/ui';
import { useColors } from '@/src/theme/theme';
import type { MessageCategory, MessageFilter, MessageSeverity, MessageStats } from '@/src/types';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

interface MessageFiltersProps {
  activeFilter: MessageFilter;
  onFilterChange: (filter: MessageFilter) => void;
  stats: MessageStats;
}

/**
 * Filter chip component
 */
interface FilterChipProps {
  label: string;
  isActive: boolean;
  count?: number;
  onPress: () => void;
}

function FilterChip({ label, isActive, count, onPress }: FilterChipProps) {
  const colors = useColors();

  return (
    <TouchableOpacity
      style={[
        styles.filterChip,
        {
          backgroundColor: isActive ? colors.primary : colors.surfaceVariant,
          borderColor: isActive ? colors.primary : colors.outline,
        },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={`${label}${count !== undefined ? `, ${count} messages` : ''}`}
    >
      <Text
        variant="body2"
        style={[
          styles.filterChipText,
          { color: isActive ? colors.onPrimary : colors.onSurfaceVariant },
        ]}
      >
        {label}
        {count !== undefined && ` (${count})`}
      </Text>
    </TouchableOpacity>
  );
}

/**
 * Toggle switch component for read status
 */
interface ReadStatusToggleProps {
  isRead: boolean | undefined;
  onToggle: () => void;
  unreadCount: number;
  totalCount: number;
}

function ReadStatusToggle({ isRead, onToggle, unreadCount, totalCount }: ReadStatusToggleProps) {
  const colors = useColors();

  const getLabel = () => {
    if (isRead === true) return 'Read Only';
    if (isRead === false) return 'Unread Only';
    return 'All Messages';
  };

  const getCount = () => {
    if (isRead === true) return totalCount - unreadCount;
    if (isRead === false) return unreadCount;
    return totalCount;
  };

  return (
    <TouchableOpacity
      style={[styles.toggleButton, { borderColor: colors.outline }]}
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityState={{ selected: isRead !== undefined }}
    >
      <Text variant="body2" style={[styles.toggleText, { color: colors.onSurfaceVariant }]}>
        {getLabel()} ({getCount()})
      </Text>
    </TouchableOpacity>
  );
}

export function MessageFilters({
  activeFilter,
  onFilterChange,
  stats,
}: MessageFiltersProps) {
  const colors = useColors();

  const handleCategoryToggle = (category: MessageCategory) => {
    const currentCategories = activeFilter.categories || [];
    const isActive = currentCategories.includes(category);

    let newCategories: MessageCategory[] | undefined;
    if (isActive) {
      // Remove category
      newCategories = currentCategories.filter(c => c !== category);
      if (newCategories.length === 0) {
        newCategories = undefined;
      }
    } else {
      // Add category
      newCategories = [...currentCategories, category];
    }

    onFilterChange({
      ...activeFilter,
      categories: newCategories,
    });
  };

  const handleSeverityToggle = (severity: MessageSeverity) => {
    const currentSeverities = activeFilter.severity || [];
    const isActive = currentSeverities.includes(severity);

    let newSeverities: MessageSeverity[] | undefined;
    if (isActive) {
      // Remove severity
      newSeverities = currentSeverities.filter(s => s !== severity);
      if (newSeverities.length === 0) {
        newSeverities = undefined;
      }
    } else {
      // Add severity
      newSeverities = [...currentSeverities, severity];
    }

    onFilterChange({
      ...activeFilter,
      severity: newSeverities,
    });
  };

  const handleReadStatusToggle = () => {
    const currentReadStatus = activeFilter.isRead;

    let newReadStatus: boolean | undefined;
    if (currentReadStatus === undefined) {
      newReadStatus = false; // Start with unread only
    } else if (currentReadStatus === false) {
      newReadStatus = true; // Switch to read only
    } else {
      newReadStatus = undefined; // Show all
    }

    onFilterChange({
      ...activeFilter,
      isRead: newReadStatus,
    });
  };

  const handleClearAll = () => {
    onFilterChange({});
  };

  const hasActiveFilters = Boolean(
    activeFilter.categories?.length ||
    activeFilter.severity?.length ||
    activeFilter.isRead !== undefined
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceVariant }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Read Status Toggle */}
        <ReadStatusToggle
          isRead={activeFilter.isRead}
          onToggle={handleReadStatusToggle}
          unreadCount={stats.unread}
          totalCount={stats.total}
        />

        {/* Category Filters */}
        <View style={styles.filterSection}>
          <Text variant="caption" style={[styles.sectionTitle, { color: colors.onSurfaceVariant }]}>
            Categories
          </Text>
          <View style={styles.chipRow}>
            <FilterChip
              label="Weather"
              isActive={activeFilter.categories?.includes('weather-alert') || false}
              count={stats.byCategory['weather-alert']}
              onPress={() => handleCategoryToggle('weather-alert')}
            />
            <FilterChip
              label="UV Alerts"
              isActive={activeFilter.categories?.includes('uv-alert') || false}
              count={stats.byCategory['uv-alert']}
              onPress={() => handleCategoryToggle('uv-alert')}
            />
            <FilterChip
              label="System"
              isActive={activeFilter.categories?.includes('system') || false}
              count={stats.byCategory['system']}
              onPress={() => handleCategoryToggle('system')}
            />
            <FilterChip
              label="Info"
              isActive={activeFilter.categories?.includes('info') || false}
              count={stats.byCategory['info']}
              onPress={() => handleCategoryToggle('info')}
            />
          </View>
        </View>

        {/* Severity Filters */}
        <View style={styles.filterSection}>
          <Text variant="caption" style={[styles.sectionTitle, { color: colors.onSurfaceVariant }]}>
            Severity
          </Text>
          <View style={styles.chipRow}>
            <FilterChip
              label="Critical"
              isActive={activeFilter.severity?.includes('critical') || false}
              count={stats.bySeverity['critical']}
              onPress={() => handleSeverityToggle('critical')}
            />
            <FilterChip
              label="Warning"
              isActive={activeFilter.severity?.includes('warning') || false}
              count={stats.bySeverity['warning']}
              onPress={() => handleSeverityToggle('warning')}
            />
            <FilterChip
              label="Info"
              isActive={activeFilter.severity?.includes('info') || false}
              count={stats.bySeverity['info']}
              onPress={() => handleSeverityToggle('info')}
            />
          </View>
        </View>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <TouchableOpacity
            style={[styles.clearButton, { borderColor: colors.error }]}
            onPress={handleClearAll}
            accessibilityRole="button"
            accessibilityLabel="Clear all filters"
          >
            <Text variant="body2" style={[styles.clearText, { color: colors.error }]}>
              Clear All
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  scrollContent: {
    gap: 16,
    alignItems: 'flex-start',
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  toggleText: {
    fontSize: 12,
  },
  filterSection: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  clearText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
