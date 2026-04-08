const fs = require('fs');
const path = require('path');

const apiRoutesDir = path.join(__dirname, 'app/api');

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file uses old getServerSession
    if (content.includes('getServerSession') && content.includes('next-auth')) {
      console.log(`Fixing ${filePath}`);
      
      // Replace import
      content = content.replace(
        /import\s+\{\s*getServerSession\s*\}\s+from\s+["']next-auth["'];/,
        ''
      );
      
      // Replace authOptions import if exists
      content = content.replace(
        /import\s+\{\s*authOptions\s*\}\s+from\s+["']@\/server\/auth["'];/,
        'import { auth } from "@/server/auth";'
      );
      
      // Add auth import if not already there
      if (!content.includes('import { auth }')) {
        content = content.replace(
          /import\s+\{([^}]*)\}\s+from\s+["']@\/server\/auth["'];/,
          'import {$1, auth } from "@/server/auth";'
        );
      }
      
      // Replace getServerSession(authOptions) with auth()
      content = content.replace(
        /getServerSession\(authOptions\)/g,
        'auth()'
      );
      
      // Replace getServerSession() with auth() (if authOptions was imported separately)
      content = content.replace(
        /await getServerSession\(\)/g,
        'await auth()'
      );
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  ✓ Fixed ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`  ✗ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

function scanDirectory(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  let fixedCount = 0;
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      fixedCount += scanDirectory(fullPath);
    } else if (file.name === 'route.ts' || file.name === 'route.js') {
      if (fixFile(fullPath)) {
        fixedCount++;
      }
    }
  }
  
  return fixedCount;
}

console.log('=== FIXING NEXTAUTH V5 API ROUTES ===');
const fixed = scanDirectory(apiRoutesDir);
console.log(`\nFixed ${fixed} files.`);

// Also fix layout.tsx if it exists
const layoutPath = path.join(__dirname, 'app/layout.tsx');
if (fs.existsSync(layoutPath)) {
  let layoutContent = fs.readFileSync(layoutPath, 'utf8');
  if (layoutContent.includes('getServerSession')) {
    console.log('\nFixing layout.tsx...');
    layoutContent = layoutContent.replace(
      /import\s+\{\s*getServerSession\s*\}\s+from\s+["']next-auth["'];/g,
      ''
    );
    layoutContent = layoutContent.replace(
      /import\s+\{\s*authOptions\s*\}\s+from\s+["']@\/server\/auth["'];/g,
      'import { auth } from "@/server/auth";'
    );
    layoutContent = layoutContent.replace(
      /getServerSession\(authOptions\)/g,
      'auth()'
    );
    fs.writeFileSync(layoutPath, layoutContent, 'utf8');
    console.log('  ✓ Fixed layout.tsx');
  }
}

console.log('\n=== DONE ===');