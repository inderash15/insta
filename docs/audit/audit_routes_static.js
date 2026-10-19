import fs from 'fs';
import path from 'path';

// 1. Read AppRoutes.jsx
const appRoutesPath = path.join(process.cwd(), 'frontend/src/AppRoutes.jsx');
const appRoutesContent = fs.readFileSync(appRoutesPath, 'utf8');

// Match all <Route path="..."
const routeRegex = /<Route\s+path=["']([^"']+)["']/g;
const declaredRoutes = new Set();
let match;
while ((match = routeRegex.exec(appRoutesContent)) !== null) {
  declaredRoutes.add(match[1]);
}

console.log(`Found ${declaredRoutes.size} declared routes in AppRoutes.jsx`);

// 2. Read routeRegistry.js
const registryPath = path.join(process.cwd(), 'frontend/src/config/routeRegistry.js');
const registryContent = fs.readFileSync(registryPath, 'utf8');
const registryRegex = /path:\s*['"]([^'"]+)['"]/g;
const registryRoutes = new Set();
while ((match = registryRegex.exec(registryContent)) !== null) {
  registryRoutes.add(match[1]);
}

console.log(`Found ${registryRoutes.size} routes in routeRegistry.js`);

// Compare declared vs registry
const missingInAppRoutes = [...registryRoutes].filter(r => !declaredRoutes.has(r));
console.log(`\nRegistry routes missing in AppRoutes.jsx: ${missingInAppRoutes.length}`);
if (missingInAppRoutes.length > 0) {
  console.log(missingInAppRoutes);
}

// 3. Scan all JSX files for <Link to="..." or navigate('...')
function scanDir(dir) {
  const results = [];
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) {
      results.push(...scanDir(full));
    } else if (f.name.endsWith('.jsx') || f.name.endsWith('.js')) {
      results.push(full);
    }
  }
  return results;
}

const allSrcFiles = scanDir(path.join(process.cwd(), 'frontend/src'));
const linkDestinations = new Map();

for (const file of allSrcFiles) {
  const content = fs.readFileSync(file, 'utf8');
  // Match to="..." or to={'...'} or to={`...`}
  const linkRegex = /to=["']([^"'{}$]+)["']/g;
  while ((match = linkRegex.exec(content)) !== null) {
    const dest = match[1];
    if (!linkDestinations.has(dest)) linkDestinations.set(dest, []);
    linkDestinations.get(dest).push(path.relative(process.cwd(), file));
  }

  // Match navigate('...')
  const navRegex = /navigate\(["']([^"'{}$]+)["']/g;
  while ((match = navRegex.exec(content)) !== null) {
    const dest = match[1];
    if (!linkDestinations.has(dest)) linkDestinations.set(dest, []);
    linkDestinations.get(dest).push(path.relative(process.cwd(), file));
  }
}

console.log(`\nFound ${linkDestinations.size} static link/navigate destinations across codebase.`);

// Check which link destinations don't match any declared route
const brokenLinks = [];
for (const [dest, files] of linkDestinations.entries()) {
  if (dest.startsWith('http') || dest.startsWith('#') || dest === '') continue;
  
  // Check if dest matches declared routes (handling simple params)
  const isMatched = [...declaredRoutes].some(dr => {
    if (dr === dest || dr === '*') return true;
    const pattern = '^' + dr.replace(/:[a-zA-Z0-9_]+/g, '[^/]+') + '$';
    return new RegExp(pattern).test(dest);
  });

  if (!isMatched) {
    brokenLinks.push({ dest, files });
  }
}

console.log(`\nPotential broken link destinations without route matching: ${brokenLinks.length}`);
for (const b of brokenLinks) {
  console.log(`- "${b.dest}" referenced in: ${b.files.slice(0, 3).join(', ')}`);
}
