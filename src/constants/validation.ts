export const VALIDATION = {
  LENGTH: {
    DASHBOARD_ALIAS_MAX: 30,
    DASHBOARD_TITLE_MAX: 50,
    TAB_TITLE_MAX: 50,
    USERNAME_MIN: 2,
    USERNAME_MAX: 50,
    FULL_NAME_MIN: 2,
    FULL_NAME_MAX: 100,
    LABEL_MAX: 100,
    ALIAS_MAX: 50,
    UNIT_MAX: 20,
  },
  PATTERN: {
    ID: /^[a-zA-Z0-9-_]+$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};'"\\|,.<>/?]).{4,}$/,
  },
  MESSAGES: {
    REQUIRED: (field: string) => `${field} is required`,
    MIN_LENGTH: (field: string, min: number) => `${field} must be at least ${min} characters`,
    MAX_LENGTH: (field: string, max: number) => `${field} cannot exceed ${max} characters`,
    PATTERN: (field: string, pattern: RegExp) => `${field} does not match required pattern: ${pattern.toString()}`,
  },
  ARRAY: {
    REQUIRED: (field: string): [boolean, string] => [true, VALIDATION.MESSAGES.REQUIRED(field)],
    MIN_LENGTH: (field: string, min: number): [number, string] => [min, VALIDATION.MESSAGES.MIN_LENGTH(field, min)],
    MAX_LENGTH: (field: string, max: number): [number, string] => [max, VALIDATION.MESSAGES.MAX_LENGTH(field, max)],
    PATTERN: (field: string, pattern: RegExp): [RegExp, string] => [pattern, VALIDATION.MESSAGES.PATTERN(field, pattern)],
  }
} as const;
