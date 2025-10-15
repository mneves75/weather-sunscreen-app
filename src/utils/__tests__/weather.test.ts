/**
 * Unit tests for weather utility functions
 *
 * Tests critical i18n key generation functions with:
 * - Boundary conditions
 * - Edge cases (NaN, Infinity, negative)
 * - Translation file validation (keys exist)
 */

import { getHumidityLevel, getWindDescription, getWeatherAdvisory, hasThunderstorm, isRainy, isSnowy } from '../weather';
import { degreesToCardinal } from '../units';
import { I18N_KEYS } from '@/src/types/i18n';
import enTranslations from '@/src/i18n/en.json';
import ptBRTranslations from '@/src/i18n/pt-BR.json';

/**
 * Helper: Navigate nested object by key path
 */
function getNestedValue(obj: any, keyPath: string): any {
  const segments = keyPath.split('.');
  let current = obj;
  for (const segment of segments) {
    if (current === undefined || current === null) return undefined;
    current = current[segment];
  }
  return current;
}

/**
 * Helper: Verify i18n key exists in both language files
 */
function verifyKeyExists(key: string): boolean {
  const enValue = getNestedValue(enTranslations, key);
  const ptValue = getNestedValue(ptBRTranslations, key);
  return typeof enValue === 'string' && typeof ptValue === 'string';
}

describe('getHumidityLevel', () => {
  describe('Boundary conditions', () => {
    it('should return veryDry for humidity < 30', () => {
      expect(getHumidityLevel(0)).toBe(I18N_KEYS.weather.humidityLevels.veryDry);
      expect(getHumidityLevel(15)).toBe(I18N_KEYS.weather.humidityLevels.veryDry);
      expect(getHumidityLevel(29)).toBe(I18N_KEYS.weather.humidityLevels.veryDry);
    });

    it('should return dry for humidity 30-49', () => {
      expect(getHumidityLevel(30)).toBe(I18N_KEYS.weather.humidityLevels.dry);
      expect(getHumidityLevel(40)).toBe(I18N_KEYS.weather.humidityLevels.dry);
      expect(getHumidityLevel(49)).toBe(I18N_KEYS.weather.humidityLevels.dry);
    });

    it('should return comfortable for humidity 50-69', () => {
      expect(getHumidityLevel(50)).toBe(I18N_KEYS.weather.humidityLevels.comfortable);
      expect(getHumidityLevel(60)).toBe(I18N_KEYS.weather.humidityLevels.comfortable);
      expect(getHumidityLevel(69)).toBe(I18N_KEYS.weather.humidityLevels.comfortable);
    });

    it('should return humid for humidity 70-84', () => {
      expect(getHumidityLevel(70)).toBe(I18N_KEYS.weather.humidityLevels.humid);
      expect(getHumidityLevel(77)).toBe(I18N_KEYS.weather.humidityLevels.humid);
      expect(getHumidityLevel(84)).toBe(I18N_KEYS.weather.humidityLevels.humid);
    });

    it('should return veryHumid for humidity >= 85', () => {
      expect(getHumidityLevel(85)).toBe(I18N_KEYS.weather.humidityLevels.veryHumid);
      expect(getHumidityLevel(95)).toBe(I18N_KEYS.weather.humidityLevels.veryHumid);
      expect(getHumidityLevel(100)).toBe(I18N_KEYS.weather.humidityLevels.veryHumid);
    });
  });

  describe('Edge cases', () => {
    it('should clamp negative values to veryDry', () => {
      expect(getHumidityLevel(-10)).toBe(I18N_KEYS.weather.humidityLevels.veryDry);
      expect(getHumidityLevel(-100)).toBe(I18N_KEYS.weather.humidityLevels.veryDry);
    });

    it('should clamp values > 100 to veryHumid', () => {
      expect(getHumidityLevel(101)).toBe(I18N_KEYS.weather.humidityLevels.veryHumid);
      expect(getHumidityLevel(150)).toBe(I18N_KEYS.weather.humidityLevels.veryHumid);
      expect(getHumidityLevel(1000)).toBe(I18N_KEYS.weather.humidityLevels.veryHumid);
    });

    it('should handle NaN gracefully (default to comfortable)', () => {
      expect(getHumidityLevel(NaN)).toBe(I18N_KEYS.weather.humidityLevels.comfortable);
    });

    it('should handle Infinity gracefully (default to comfortable)', () => {
      expect(getHumidityLevel(Infinity)).toBe(I18N_KEYS.weather.humidityLevels.comfortable);
      expect(getHumidityLevel(-Infinity)).toBe(I18N_KEYS.weather.humidityLevels.comfortable);
    });
  });

  describe('Translation file validation', () => {
    it('should return keys that exist in translation files', () => {
      const testValues = [0, 29, 30, 49, 50, 69, 70, 84, 85, 100];
      testValues.forEach(humidity => {
        const key = getHumidityLevel(humidity);
        expect(verifyKeyExists(key)).toBe(true);
      });
    });
  });
});

describe('getWindDescription', () => {
  describe('Boundary conditions', () => {
    it('should return calm for wind < 5 km/h', () => {
      expect(getWindDescription(0)).toBe(I18N_KEYS.weather.windLevels.calm);
      expect(getWindDescription(2.5)).toBe(I18N_KEYS.weather.windLevels.calm);
      expect(getWindDescription(4.9)).toBe(I18N_KEYS.weather.windLevels.calm);
    });

    it('should return lightBreeze for wind 5-19 km/h', () => {
      expect(getWindDescription(5)).toBe(I18N_KEYS.weather.windLevels.lightBreeze);
      expect(getWindDescription(12)).toBe(I18N_KEYS.weather.windLevels.lightBreeze);
      expect(getWindDescription(19.9)).toBe(I18N_KEYS.weather.windLevels.lightBreeze);
    });

    it('should return moderateBreeze for wind 20-39 km/h', () => {
      expect(getWindDescription(20)).toBe(I18N_KEYS.weather.windLevels.moderateBreeze);
      expect(getWindDescription(30)).toBe(I18N_KEYS.weather.windLevels.moderateBreeze);
      expect(getWindDescription(39.9)).toBe(I18N_KEYS.weather.windLevels.moderateBreeze);
    });

    it('should return strongWind for wind 40-59 km/h', () => {
      expect(getWindDescription(40)).toBe(I18N_KEYS.weather.windLevels.strongWind);
      expect(getWindDescription(50)).toBe(I18N_KEYS.weather.windLevels.strongWind);
      expect(getWindDescription(59.9)).toBe(I18N_KEYS.weather.windLevels.strongWind);
    });

    it('should return veryStrongWind for wind >= 60 km/h', () => {
      expect(getWindDescription(60)).toBe(I18N_KEYS.weather.windLevels.veryStrongWind);
      expect(getWindDescription(100)).toBe(I18N_KEYS.weather.windLevels.veryStrongWind);
      expect(getWindDescription(200)).toBe(I18N_KEYS.weather.windLevels.veryStrongWind);
    });
  });

  describe('Edge cases', () => {
    it('should handle negative wind speeds gracefully (default to calm)', () => {
      expect(getWindDescription(-10)).toBe(I18N_KEYS.weather.windLevels.calm);
      expect(getWindDescription(-100)).toBe(I18N_KEYS.weather.windLevels.calm);
    });

    it('should handle NaN gracefully (default to calm)', () => {
      expect(getWindDescription(NaN)).toBe(I18N_KEYS.weather.windLevels.calm);
    });

    it('should handle Infinity gracefully (default to calm)', () => {
      expect(getWindDescription(Infinity)).toBe(I18N_KEYS.weather.windLevels.calm);
      expect(getWindDescription(-Infinity)).toBe(I18N_KEYS.weather.windLevels.calm);
    });

    it('should clamp extreme values to reasonable bounds', () => {
      expect(getWindDescription(500)).toBe(I18N_KEYS.weather.windLevels.veryStrongWind);
    });
  });

  describe('Translation file validation', () => {
    it('should return keys that exist in translation files', () => {
      const testValues = [0, 4, 5, 19, 20, 39, 40, 59, 60, 100];
      testValues.forEach(speed => {
        const key = getWindDescription(speed);
        expect(verifyKeyExists(key)).toBe(true);
      });
    });
  });
});

describe('degreesToCardinal', () => {
  describe('Cardinal directions', () => {
    it('should map degrees to 16 cardinal directions', () => {
      expect(degreesToCardinal(0)).toBe(I18N_KEYS.weather.cardinal.N);
      expect(degreesToCardinal(90)).toBe(I18N_KEYS.weather.cardinal.E);
      expect(degreesToCardinal(180)).toBe(I18N_KEYS.weather.cardinal.S);
      expect(degreesToCardinal(270)).toBe(I18N_KEYS.weather.cardinal.W);
    });

    it('should handle intercardinal directions', () => {
      expect(degreesToCardinal(45)).toBe(I18N_KEYS.weather.cardinal.NE);
      expect(degreesToCardinal(135)).toBe(I18N_KEYS.weather.cardinal.SE);
      expect(degreesToCardinal(225)).toBe(I18N_KEYS.weather.cardinal.SW);
      expect(degreesToCardinal(315)).toBe(I18N_KEYS.weather.cardinal.NW);
    });
  });

  describe('Edge cases', () => {
    it('should wrap around at 360°', () => {
      expect(degreesToCardinal(360)).toBe(I18N_KEYS.weather.cardinal.N);
      expect(degreesToCardinal(720)).toBe(I18N_KEYS.weather.cardinal.N);
    });

    it('should handle negative degrees', () => {
      expect(degreesToCardinal(-90)).toBe(I18N_KEYS.weather.cardinal.W);
      expect(degreesToCardinal(-180)).toBe(I18N_KEYS.weather.cardinal.S);
      expect(degreesToCardinal(-270)).toBe(I18N_KEYS.weather.cardinal.E);
    });
  });

  describe('Translation file validation', () => {
    it('should return keys that exist in translation files', () => {
      const testDegrees = [0, 45, 90, 135, 180, 225, 270, 315];
      testDegrees.forEach(degrees => {
        const key = degreesToCardinal(degrees);
        expect(verifyKeyExists(key)).toBe(true);
      });
    });
  });
});

describe('getWeatherAdvisory', () => {
  const createCondition = (wmoCode: number) => ({
    main: 'Test',
    description: 'Test condition',
    wmoCode,
  });

  it('should return thunderstorm advisory for thunderstorm conditions', () => {
    const advisory = getWeatherAdvisory(createCondition(95), 25);
    expect(advisory).toBe(I18N_KEYS.weather.advisories.thunderstorm);
  });

  it('should return extremeHeat for temp >= 35°C', () => {
    const advisory = getWeatherAdvisory(createCondition(0), 35);
    expect(advisory).toBe(I18N_KEYS.weather.advisories.extremeHeat);

    const advisory2 = getWeatherAdvisory(createCondition(0), 40);
    expect(advisory2).toBe(I18N_KEYS.weather.advisories.extremeHeat);
  });

  it('should return extremeCold for temp <= 0°C', () => {
    const advisory = getWeatherAdvisory(createCondition(0), 0);
    expect(advisory).toBe(I18N_KEYS.weather.advisories.extremeCold);

    const advisory2 = getWeatherAdvisory(createCondition(0), -10);
    expect(advisory2).toBe(I18N_KEYS.weather.advisories.extremeCold);
  });

  it('should prioritize thunderstorm over temperature warnings', () => {
    const advisory = getWeatherAdvisory(createCondition(95), 40);
    expect(advisory).toBe(I18N_KEYS.weather.advisories.thunderstorm);
  });

  it('should return null when no advisory is needed', () => {
    const advisory = getWeatherAdvisory(createCondition(0), 20);
    expect(advisory).toBeNull();
  });

  describe('Translation file validation', () => {
    it('should return keys that exist in translation files', () => {
      const testCases = [
        { condition: createCondition(95), temp: 25 },
        { condition: createCondition(61), temp: 25 },
        { condition: createCondition(71), temp: 25 },
        { condition: createCondition(0), temp: 35 },
        { condition: createCondition(0), temp: 0 },
      ];

      testCases.forEach(({ condition, temp }) => {
        const advisory = getWeatherAdvisory(condition, temp);
        if (advisory !== null) {
          expect(verifyKeyExists(advisory)).toBe(true);
        }
      });
    });
  });
});
