export type FormState = {
  success: boolean;
  fields?: Record<string, string>;
  errors?: Record<string, string[]>;
};
