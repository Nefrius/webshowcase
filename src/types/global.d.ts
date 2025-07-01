// Global type declarations for TypeScript

// Allow importing JSON files
declare module "*.json" {
  const value: Record<string, unknown>;
  export default value;
}

// Locale files are now loaded via fetch from public/locales/
// No module declarations needed for public assets

// Other common module declarations can be added here 