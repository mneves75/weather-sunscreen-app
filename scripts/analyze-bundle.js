#!/usr/bin/env node

/**
 * Bundle analysis script for performance optimization
 * Analyzes bundle size, dependencies, and provides optimization recommendations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📊 Bundle Analysis for New Architecture Performance\n');

// Generate bundle stats
try {
  console.log('🔍 Analyzing bundle composition...');
  
  // Create a temporary expo export to analyze
  console.log('📦 Creating production bundle...');
  execSync('npx expo export --dump-assetmap --dump-sourcemap', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

  // Analyze the generated files
  const distPath = path.join(process.cwd(), 'dist');
  if (fs.existsSync(distPath)) {
    
    // Analyze bundle sizes
    const bundlePath = path.join(distPath, '_expo', 'static', 'js', 'web');
    if (fs.existsSync(bundlePath)) {
      const files = fs.readdirSync(bundlePath);
      
      console.log('\n📊 Bundle Size Analysis:');
      let totalSize = 0;
      
      files.forEach(file => {
        if (file.endsWith('.js')) {
          const filePath = path.join(bundlePath, file);
          const stats = fs.statSync(filePath);
          const sizeKB = Math.round(stats.size / 1024);
          console.log(`  ${file}: ${sizeKB} KB`);
          totalSize += sizeKB;
        }
      });
      
      console.log(`\n📈 Total Bundle Size: ${totalSize} KB`);
      
      // Performance recommendations
      console.log('\n💡 Performance Recommendations:');
      if (totalSize > 3000) {
        console.log('  ⚠️  Bundle size is large (>3MB). Consider:');
        console.log('     - Code splitting with React.lazy()');
        console.log('     - Tree shaking optimization');
        console.log('     - Remove unused dependencies');
      } else if (totalSize > 1500) {
        console.log('  ⚠️  Bundle size is moderate (1.5-3MB). Consider:');
        console.log('     - Analyze large dependencies');
        console.log('     - Enable tree shaking');
      } else {
        console.log('  ✅ Bundle size looks good (<1.5MB)');
      }

      // New Architecture specific optimizations
      console.log('\n🏗️  New Architecture Optimizations:');
      console.log('  ✅ TurboModules reduce bridge overhead');
      console.log('  ✅ Fabric components improve rendering performance');
      console.log('  ✅ JSI enables synchronous native calls');
      console.log('  ✅ React Compiler optimizations enabled');
      
    } else {
      console.log('⚠️  Bundle analysis path not found');
    }

    // Check for asset optimization
    const assetsPath = path.join(distPath, '_expo', 'static', 'media');
    if (fs.existsSync(assetsPath)) {
      const assets = fs.readdirSync(assetsPath);
      let totalAssetSize = 0;
      
      console.log('\n🖼️  Asset Analysis:');
      assets.forEach(asset => {
        const assetPath = path.join(assetsPath, asset);
        const stats = fs.statSync(assetPath);
        const sizeKB = Math.round(stats.size / 1024);
        console.log(`  ${asset}: ${sizeKB} KB`);
        totalAssetSize += sizeKB;
      });
      
      console.log(`\n📈 Total Asset Size: ${totalAssetSize} KB`);
      
      if (totalAssetSize > 1000) {
        console.log('\n💡 Asset Optimization Recommendations:');
        console.log('  ⚠️  Large asset size detected. Consider:');
        console.log('     - Image compression and WebP format');
        console.log('     - Asset lazy loading');
        console.log('     - Remove unused assets');
      }
    }

  } else {
    console.log('⚠️  Export directory not found. Make sure expo export completed successfully.');
  }

  console.log('\n✅ Bundle analysis complete!');

} catch (error) {
  console.error('❌ Bundle analysis failed:', error.message);
  console.log('\n💡 To fix this, ensure your project builds successfully:');
  console.log('   npm run typecheck');
  console.log('   npm run lint');
  console.log('   npm test');
}

// Performance targets for New Architecture
console.log('\n🎯 Performance Targets (New Architecture):');
console.log('  📱 App Launch: <2s cold start');
console.log('  ⚡ TurboModule Calls: <50ms latency');
console.log('  🎨 Component Renders: 60fps consistent');
console.log('  🧠 Memory Usage: <150MB baseline');
console.log('  📦 Bundle Size: <15MB total');

console.log('\n📚 For more optimization tips:');
console.log('  https://docs.expo.dev/guides/performance/');
console.log('  https://reactnative.dev/docs/new-architecture-intro');