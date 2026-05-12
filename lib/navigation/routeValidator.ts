import fs from 'fs';
import path from 'path';
import { ROUTE_MAP } from './routeMap';

export interface RouteValidationResult {
  valid: string[];
  missing: string[];
  orphaned: string[];
}

/**
 * Validates the route map against the actual filesystem structure in /app.
 * This is intended for use in server-side diagnostic pages.
 */
export function validateRoutes(): RouteValidationResult {
  const appDir = path.join(process.cwd(), 'app');
  const results: RouteValidationResult = {
    valid: [],
    missing: [],
    orphaned: []
  };

  // 1. Check if routes in map exist in filesystem
  ROUTE_MAP.forEach(route => {
    if (route.status === 'hidden') return;
    
    // Convert path like /system/routes to app/system/routes/page.tsx
    const routePath = route.path === '/' ? 'page.tsx' : path.join(route.path.substring(1), 'page.tsx');
    const fullPath = path.join(appDir, routePath);
    
    if (fs.existsSync(fullPath)) {
      results.valid.push(route.path);
    } else {
      results.missing.push(route.path);
    }
  });

  // 2. Simple scan for orphaned page.tsx files (not in ROUTE_MAP)
  const allPageFiles: string[] = [];
  function scan(dir: string, currentRoute = '') {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        scan(fullPath, `${currentRoute}/${file}`);
      } else if (file === 'page.tsx') {
        allPageFiles.push(currentRoute || '/');
      }
    });
  }

  try {
    scan(appDir);
    allPageFiles.forEach(path => {
      if (!ROUTE_MAP.find(r => r.path === path) && path !== '/') {
        results.orphaned.push(path);
      }
    });
  } catch (e) {
    console.error('Route scan failed', e);
  }

  return results;
}
