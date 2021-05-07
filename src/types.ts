import type { Message } from "@keix/message-store-client";

export enum CommandType {
  EARN_CREDITS = "EARN_CREDITS",
  USE_CREDITS = "USE_CREDITS",
  ADD_GIFT_CARD = "ADD_GIFT_CARD",
  UPDATE_GIFT_CARD = "UPDATE_GIFT_CARD",
  REMOVE_GIFT_CARD = "REMOVE_GIFT_CARD",
  REDEEM_GIFT_CARD = "REDEEM_GIFT_CARD",
}

export type EarnCredits = Message<
  CommandType.EARN_CREDITS,
  { id: string; amountCredit: number }
>;
export type UseCredits = Message<
  CommandType.USE_CREDITS,
  { id: string; amountCredit: number }
>;
export type UpdateGiftCard = Message<
  CommandType.UPDATE_GIFT_CARD,
  {
    id: string;
    name: string;
    description: string;
    image_url: string;
    amounts_available: number[];
  }
>;
export type RemoveGiftCard = Message<
  CommandType.REMOVE_GIFT_CARD,
  { id: string }
>;
export type AddedGiftCard = Message<
  CommandType.ADD_GIFT_CARD,
  {
    id: string;
    name: string;
    description: string;
    image_url: string;
    amounts_available: number[];
  }
>;
export type RedeemGiftCard = Message<
  CommandType.REDEEM_GIFT_CARD,
  { id: string; amount: number }
>;

export type Command =
  | EarnCredits
  | UseCredits
  | UpdateGiftCard
  | RemoveGiftCard
  | AddedGiftCard
  | RedeemGiftCard;

export enum EventType {
  CREDITS_EARNED = "CREDITS_EARNED",
  CREDITS_USED = "CREDITS_USED",
  CREDITS_ERROR = "CREDITS_ERROR",
  GIFT_CARD_ERROR = "GIFT_CARD_ERROR",
  GIFT_CARD_UPDATED = "GIFT_CARD_UPDATED",
  GIFT_CARD_REMOVED = "GIFT_CARD_REMOVED",
  GIFT_CARD_ADDED = "GIFT_CARD_ADDED",
  GIFT_CARD_REDEEM_PROCESSING = "GIFT_CARD_REDEEM_PROCESSING",
  GIFT_CARD_REDEEM_FAILED = "GIFT_CARD_REDEEM_FAILED",
  GIFT_CARD_REDEEM_SUCCEDED = "GIFT_CARD_REDEEM_SUCCEDED",
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
export type GiftCardUpdated = Message<
  EventType.GIFT_CARD_UPDATED,
  { id: string }
>;
export type GiftCardRemoved = Message<
  EventType.GIFT_CARD_REMOVED,
  { id: string }
>;
export type GiftCardAdded = Message<
  EventType.GIFT_CARD_ADDED,
  {
    id: string;
    amounts: number[];
    name: string;
    description: string;
    image_url: string;
  }
>;
export type GiftCardRedeemProcessing = Message<
  EventType.GIFT_CARD_REDEEM_PROCESSING,
  {}
>;
export type GiftCardRedeemFailed = Message<
  EventType.GIFT_CARD_REDEEM_FAILED,
  { id: string; type: string }
>;
export type GiftCardRedeemSucceded = Message<
  EventType.GIFT_CARD_REDEEM_SUCCEDED,
  { id: string }
>;
export type GiftCardError = Message<
  EventType.GIFT_CARD_ERROR,
  { type: string }
>;
export type Event =
  | CreditsEarned
  | CreditsUsed
  | CreditsError
  | GiftCardUpdated
  | GiftCardRemoved
  | GiftCardAdded
  | GiftCardRedeemProcessing
  | GiftCardRedeemFailed
  | GiftCardRedeemSucceded
  | GiftCardError;
