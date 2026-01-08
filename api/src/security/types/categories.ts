export const SecurityCategories = {
  SECRETS: 'secrets',
} as const;

export type SecurityCategory =
  (typeof SecurityCategories)[keyof typeof SecurityCategories];
