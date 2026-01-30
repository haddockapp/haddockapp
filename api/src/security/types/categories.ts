export const SecurityCategories = {
  SECRETS: 'secrets',
  DOCKER_VULNERABILITIES: 'docker-vulnerabilities',
  MISCONFIGURATIONS: 'misconfigurations',
} as const;

export type SecurityCategory =
  (typeof SecurityCategories)[keyof typeof SecurityCategories];
