/**
 * UV index utilities and SPF calculations
 */

import { SkinType, UVLevel, UVRecommendation } from '@/src/types';

/**
 * Calculate UV level from UV index value
 */
export function calculateUVLevel(uvIndex: number): UVLevel {
  if (uvIndex >= 0 && uvIndex <= 2) return 'low';
  if (uvIndex >= 3 && uvIndex <= 5) return 'moderate';
  if (uvIndex >= 6 && uvIndex <= 7) return 'high';
  if (uvIndex >= 8 && uvIndex <= 10) return 'very-high';
  return 'extreme';
}

/**
 * Get UV level color for visual indicators
 */
export function getUVLevelColor(level: UVLevel): {
  light: string;
  dark: string;
  indicator: string;
} {
  const colors = {
    low: {
      light: '#4CAF50',
      dark: '#66BB6A',
      indicator: '#4CAF50',
    },
    moderate: {
      light: '#FFC107',
      dark: '#FFD54F',
      indicator: '#FFC107',
    },
    high: {
      light: '#FF9800',
      dark: '#FFB74D',
      indicator: '#FF9800',
    },
    'very-high': {
      light: '#F44336',
      dark: '#EF5350',
      indicator: '#F44336',
    },
    extreme: {
      light: '#9C27B0',
      dark: '#BA68C8',
      indicator: '#9C27B0',
    },
  };
  
  return colors[level];
}

/**
 * Get UV level label
 */
export function getUVLevelLabel(level: UVLevel, locale: string = 'en'): string {
  if (locale === 'pt-BR') {
    const labels: Record<UVLevel, string> = {
      low: 'Baixo',
      moderate: 'Moderado',
      high: 'Alto',
      'very-high': 'Muito Alto',
      extreme: 'Extremo',
    };
    return labels[level];
  }
  
  const labels: Record<UVLevel, string> = {
    low: 'Low',
    moderate: 'Moderate',
    high: 'High',
    'very-high': 'Very High',
    extreme: 'Extreme',
  };
  
  return labels[level];
}

/**
 * Get SPF recommendation based on UV index and skin type
 */
export function getSPFRecommendation(uvIndex: number, skinType: SkinType): number {
  const baseSpf: Record<SkinType, number> = {
    'very-fair': 50,
    'fair': 30,
    'medium': 20,
    'olive': 15,
    'brown': 15,
    'black': 15,
  };

  const spf = baseSpf[skinType];

  // Increase SPF for higher UV levels
  if (uvIndex >= 8) {
    return Math.min(spf + 20, 50);
  }
  if (uvIndex >= 6) {
    return Math.min(spf + 10, 50);
  }

  return spf;
}

/**
 * Get skin type label
 */
export function getSkinTypeLabel(skinType: SkinType, locale: string = 'en'): string {
  if (locale === 'pt-BR') {
    const labels: Record<SkinType, string> = {
      'very-fair': 'Muito Clara',
      'fair': 'Clara',
      'medium': 'Média',
      'olive': 'Morena',
      'brown': 'Marrom',
      'black': 'Negra',
    };
    return labels[skinType];
  }
  
  const labels: Record<SkinType, string> = {
    'very-fair': 'Very Fair',
    'fair': 'Fair',
    'medium': 'Medium',
    'olive': 'Olive',
    'brown': 'Brown',
    'black': 'Black',
  };
  
  return labels[skinType];
}

/**
 * Get protection time in minutes based on UV index and SPF
 * Formula: Protection time ≈ (SPF × Burn time without protection)
 */
export function getProtectionTime(uvIndex: number, spf: number, skinType: SkinType): number {
  // Burn time without protection (in minutes) by skin type
  const burnTime: Record<SkinType, number> = {
    'very-fair': 10,
    'fair': 15,
    'medium': 20,
    'olive': 30,
    'brown': 45,
    'black': 60,
  };
  
  // Adjust burn time based on UV index
  const adjustedBurnTime = burnTime[skinType] * (3 / Math.max(uvIndex, 3));
  
  // Calculate protection time
  return Math.floor(adjustedBurnTime * spf * 0.7); // 0.7 factor for realistic protection
}

/**
 * Get UV protection recommendations
 */
export function getUVRecommendations(
  uvIndex: number,
  skinType: SkinType,
  locale: string = 'en'
): UVRecommendation[] {
  const spf = getSPFRecommendation(uvIndex, skinType);
  const level = calculateUVLevel(uvIndex);
  
  const recommendations: UVRecommendation[] = [];
  
  if (locale === 'pt-BR') {
    // SPF recommendation
    recommendations.push({
      type: 'spf',
      message: `Use protetor solar FPS ${spf}+`,
      priority: level === 'extreme' || level === 'very-high' ? 'high' : 'medium',
    });
    
    // Shade recommendation
    if (uvIndex >= 6) {
      recommendations.push({
        type: 'shade',
        message: 'Procure sombra durante o meio-dia',
        priority: uvIndex >= 8 ? 'high' : 'medium',
      });
    }
    
    // Clothing recommendation
    if (uvIndex >= 8) {
      recommendations.push({
        type: 'clothing',
        message: 'Use roupas de proteção e chapéu',
        priority: 'high',
      });
    }
    
    // Sunglasses recommendation
    if (uvIndex >= 3) {
      recommendations.push({
        type: 'sunglasses',
        message: 'Use óculos de sol com proteção UV',
        priority: uvIndex >= 6 ? 'medium' : 'low',
      });
    }
    
    // Timing recommendation
    if (uvIndex >= 6) {
      recommendations.push({
        type: 'timing',
        message: 'Evite exposição entre 10h e 16h',
        priority: uvIndex >= 8 ? 'high' : 'medium',
      });
    }
  } else {
    // SPF recommendation
    recommendations.push({
      type: 'spf',
      message: `Use SPF ${spf}+ sunscreen`,
      priority: level === 'extreme' || level === 'very-high' ? 'high' : 'medium',
    });
    
    // Shade recommendation
    if (uvIndex >= 6) {
      recommendations.push({
        type: 'shade',
        message: 'Seek shade during midday hours',
        priority: uvIndex >= 8 ? 'high' : 'medium',
      });
    }
    
    // Clothing recommendation
    if (uvIndex >= 8) {
      recommendations.push({
        type: 'clothing',
        message: 'Wear protective clothing and a hat',
        priority: 'high',
      });
    }
    
    // Sunglasses recommendation
    if (uvIndex >= 3) {
      recommendations.push({
        type: 'sunglasses',
        message: 'Wear UV-blocking sunglasses',
        priority: uvIndex >= 6 ? 'medium' : 'low',
      });
    }
    
    // Timing recommendation
    if (uvIndex >= 6) {
      recommendations.push({
        type: 'timing',
        message: 'Avoid sun exposure between 10 AM and 4 PM',
        priority: uvIndex >= 8 ? 'high' : 'medium',
      });
    }
  }
  
  return recommendations;
}

/**
 * Format UV index for display
 */
export function formatUVIndex(uvIndex: number): string {
  return uvIndex.toFixed(1);
}

