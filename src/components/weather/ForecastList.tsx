/**
 * 7-day forecast list component
 */

import { useColors } from '@/src/theme/theme';
import { ForecastDay } from '@/src/types';
import React, { useCallback } from 'react';
import { FlatList, ListRenderItem, RefreshControl, StyleSheet } from 'react-native';
import { ForecastDayCard } from './ForecastDayCard';

interface ForecastListProps {
  days: ForecastDay[];
  onDayPress?: (day: ForecastDay) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  locale?: string;
}

export const ForecastList = React.memo<ForecastListProps>(({ 
  days, 
  onDayPress,
  onRefresh,
  refreshing = false,
  locale = 'en',
}) => {
  const colors = useColors();
  
  const renderItem: ListRenderItem<ForecastDay> = useCallback(({ item }) => (
    <ForecastDayCard
      day={item}
      onPress={onDayPress ? () => onDayPress(item) : undefined}
      locale={locale}
    />
  ), [onDayPress, locale]);
  
  const keyExtractor = useCallback((item: ForecastDay) => item.date, []);
  
  return (
    <FlatList
      data={days}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.container}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        ) : undefined
      }
      showsVerticalScrollIndicator={false}
      removeClippedSubviews
      maxToRenderPerBatch={7}
      windowSize={7}
    />
  );
});

ForecastList.displayName = 'ForecastList';

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
});

