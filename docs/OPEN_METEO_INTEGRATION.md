# Open-Meteo API Integration

## Overview
This document describes the integration of the Open-Meteo Weather API into the Weather Sunscreen App. Open-Meteo provides free, high-resolution weather forecasts with no API key required.

## Architecture

### Components

1. **OpenMeteoClient** (`src/services/OpenMeteoClient.ts`)
   - Singleton client for all API communication
   - Handles HTTP requests with retry logic and timeouts
   - Exponential backoff for failed requests
   - Structured error handling and logging

2. **OpenMeteoMapper** (`src/services/OpenMeteoMapper.ts`)
   - Transforms Open-Meteo API responses to app data structures
   - Maps WMO weather codes to human-readable conditions
   - Calculates UV levels and generates recommendations
   - Handles hourly and daily forecast transformations

3. **WeatherService** (`src/services/WeatherService.ts`)
   - High-level service layer using OpenMeteoClient
   - Intelligent caching with configurable timeout (5 minutes default)
   - Graceful degradation with stale data fallback
   - Mock data fallback for offline scenarios

## API Endpoints Used

### Current Weather
```
GET /v1/forecast
Parameters:
  - latitude: number
  - longitude: number
  - current: temperature_2m, relative_humidity_2m, apparent_temperature, 
             pressure_msl, wind_speed_10m, wind_direction_10m, 
             visibility, cloud_cover, weather_code, is_day
  - timezone: auto
```

### UV Index
```
GET /v1/forecast
Parameters:
  - latitude: number
  - longitude: number
  - hourly: uv_index
  - forecast_days: 1
  - timezone: auto
```

### Forecast (7 days)
```
GET /v1/forecast
Parameters:
  - latitude: number
  - longitude: number
  - hourly: temperature_2m, relative_humidity_2m, uv_index, wind_speed_10m,
            wind_direction_10m, precipitation_probability, cloud_cover, weather_code
  - daily: weather_code, temperature_2m_max, temperature_2m_min, uv_index_max,
           precipitation_probability_max, wind_speed_10m_max, wind_direction_10m_dominant
  - forecast_days: 7
  - timezone: auto
```

## Data Transformations

### WMO Weather Codes
Open-Meteo uses WMO (World Meteorological Organization) weather codes:
- 0: Clear sky
- 1-3: Mainly clear, partly cloudy, overcast
- 45, 48: Fog
- 51-57: Drizzle (various intensities)
- 61-67: Rain (various intensities)
- 71-77: Snow (various intensities)
- 80-86: Showers (various intensities)
- 95-99: Thunderstorm (with optional hail)

### UV Level Calculation
```typescript
0-2: Low
3-5: Moderate
6-7: High
8-10: Very High
11+: Extreme
```

## Caching Strategy

### Cache Implementation
- **Storage**: In-memory cache with coordinates and timestamp
- **Timeout**: 5 minutes (configurable)
- **Validation**: Checks both expiration and location match
- **Stale Data**: Returns expired cache if API fails (graceful degradation)

### Cache Invalidation
- Automatic expiration after timeout
- Location change detection
- Manual refresh methods available:
  - `refreshWeatherData()`
  - `refreshUVIndex()`
  - `refreshForecast()`
  - `clearCache()`

## Error Handling

### Retry Logic
- Maximum 3 retry attempts (configurable)
- Exponential backoff: 1s, 2s, 4s (max 5s)
- Request timeout: 10 seconds

### Fallback Strategy
1. Try API request with retries
2. If failed, return cached data (even if expired)
3. If no cache, return mock data
4. Log all failures with context

### Error Types
- Network errors (timeout, connection failed)
- HTTP errors (4xx, 5xx status codes)
- Data transformation errors
- Validation errors

## Usage Examples

### Fetch Current Weather
```typescript
import { weatherService } from '@/src/services';

const coordinates = { latitude: 37.7749, longitude: -122.4194 };
const weatherData = await weatherService.getWeatherData(coordinates);

console.log(weatherData.current.temperature); // 72
console.log(weatherData.current.condition.description); // "Clear sky"
console.log(weatherData.uvIndex?.level); // "high"
```

### Fetch UV Index
```typescript
const uvIndex = await weatherService.getUVIndex(coordinates);

console.log(uvIndex.value); // 8
console.log(uvIndex.level); // "very-high"
console.log(uvIndex.recommendations); // Array of recommendations
```

### Fetch 7-Day Forecast
```typescript
const forecast = await weatherService.getForecast(coordinates);

forecast.days.forEach(day => {
  console.log(day.date);
  console.log(`High: ${day.temperature.max}°`);
  console.log(`UV: ${day.uvIndex.max}`);
});
```

### Force Refresh (Bypass Cache)
```typescript
const freshData = await weatherService.refreshWeatherData(coordinates);
```

### Clear All Cache
```typescript
weatherService.clearCache();
```

## Performance Considerations

### Response Times
- Cached requests: < 1ms
- API requests: 200-500ms (typical)
- Retry attempts: Up to 10 seconds max

### Data Size
- Current weather: ~2KB
- UV index: ~1KB
- 7-day forecast: ~5KB
- Total cached: ~8KB per location

### Rate Limiting
Open-Meteo has generous rate limits:
- Free tier: 10,000 requests/day
- No API key required
- No authentication needed

## Security

### Data Privacy
- No API key required (no sensitive data to protect)
- Location data sent only to Open-Meteo
- All requests over HTTPS
- No user data stored on external servers

### Input Validation
- Coordinates validated before API calls
- Latitude: -90 to 90
- Longitude: -180 to 180
- All API responses validated before transformation

## Logging

### Log Levels
- **Debug**: Cache hits, API requests
- **Info**: Successful data fetches, configuration changes
- **Warn**: Stale cache usage, UV fetch failures
- **Error**: API failures, transformation errors

### Log Context
All logs include:
- Coordinates
- Operation type
- Timestamps
- Error details (when applicable)

## Testing

### Unit Tests
Test coverage includes:
- API client requests and retries
- Data transformation accuracy
- Cache validation logic
- Error handling scenarios
- Fallback mechanisms

### Integration Tests
- Real API calls (optional)
- End-to-end data flow
- Cache behavior
- Error recovery

### Mock Data
Mock data available for:
- Offline development
- Testing without API
- Fallback scenarios
- Deterministic testing

## Configuration

### OpenMeteoClient Config
```typescript
{
  baseUrl: 'https://api.open-meteo.com/v1',
  timeout: 10000,      // 10 seconds
  retryAttempts: 3
}
```

### WeatherService Config
```typescript
{
  timeout: 10000,       // 10 seconds
  retryAttempts: 3,
  cacheTimeout: 300000  // 5 minutes
}
```

## Future Enhancements

### Potential Improvements
1. **Persistent Cache**: Use AsyncStorage for offline support
2. **Background Refresh**: Update cache in background
3. **Advanced Caching**: LRU cache for multiple locations
4. **Request Batching**: Combine multiple API calls
5. **GraphQL Support**: Use Open-Meteo GraphQL API
6. **Historical Data**: Access past weather data
7. **Air Quality**: Integrate air quality data
8. **Weather Alerts**: Add severe weather alerts

### API Features Not Yet Implemented
- Solar radiation data
- Soil temperature/moisture
- Precipitation amounts
- Cloud cover by altitude
- Weather model selection
- Historical forecast access

## Troubleshooting

### Common Issues

**Issue**: "Network request failed"
- **Cause**: No internet connection or API timeout
- **Solution**: Check internet connection, retry will happen automatically

**Issue**: "Failed to transform weather data"
- **Cause**: Unexpected API response format
- **Solution**: Check API documentation, update mapper if needed

**Issue**: Stale data being returned
- **Cause**: API failures with expired cache
- **Solution**: Normal behavior for offline resilience, will refresh when online

**Issue**: Cache not invalidating
- **Cause**: Location comparison issue
- **Solution**: Use `clearCache()` or `refresh*()` methods

## References

- [Open-Meteo API Documentation](https://open-meteo.com/en/docs)
- [WMO Weather Codes](https://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-data/HTML/WMO-CODE/WMO4677.HTM)
- [UV Index Standards](https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-(uv)-index)

## License

Open-Meteo API is free to use for non-commercial and commercial purposes under CC BY 4.0 license.

