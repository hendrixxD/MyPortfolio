/**
 * Frontend API URL Configuration Tests
 *
 * Tests all getApiUrl() scenarios to ensure no breaking changes:
 * - Priority 1: NEXT_PUBLIC_API_URL explicitly set
 * - Priority 2: Development mode (localhost:8000)
 * - Priority 3: Vercel build-time SSR (uses VERCEL_URL)
 * - Priority 4: Production fails fast if not configured
 */

import { getApiUrl } from '../config';

describe('getApiUrl() - Frontend API URL Resolution', () => {
  const originalEnv = process.env;
  const originalWindow = global.window;

  beforeEach(() => {
    // Reset environment before each test
    jest.resetModules();
    process.env = { ...originalEnv };

    // Reset window
    // @ts-ignore
    delete global.window;
  });

  afterEach(() => {
    process.env = originalEnv;
    global.window = originalWindow;
  });

  describe('Priority 1: NEXT_PUBLIC_API_URL explicitly set', () => {
    it('should use NEXT_PUBLIC_API_URL when set in production', () => {
      process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';
      process.env.NODE_ENV = 'production';

      const url = getApiUrl();
      expect(url).toBe('https://api.example.com');
    });

    it('should use NEXT_PUBLIC_API_URL when set in development', () => {
      process.env.NEXT_PUBLIC_API_URL = 'https://staging-api.example.com';
      process.env.NODE_ENV = 'development';

      const url = getApiUrl();
      expect(url).toBe('https://staging-api.example.com');
    });

    it('should use NEXT_PUBLIC_API_URL even if empty string', () => {
      process.env.NEXT_PUBLIC_API_URL = '';
      process.env.NODE_ENV = 'production';

      const url = getApiUrl();
      expect(url).toBe('');
    });

    it('should prioritize NEXT_PUBLIC_API_URL over development mode', () => {
      process.env.NEXT_PUBLIC_API_URL = 'https://override.example.com';
      process.env.NODE_ENV = 'development';

      const url = getApiUrl();
      expect(url).toBe('https://override.example.com');
    });
  });

  describe('Priority 2: Development mode', () => {
    it('should use localhost:8000 in development browser runtime', () => {
      delete process.env.NEXT_PUBLIC_API_URL;
      process.env.NODE_ENV = 'development';

      // @ts-ignore
      global.window = {} as Window & typeof globalThis;

      const url = getApiUrl();
      expect(url).toBe('http://localhost:8000');
    });

    it('should use localhost:8000 in development server-side', () => {
      delete process.env.NEXT_PUBLIC_API_URL;
      process.env.NODE_ENV = 'development';

      // @ts-ignore
      delete global.window;

      const url = getApiUrl();
      expect(url).toBe('http://localhost:8000');
    });

    it('should not use localhost in production', () => {
      delete process.env.NEXT_PUBLIC_API_URL;
      process.env.NODE_ENV = 'production';

      expect(() => getApiUrl()).toThrow();
    });
  });

  describe('Priority 3: Vercel build-time SSR', () => {
    it('should use VERCEL_URL for server-side rendering during build', () => {
      delete process.env.NEXT_PUBLIC_API_URL;
      process.env.NODE_ENV = 'production';
      process.env.VERCEL_URL = 'my-deployment-abc123.vercel.app';

      // @ts-ignore
      delete global.window;

      const url = getApiUrl();
      expect(url).toBe('https://my-deployment-abc123.vercel.app');
    });

    it('should not use VERCEL_URL in browser runtime', () => {
      delete process.env.NEXT_PUBLIC_API_URL;
      process.env.NODE_ENV = 'production';
      process.env.VERCEL_URL = 'my-deployment-abc123.vercel.app';

      // @ts-ignore
      global.window = {} as Window & typeof globalThis;

      expect(() => getApiUrl()).toThrow();
    });

    it('should not use VERCEL_URL if NEXT_PUBLIC_API_URL is set', () => {
      process.env.NEXT_PUBLIC_API_URL = 'https://custom-api.example.com';
      process.env.NODE_ENV = 'production';
      process.env.VERCEL_URL = 'my-deployment-abc123.vercel.app';

      // @ts-ignore
      delete global.window;

      const url = getApiUrl();
      expect(url).toBe('https://custom-api.example.com');
    });
  });

  describe('Priority 4: Production fails fast', () => {
    it('should throw error in production browser without NEXT_PUBLIC_API_URL', () => {
      delete process.env.NEXT_PUBLIC_API_URL;
      process.env.NODE_ENV = 'production';

      // @ts-ignore
      global.window = {} as Window & typeof globalThis;

      expect(() => getApiUrl()).toThrow(
        'NEXT_PUBLIC_API_URL must be set for production builds'
      );
    });

    it('should throw error in production server without config', () => {
      delete process.env.NEXT_PUBLIC_API_URL;
      delete process.env.VERCEL_URL;
      process.env.NODE_ENV = 'production';

      // @ts-ignore
      delete global.window;

      expect(() => getApiUrl()).toThrow(
        'NEXT_PUBLIC_API_URL must be set for production builds'
      );
    });

    it('should throw with helpful error message', () => {
      delete process.env.NEXT_PUBLIC_API_URL;
      process.env.NODE_ENV = 'production';

      // @ts-ignore
      global.window = {} as Window & typeof globalThis;

      expect(() => getApiUrl()).toThrow(
        /Use deployment\.py to generate environment configs/
      );
    });
  });

  describe('Edge cases and regression tests', () => {
    it('should handle undefined vs missing env var', () => {
      // Explicitly undefined should still be treated as set
      process.env.NEXT_PUBLIC_API_URL = undefined;
      process.env.NODE_ENV = 'development';

      const url = getApiUrl();
      expect(url).toBe('http://localhost:8000');
    });

    it('should handle test environment', () => {
      delete process.env.NEXT_PUBLIC_API_URL;
      process.env.NODE_ENV = 'test';

      // @ts-ignore
      delete global.window;

      // Test environment should not default to localhost
      expect(() => getApiUrl()).toThrow();
    });

    it('should handle VERCEL_URL without protocol', () => {
      delete process.env.NEXT_PUBLIC_API_URL;
      process.env.NODE_ENV = 'production';
      process.env.VERCEL_URL = 'my-app.vercel.app';

      // @ts-ignore
      delete global.window;

      const url = getApiUrl();
      expect(url).toBe('https://my-app.vercel.app');
    });

    it('should not add extra slashes', () => {
      process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com/';
      process.env.NODE_ENV = 'production';

      const url = getApiUrl();
      expect(url).toBe('https://api.example.com/');
    });

    it('should preserve port numbers', () => {
      process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com:8080';
      process.env.NODE_ENV = 'production';

      const url = getApiUrl();
      expect(url).toBe('https://api.example.com:8080');
    });
  });

  describe('No localhost fallbacks in production', () => {
    it('should never return localhost in production NODE_ENV', () => {
      delete process.env.NEXT_PUBLIC_API_URL;
      delete process.env.VERCEL_URL;
      process.env.NODE_ENV = 'production';

      // @ts-ignore
      delete global.window;

      let result: string | undefined;
      try {
        result = getApiUrl();
      } catch (error) {
        // Expected to throw
      }

      expect(result).toBeUndefined();
    });

    it('should never return 127.0.0.1 in production', () => {
      delete process.env.NEXT_PUBLIC_API_URL;
      delete process.env.VERCEL_URL;
      process.env.NODE_ENV = 'production';

      // @ts-ignore
      global.window = {} as Window & typeof globalThis;

      let result: string | undefined;
      try {
        result = getApiUrl();
      } catch (error) {
        // Expected to throw
      }

      expect(result).toBeUndefined();
    });
  });

  describe('Integration with deployment.py', () => {
    it('should work with Vercel production config', () => {
      process.env.NEXT_PUBLIC_API_URL = 'https://my-app.vercel.app';
      process.env.NODE_ENV = 'production';
      process.env.VERCEL = '1';

      const url = getApiUrl();
      expect(url).toBe('https://my-app.vercel.app');
    });

    it('should work with Docker production config', () => {
      process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';
      process.env.NODE_ENV = 'production';
      process.env.DOCKER = '1';

      const url = getApiUrl();
      expect(url).toBe('https://api.example.com');
    });

    it('should work with staging environment', () => {
      process.env.NEXT_PUBLIC_API_URL = 'https://staging-api.example.com';
      process.env.NODE_ENV = 'production';
      process.env.ENVIRONMENT = 'staging';

      const url = getApiUrl();
      expect(url).toBe('https://staging-api.example.com');
    });
  });
});
