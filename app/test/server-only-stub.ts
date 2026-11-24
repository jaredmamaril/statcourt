// Vitest stand-in for "server-only". Next.js bundles that module itself, so it isn't
// in node_modules; in tests, server-only modules may be imported directly.
export {};
