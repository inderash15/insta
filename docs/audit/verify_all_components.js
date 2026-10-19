import fs from 'fs';
import path from 'path';

function scanDir(dir) {
  const results = [];
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) {
      results.push(...scanDir(full));
    } else if (f.name.endsWith('.jsx')) {
      results.push(full);
    }
  }
  return results;
}

const pages = scanDir(path.join(process.cwd(), 'frontend/src/pages'));
const components = scanDir(path.join(process.cwd(), 'frontend/src/components'));
const allFiles = [...pages, ...components];

const issues = [];

for (const file of allFiles) {
  const relPath = path.relative(process.cwd(), file);
  const code = fs.readFileSync(file, 'utf8');

  // 1. Check lucide-react imports vs JSX usage
  const lucideMatch = code.match(/import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/);
  const importedLucideIcons = new Set();
  if (lucideMatch) {
    const iconNames = lucideMatch[1].split(',').map(s => s.trim().split(/\s+as\s+/)[0].trim()).filter(Boolean);
    iconNames.forEach(name => importedLucideIcons.add(name));
  }

  // Common Lucide icon names used in JSX: <IconName ...
  const jsxElementRegex = /<([A-Z][a-zA-Z0-9]+)\b/g;
  let elemMatch;
  const usedElements = new Set();
  while ((elemMatch = jsxElementRegex.exec(code)) !== null) {
    usedElements.add(elemMatch[1]);
  }

  // Check common icons that might be missing from import
  const commonIcons = [
    'Heart', 'MessageCircle', 'Send', 'Bookmark', 'Share2', 'MoreHorizontal',
    'Smile', 'Image', 'Camera', 'Video', 'Film', 'Compass', 'Search',
    'User', 'Users', 'Settings', 'LogOut', 'Bell', 'Check', 'X',
    'Plus', 'PlusSquare', 'ChevronLeft', 'ChevronRight', 'ArrowLeft',
    'Lock', 'Shield', 'HelpCircle', 'AlertCircle', 'Loader2', 'Edit'
  ];

  for (const icon of commonIcons) {
    if (usedElements.has(icon) && !code.includes(`import`) && !importedLucideIcons.has(icon)) {
      // Check if it's imported from anywhere in the file
      const importRegex = new RegExp(`\\b${icon}\\b.*from`);
      const namedImportRegex = new RegExp(`\\bimport\\s*\\{[^}]*\\b${icon}\\b[^}]*\\}`);
      if (!importRegex.test(code) && !namedImportRegex.test(code)) {
        issues.push({
          file: relPath,
          type: 'MISSING_ICON_IMPORT',
          detail: `Icon <${icon}> used in JSX but not imported!`
        });
      }
    }
  }

  // 2. Check for missing React / hooks
  const hooks = ['useState', 'useEffect', 'useRef', 'useCallback', 'useMemo', 'useContext'];
  for (const hook of hooks) {
    if (new RegExp(`\\b${hook}\\s*\\(`).test(code)) {
      if (!code.includes(hook) || !code.includes('react')) {
        issues.push({
          file: relPath,
          type: 'MISSING_HOOK_IMPORT',
          detail: `Hook ${hook} used but not imported from react!`
        });
      }
    }
  }
}

console.log(`Scan completed across ${allFiles.length} JSX files.`);
console.log(`Issues found: ${issues.length}`);
for (const iss of issues) {
  console.log(`[${iss.type}] ${iss.file}: ${iss.detail}`);
}
