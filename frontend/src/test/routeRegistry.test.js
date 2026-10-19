import { describe, it, expect } from 'vitest';
import { ROUTE_REGISTRY, getRouteById, getRoutesByCategory, getCategorySummary } from '../config/routeRegistry.js';

describe('120-Page Route Registry Verification', () => {
  it('contains exactly 120 documented route entries', () => {
    expect(ROUTE_REGISTRY).toHaveLength(120);
  });

  it('contains no duplicate route IDs', () => {
    const ids = ROUTE_REGISTRY.map((r) => r.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(120);
  });

  it('contains no duplicate path patterns', () => {
    const paths = ROUTE_REGISTRY.map((r) => r.path);
    const uniquePaths = new Set(paths);
    expect(uniquePaths.size).toBe(120);
  });

  it('every route has required fields with non-empty values', () => {
    const validAccessLevels = ['public', 'authenticated', 'admin', 'guest'];
    const validLayouts = ['app', 'auth', 'admin', 'minimal'];

    ROUTE_REGISTRY.forEach((route) => {
      expect(route.id).toBeTruthy();
      expect(typeof route.id).toBe('string');
      expect(route.path).toBeTruthy();
      expect(typeof route.path).toBe('string');
      expect(route.path.startsWith('/')).toBe(true);
      expect(route.title).toBeTruthy();
      expect(route.category).toBeTruthy();
      expect(validAccessLevels).toContain(route.access);
      expect(validLayouts).toContain(route.layout);
      expect(route.description).toBeTruthy();
    });
  });

  it('covers all 12 functional product categories', () => {
    const summary = getCategorySummary();
    const categories = Object.keys(summary);
    
    expect(categories).toContain('auth');
    expect(categories).toContain('feed');
    expect(categories).toContain('profile');
    expect(categories).toContain('posts');
    expect(categories).toContain('stories');
    expect(categories).toContain('reels');
    expect(categories).toContain('search');
    expect(categories).toContain('explore');
    expect(categories).toContain('messaging');
    expect(categories).toContain('notifications');
    expect(categories).toContain('settings');
    expect(categories).toContain('safety');
    expect(categories).toContain('help');
    expect(categories).toContain('legal');
    expect(categories).toContain('admin');

    const totalFromSummary = Object.values(summary).reduce((a, b) => a + b, 0);
    expect(totalFromSummary).toBe(120);
  });

  it('getRouteById returns correct route', () => {
    const loginRoute = getRouteById('auth-login');
    expect(loginRoute).toBeDefined();
    expect(loginRoute.path).toBe('/auth/login');

    const adminRoute = getRouteById('admin-dashboard');
    expect(adminRoute).toBeDefined();
    expect(adminRoute.access).toBe('admin');
  });

  it('getRoutesByCategory accurately filters routes', () => {
    const adminRoutes = getRoutesByCategory('admin');
    expect(adminRoutes.length).toBe(4);
    adminRoutes.forEach((r) => expect(r.access).toBe('admin'));
  });
});
