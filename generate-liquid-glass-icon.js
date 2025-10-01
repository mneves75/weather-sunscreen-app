#!/usr/bin/env node

/**
 * Liquid Glass iOS Icon Generator for Weather Sunscreen App
 *
 * Creates an iOS 26 liquid glass style icon featuring:
 * - Multi-layered glass morphism design
 * - Weather elements (sun with UV protection)
 * - Sunscreen lotion theme
 * - Proper depth and lighting effects
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

class LiquidGlassIconGenerator {
  constructor(size = 1024) {
    this.size = size;
    this.center = size / 2;
    this.radius = size * 0.35;
  }

  // Create SVG for the liquid glass icon
  generateSVG() {
    const { size, center, radius } = this;

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- Glass morphism gradients -->
          <radialGradient id="glassGradient" cx="0.3" cy="0.3" r="0.8">
            <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:0.8" />
            <stop offset="40%" style="stop-color:#8B5CF6;stop-opacity:0.6" />
            <stop offset="100%" style="stop-color:#1E40AF;stop-opacity:0.9" />
          </radialGradient>

          <!-- Sun ray gradient -->
          <linearGradient id="sunRayGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#F59E0B;stop-opacity:0.9" />
            <stop offset="50%" style="stop-color:#F97316;stop-opacity:0.7" />
            <stop offset="100%" style="stop-color:#DC2626;stop-opacity:0.5" />
          </linearGradient>

          <!-- Protection shield gradient -->
          <radialGradient id="shieldGradient" cx="0.5" cy="0.3" r="0.7">
            <stop offset="0%" style="stop-color:#10B981;stop-opacity:0.8" />
            <stop offset="70%" style="stop-color:#059669;stop-opacity:0.6" />
            <stop offset="100%" style="stop-color:#047857;stop-opacity:0.9" />
          </radialGradient>

          <!-- Glass blur filter -->
          <filter id="glassBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2"/>
          </filter>

          <!-- Subtle shadow filter -->
          <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.25"/>
          </filter>
        </defs>

        <!-- Background glass orb -->
        <circle cx="${center}" cy="${center}" r="${radius}"
                fill="url(#glassGradient)"
                filter="url(#glassBlur)"
                opacity="0.3"/>

        <!-- Main glass surface -->
        <circle cx="${center}" cy="${center}" r="${radius * 0.9}"
                fill="url(#glassGradient)"
                filter="url(#softShadow)"/>

        <!-- Inner highlight ring -->
        <circle cx="${center * 0.85}" cy="${center * 0.85}" r="${radius * 0.6}"
                fill="none"
                stroke="rgba(255,255,255,0.4)"
                stroke-width="2"
                opacity="0.8"/>

        <!-- Sun rays -->
        ${this.generateSunRays()}

        <!-- Sunscreen protection elements -->
        ${this.generateProtectionElements()}

        <!-- UV level indicator dots -->
        ${this.generateUVIndicators()}

        <!-- Center glow effect -->
        <circle cx="${center}" cy="${center}" r="${radius * 0.4}"
                fill="url(#sunRayGradient)"
                opacity="0.3"/>
      </svg>
    `;
  }

  generateSunRays() {
    const rays = [];
    const { center, radius } = this;
    const rayCount = 12;

    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * 2 * Math.PI;
      const x1 = center + Math.cos(angle) * radius * 0.7;
      const y1 = center + Math.sin(angle) * radius * 0.7;
      const x2 = center + Math.cos(angle) * radius * 1.1;
      const y2 = center + Math.sin(angle) * radius * 1.1;

      rays.push(`
        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
              stroke="url(#sunRayGradient)"
              stroke-width="6"
              opacity="0.8"/>
      `);
    }

    return rays.join('');
  }

  generateProtectionElements() {
    const { center, radius } = this;
    const elements = [];

    // Protective shield overlay
    elements.push(`
      <path d="M ${center - radius * 0.3} ${center - radius * 0.2}
               Q ${center - radius * 0.1} ${center - radius * 0.4}
                 ${center + radius * 0.1} ${center - radius * 0.3}
               Q ${center + radius * 0.3} ${center - radius * 0.2}
                 ${center + radius * 0.2} ${center}
               Q ${center + radius * 0.3} ${center + radius * 0.2}
                 ${center + radius * 0.1} ${center + radius * 0.3}
               Q ${center - radius * 0.1} ${center + radius * 0.4}
                 ${center - radius * 0.3} ${center + radius * 0.2} Z"
            fill="url(#shieldGradient)"
            opacity="0.7"/>
    `);

    // Sunscreen bottle silhouette
    elements.push(`
      <rect x="${center - radius * 0.15}" y="${center + radius * 0.1}"
            width="${radius * 0.3}" height="${radius * 0.4}"
            rx="${radius * 0.05}"
            fill="rgba(255,255,255,0.2)"
            stroke="rgba(255,255,255,0.4)"
            stroke-width="2"/>
    `);

    return elements.join('');
  }

  generateUVIndicators() {
    const { center, radius } = this;
    const indicators = [];
    const uvLevels = 5;

    for (let i = 0; i < uvLevels; i++) {
      const angle = (i / uvLevels) * 2 * Math.PI - Math.PI / 2;
      const distance = radius * 0.75;
      const x = center + Math.cos(angle) * distance;
      const y = center + Math.sin(angle) * distance;

      indicators.push(`
        <circle cx="${x}" cy="${y}" r="8"
                fill="${i === 0 ? '#10B981' : i === 1 ? '#F59E0B' : i === 2 ? '#F97316' : i === 3 ? '#EF4444' : '#9333EA'}"
                opacity="0.9"/>
      `);
    }

    return indicators.join('');
  }

  async generateIcon() {
    const svg = this.generateSVG();

    // Create the main icon
    await sharp(Buffer.from(svg))
      .png()
      .toFile('assets/images/icon-liquid-glass-1024.png');

    console.log('✅ Generated 1024px liquid glass icon');

    // Generate all iOS icon sizes
    const sizes = [
      { name: 'icon-180', size: 180 },
      { name: 'icon-152', size: 152 },
      { name: 'icon-120', size: 120 },
      { name: 'icon-87', size: 87 },
      { name: 'icon-80', size: 80 },
      { name: 'icon-58', size: 58 },
      { name: 'icon-40', size: 40 }
    ];

    for (const { name, size } of sizes) {
      await sharp('assets/images/icon-liquid-glass-1024.png')
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(`assets/images/${name}.png`);

      console.log(`✅ Generated ${name}.png (${size}x${size})`);
    }

    // Create adaptive icon background
    await this.generateAdaptiveIcon();
  }

  async generateAdaptiveIcon() {
    const { size } = this;

    // Create a subtle background for adaptive icon
    const backgroundSvg = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="adaptiveBg" cx="0.5" cy="0.5" r="0.8">
            <stop offset="0%" style="stop-color:#DBEAFE;stop-opacity:0.3" />
            <stop offset="100%" style="stop-color:#1E40AF;stop-opacity:0.1" />
          </radialGradient>
        </defs>
        <circle cx="${size/2}" cy="${size/2}" r="${size * 0.4}"
                fill="url(#adaptiveBg)"/>
      </svg>
    `;

    await sharp(Buffer.from(backgroundSvg))
      .png()
      .toFile('assets/images/adaptive-icon-background.png');

    console.log('✅ Generated adaptive icon background');
  }
}

// Generate the icon
async function main() {
  try {
    const generator = new LiquidGlassIconGenerator(1024);
    await generator.generateIcon();
    console.log('\n🎉 Liquid glass iOS icon generation complete!');
    console.log('\nNext steps:');
    console.log('1. Update ios/[Project]/Info.plist to reference new icons');
    console.log('2. Run react-native run-ios to test the new icon');
    console.log('3. Submit to App Store with updated screenshots');
  } catch (error) {
    console.error('❌ Error generating icon:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = LiquidGlassIconGenerator;
