#!/usr/bin/env node
/**
 * Version Sync Script for Weather Sunscreen App
 * Syncs version numbers across all project files using CHANGELOG.md as source of truth
 */

const fs = require('fs');
const path = require('path');

const isDryRun = process.argv.includes('--dry-run');

const FILES = {
  changelog: 'CHANGELOG.md',
  packageJson: 'package.json',
  appJson: 'app.json',
};

function getLatestVersionFromChangelog() {
  try {
    if (!fs.existsSync(FILES.changelog)) {
      console.warn('⚠️  CHANGELOG.md not found. Creating with current version...');
      const packageJson = JSON.parse(fs.readFileSync(FILES.packageJson, 'utf8'));
      const currentVersion = packageJson.version || '1.0.0';
      
      const changelogContent = `# Changelog

All notable changes to the Weather Sunscreen App will be documented in this file.

## [${currentVersion}] - ${new Date().toISOString().split('T')[0]}

### Added
- Initial release of Weather Sunscreen App
- Weather data display with current conditions
- UV index monitoring and sunscreen recommendations
- Cross-platform support (iOS, Android, Web)
- Native modules for enhanced performance
- Location-based weather services

### Features
- Real-time weather updates
- UV index with detailed recommendations
- Skin type-specific sunscreen advice
- Modern React Native architecture with Expo
- Production-ready error handling and loading states
`;
      
      if (!isDryRun) {
        fs.writeFileSync(FILES.changelog, changelogContent);
        console.log('📝 Created CHANGELOG.md with current version');
      }
      
      return currentVersion;
    }
    
    const changelogContent = fs.readFileSync(FILES.changelog, 'utf8');
    const versionMatch = changelogContent.match(/## \[(\d+\.\d+\.\d+)\] - \d{4}-\d{2}-\d{2}/);
    
    if (!versionMatch) {
      throw new Error('Could not find version in CHANGELOG.md format: ## [X.Y.Z] - YYYY-MM-DD');
    }
    
    return versionMatch[1];
  } catch (error) {
    console.error('❌ Error reading CHANGELOG.md:', error.message);
    process.exit(1);
  }
}

function syncVersions() {
  const targetVersion = getLatestVersionFromChangelog();
  console.log(`🎯 Target version: ${targetVersion}`);
  
  if (isDryRun) {
    console.log('🧪 DRY RUN MODE - No files will be modified');
  }
  
  // Update package.json
  updatePackageJson(targetVersion);
  
  // Update app.json
  updateAppJson(targetVersion);
  
  console.log(`✅ Version sync completed${isDryRun ? ' (dry run)' : ''}!`);
}

function updatePackageJson(version) {
  try {
    const packagePath = FILES.packageJson;
    const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    if (packageData.version === version) {
      console.log(`📦 package.json already at version ${version}`);
      return;
    }
    
    console.log(`📦 Updating package.json: ${packageData.version} → ${version}`);
    
    if (!isDryRun) {
      packageData.version = version;
      fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2) + '\n');
    }
  } catch (error) {
    console.error('❌ Error updating package.json:', error.message);
  }
}

function updateAppJson(version) {
  try {
    const appPath = FILES.appJson;
    const appData = JSON.parse(fs.readFileSync(appPath, 'utf8'));
    
    if (appData.expo.version === version) {
      console.log(`📱 app.json already at version ${version}`);
      return;
    }
    
    console.log(`📱 Updating app.json: ${appData.expo.version} → ${version}`);
    
    if (!isDryRun) {
      appData.expo.version = version;
      fs.writeFileSync(appPath, JSON.stringify(appData, null, 2) + '\n');
    }
  } catch (error) {
    console.error('❌ Error updating app.json:', error.message);
  }
}

// Run the sync
syncVersions();