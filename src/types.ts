import type { Message } from "@keix/message-store-client";

export enum CommandType {
  EARN_CREDITS = "EARN_CREDITS",
  USE_CREDITS = "USE_CREDITS",
}

export type EarnCredits = Message<
  CommandType.EARN_CREDITS,
  { id: string; amountCredit: number }
>;
export type UseCredits = Message<
  CommandType.USE_CREDITS,
  { id: string; amountCredit: number }
>;

export type Command = EarnCredits | UseCredits;

export enum EventType {
  CREDITS_EARNED = "CREDITS_EARNED",
  CREDITS_USED = "CREDITS_USED",
  CREDITS_ERROR = "CREDITS_ERROR",
}

export type CreditsEarned = Message<
  EventType.CREDITS_EARNED,
  { id: string; amountCredit: number }
>;
export type CreditsUsed = Message<
  EventType.CREDITS_USED,
  { id: string; amountCredit: number }
>;
export type CreditsError = Message<
  EventType.CREDITS_ERROR,
  { id: string; type: string }
>;

export type Event = CreditsEarned | CreditsUsed | CreditsError;
