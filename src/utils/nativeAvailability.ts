import { NativeModules } from 'react-native';
import { NativeModulesProxy } from 'expo-modules-core';

type ModuleLookup = Record<string, unknown>;

const proxyModules: ModuleLookup = NativeModulesProxy ?? {};
const nativeModules: ModuleLookup = NativeModules ?? {};
const availabilityCache: Record<string, boolean> = {};

function resolveModule(name: string): boolean {
  return Boolean(proxyModules[name] ?? nativeModules[name]);
}

export function isNativeModuleAvailable(name: string): boolean {
  if (availabilityCache[name] === undefined) {
    availabilityCache[name] = resolveModule(name);
  }
  return availabilityCache[name];
}

export function hasExpoLinearGradient(): boolean {
  return (
    isNativeModuleAvailable('ExpoLinearGradient') ||
    isNativeModuleAvailable('ExponentLinearGradient')
  );
}

export function hasSymbolModule(): boolean {
  return (
    isNativeModuleAvailable('SymbolModule') ||
    isNativeModuleAvailable('ExpoSymbols')
  );
}

export function hasGestureHandlerModule(): boolean {
  return (
    isNativeModuleAvailable('RNGestureHandlerModule') ||
    isNativeModuleAvailable('GestureHandlerModule')
  );
}
