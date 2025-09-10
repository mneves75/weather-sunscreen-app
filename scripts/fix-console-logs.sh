#!/bin/bash

# Fix console.log issues in service files

echo "🔧 Fixing console.log usage in service files..."

# Add logger import to files that don't have it
for file in src/services/sunscreenService.ts src/services/notificationService.ts src/services/locationService.ts; do
  if ! grep -q "import { logger }" "$file"; then
    # Add logger import after the first import statement
    sed -i '' "1a\\
import { logger } from './loggerService';" "$file"
  fi
done

# Replace console.log with logger.info
find src/services -name "*.ts" -not -name "loggerService.ts" -exec sed -i '' 's/console\.log(/logger.info(/g' {} \;

# Replace console.warn with logger.warn  
find src/services -name "*.ts" -not -name "loggerService.ts" -exec sed -i '' 's/console\.warn(/logger.warn(/g' {} \;

# Replace console.error with logger.error (need special handling for error parameter)
# Simple replacements first
find src/services -name "*.ts" -not -name "loggerService.ts" -exec sed -i '' 's/console\.error(/logger.error(/g' {} \;

echo "✅ Console.log replacements completed!"
echo "📝 Files modified:"
find src/services -name "*.ts" -not -name "loggerService.ts" -exec grep -l "logger\." {} \;