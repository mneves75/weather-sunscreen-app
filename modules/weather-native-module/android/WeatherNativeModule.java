package com.weathernativemodule;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Build;
import android.util.Log;

import androidx.core.app.ActivityCompat;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Locale;

public class WeatherNativeModule extends ReactContextBaseJavaModule {
    private static final String TAG = "WeatherNativeModule";
    private static final int OPERATION_TIMEOUT_MS = 10000;
    private static final int LOCATION_TIMEOUT_MS = 15000;
    
    private final Executor executor = Executors.newCachedThreadPool();
    private LocationManager locationManager;
    
    public WeatherNativeModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.locationManager = (LocationManager) reactContext.getSystemService(Context.LOCATION_SERVICE);
    }
    
    @Override
    public String getName() {
        return "WeatherNativeModule";
    }
    
    @ReactMethod
    public void isAvailable(Promise promise) {
        boolean available = Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q; // API 29+
        promise.resolve(available);
    }
    
    @ReactMethod
    public void getCurrentLocation(Promise promise) {
        Log.d(TAG, "Getting current location");
        
        CompletableFuture<Location> locationFuture = new CompletableFuture<>();
        
        CompletableFuture.supplyAsync(() -> {
            try {
                ReactApplicationContext context = getReactApplicationContext();
                
                if (ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED &&
                    ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
                    throw new SecurityException("Location permissions not granted");
                }
                
                LocationListener listener = new LocationListener() {
                    @Override
                    public void onLocationChanged(Location location) {
                        locationFuture.complete(location);
                        locationManager.removeUpdates(this);
                    }
                    
                    @Override
                    public void onStatusChanged(String provider, int status, android.os.Bundle extras) {}
                    
                    @Override
                    public void onProviderEnabled(String provider) {}
                    
                    @Override
                    public void onProviderDisabled(String provider) {}
                };
                
                // Request location updates
                if (locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                    locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 0, 0, listener);
                } else if (locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
                    locationManager.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, 0, 0, listener);
                } else {
                    throw new RuntimeException("No location providers available");
                }
                
                // Try to get last known location first
                Location lastKnown = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER);
                if (lastKnown == null) {
                    lastKnown = locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);
                }
                
                if (lastKnown != null && System.currentTimeMillis() - lastKnown.getTime() < 60000) {
                    locationFuture.complete(lastKnown);
                    locationManager.removeUpdates(listener);
                }
                
                return locationFuture.get(LOCATION_TIMEOUT_MS, TimeUnit.MILLISECONDS);
                
            } catch (Exception e) {
                Log.e(TAG, "Location retrieval failed", e);
                throw new RuntimeException("Failed to get location: " + e.getMessage());
            }
        }, executor).whenComplete((location, error) -> {
            if (error != null) {
                promise.reject("LOCATION_ERROR", error.getMessage(), error);
            } else {
                WritableMap result = new WritableNativeMap();
                result.putDouble("latitude", location.getLatitude());
                result.putDouble("longitude", location.getLongitude());
                result.putDouble("accuracy", location.getAccuracy());
                promise.resolve(result);
            }
        });
    }
    
    @ReactMethod
    public void getUVIndexData(double latitude, double longitude, Promise promise) {
        Log.d(TAG, "Getting UV index data for location: " + latitude + ", " + longitude);
        
        CompletableFuture.supplyAsync(() -> {
            try {
                // TODO: Replace with actual UV API implementation
                // For now, return mock data with realistic values
                
                // Simulate API call delay
                Thread.sleep(500);
                
                // Calculate peak time (simplified - around solar noon)
                Calendar calendar = Calendar.getInstance();
                calendar.set(Calendar.HOUR_OF_DAY, 12);
                calendar.set(Calendar.MINUTE, 0);
                SimpleDateFormat timeFormat = new SimpleDateFormat("h:mm a", Locale.getDefault());
                
                WritableMap result = new WritableNativeMap();
                result.putInt("uvIndex", 7); // Mock UV index
                result.putInt("maxUVToday", 9); // Mock max UV for today
                result.putString("peakTime", timeFormat.format(calendar.getTime()));
                
                return result;
                
            } catch (Exception e) {
                Log.e(TAG, "UV index retrieval failed", e);
                throw new RuntimeException("Failed to get UV data: " + e.getMessage());
            }
        }, executor).whenComplete((result, error) -> {
            if (error != null) {
                promise.reject("UV_DATA_ERROR", error.getMessage(), error);
            } else {
                promise.resolve(result);
            }
        });
    }
    
    @ReactMethod
    public void getWeatherData(double latitude, double longitude, Promise promise) {
        Log.d(TAG, "Getting weather data for location: " + latitude + ", " + longitude);
        
        CompletableFuture.supplyAsync(() -> {
            try {
                // TODO: Replace with actual weather API implementation
                // For now, return mock data with realistic values
                
                // Simulate API call delay
                Thread.sleep(750);
                
                WritableMap result = new WritableNativeMap();
                result.putDouble("temperature", 22.0); // Mock temperature in Celsius
                result.putString("description", "Sunny");
                result.putInt("weatherCode", 0);
                result.putInt("humidity", 65);
                result.putDouble("windSpeed", 3.5);
                result.putInt("pressure", 1013);
                result.putInt("visibility", 10);
                result.putDouble("feelsLike", 24.0);
                
                return result;
                
            } catch (Exception e) {
                Log.e(TAG, "Weather data retrieval failed", e);
                throw new RuntimeException("Failed to get weather data: " + e.getMessage());
            }
        }, executor).whenComplete((result, error) -> {
            if (error != null) {
                promise.reject("WEATHER_DATA_ERROR", error.getMessage(), error);
            } else {
                promise.resolve(result);
            }
        });
    }
}
