export type ApiErrorResponse = {
  statusCode: number;
  error: string;
  message: string | string[];
  path?: string;
  method?: string;
  timestamp?: string;
};
