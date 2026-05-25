export enum MatchDataErrorCode {
  FETCH_FAILED = 'FETCH_FAILED',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
}

export class MatchDataError extends Error {
  constructor(
    public readonly code: MatchDataErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'MatchDataError';
  }
}
