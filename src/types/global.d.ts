/// <reference types="@testing-library/jest-dom" />
/// <reference types="vitest/globals" />

// Add type declarations for testing libraries
declare module '@testing-library/react' {
  export * from '@testing-library/react/types';
}

declare module '@testing-library/user-event' {
  export * from '@testing-library/user-event';
}

declare module 'vitest' {
  interface TestContext {
    // Add any test context types if needed
  }
}

// Add global test types
declare const expect: typeof import('vitest').expect;
declare const it: typeof import('vitest').it;
declare const describe: typeof import('vitest').describe;
declare const beforeEach: typeof import('vitest').beforeEach;
declare const afterEach: typeof import('vitest').afterEach;
declare const beforeAll: typeof import('vitest').beforeAll;
declare const afterAll: typeof import('vitest').afterAll;
declare const vi: typeof import('vitest').vi;
