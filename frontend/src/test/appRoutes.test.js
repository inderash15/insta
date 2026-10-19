import { describe, it, expect } from 'vitest';
import AppRoutes from '../AppRoutes';
import { ROUTE_REGISTRY } from '../config/routeRegistry';

describe('120-Route Application & Component Verification', () => {
  it('AppRoutes component is defined and exports a React component function', () => {
    expect(AppRoutes).toBeDefined();
    expect(typeof AppRoutes).toBe('function');
  });

  it('All 120 registered routes are represented in the registry', () => {
    expect(ROUTE_REGISTRY.length).toBe(120);

    const routePaths = ROUTE_REGISTRY.map((r) => r.path);
    // Spot-check key route endpoints from each section
    expect(routePaths).toContain('/');
    expect(routePaths).toContain('/welcome');
    expect(routePaths).toContain('/auth/login');
    expect(routePaths).toContain('/home');
    expect(routePaths).toContain('/feed/following');
    expect(routePaths).toContain('/users/:username');
    expect(routePaths).toContain('/create/post');
    expect(routePaths).toContain('/posts/:postId');
    expect(routePaths).toContain('/stories');
    expect(routePaths).toContain('/stories/:storyId');
    expect(routePaths).toContain('/reels');
    expect(routePaths).toContain('/reels/:reelId');
    expect(routePaths).toContain('/search');
    expect(routePaths).toContain('/explore');
    expect(routePaths).toContain('/direct');
    expect(routePaths).toContain('/direct/:conversationId');
    expect(routePaths).toContain('/notifications');
    expect(routePaths).toContain('/settings');
    expect(routePaths).toContain('/settings/privacy');
    expect(routePaths).toContain('/safety');
    expect(routePaths).toContain('/reports/new');
    expect(routePaths).toContain('/help');
    expect(routePaths).toContain('/legal');
    expect(routePaths).toContain('/admin');
    expect(routePaths).toContain('/admin/reports');
    expect(routePaths).toContain('/admin/audit');
  });

  it('No route path or ID contains invalid whitespace or malformed patterns', () => {
    ROUTE_REGISTRY.forEach((route) => {
      expect(route.id).not.toMatch(/\s/);
      expect(route.path).not.toMatch(/\s/);
      expect(route.path.startsWith('/')).toBe(true);
    });
  });
});
