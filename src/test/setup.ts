import '@testing-library/jest-dom';
import { vi, afterEach, expect } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import 'fake-indexeddb/auto';  // This sets up the IndexedDB mock

expect.extend(matchers);

// Mock ResizeObserver which is required by @dnd-kit
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Cleanup after each test
afterEach(() => {
  cleanup();
  // Clear IndexedDB between tests
  indexedDB.deleteDatabase('PomodoroDB');
}); 