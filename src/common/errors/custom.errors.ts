export const RESPONSIBLE = {
  CLIENT: 1,
  SERVER: 2,
} as const;

export class Fault extends Error {}

export class Reason extends Error {
  constructor(
    readonly responsible: (typeof RESPONSIBLE)[keyof typeof RESPONSIBLE],
    message: string,
  ) {
    super(message);
  }
}
