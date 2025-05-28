export class ContentAcceptedEvent {
  constructor(
    public readonly contentId: string,
    public readonly authorId: string,
    public readonly threadId: string,
    public readonly threadTitle: string,
  ) {}
}

export class ContentRejectedEvent {
  constructor(
    public readonly contentId: string,
    public readonly authorId: string,
    public readonly threadId: string,
    public readonly threadTitle: string,
  ) {}
}

export class ChangeRequestEvent {
  constructor(
    public readonly contentId: string,
    public readonly authorId: string,
    public readonly threadId: string,
    public readonly threadTitle: string,
    public readonly message: string,
    public readonly requestedBy: string,
  ) {}
}

export class NewContributionEvent {
  constructor(
    public readonly contentId: string,
    public readonly authorId: string,
    public readonly authorNickname: string,
    public readonly threadId: string,
    public readonly threadTitle: string,
    public readonly threadOwnerId: string,
  ) {}
}

export class NewSubmissionEvent {
  constructor(
    public readonly contentId: string,
    public readonly authorId: string,
    public readonly authorNickname: string,
    public readonly threadId: string,
    public readonly threadTitle: string,
    public readonly threadOwnerId: string,
  ) {}
}
