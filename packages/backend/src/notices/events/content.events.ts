export class ContentAcceptedEvent {
  constructor(
    public readonly contentId: string,
    public readonly userId: string,
    public readonly threadId: string,
  ) {}
}

export class ContentRejectedEvent {
  constructor(
    public readonly contentId: string,
    public readonly userId: string,
    public readonly threadId: string,
  ) {}
}

export class ChangeRequestEvent {
  constructor(
    public readonly contentId: string,
    public readonly userId: string,
    public readonly threadId: string,
    public readonly message: string,
  ) {}
}
