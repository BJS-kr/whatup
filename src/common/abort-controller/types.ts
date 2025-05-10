import { Request } from 'express';

export type AbortControlledRequest = Request & {
  ac: AbortController;
};
