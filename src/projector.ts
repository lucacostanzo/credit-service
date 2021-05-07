import { runProjector } from "@keix/message-store-client";
import { Event, EventType } from "./types";

export async function runBalanceProjector(id: string): Promise<number> {
  const MAX_USE_CREDITS_DELAY = 365;

  let datetime = new Date();
  datetime.setDate(datetime.getDay() - MAX_USE_CREDITS_DELAY);
  function reducer(res: number, next: Event) {
    if (next.time >= datetime) {
      if (next.type === EventType.CREDITS_USED) {
        res -= next.data.amountCredit;
      } else if (next.type === EventType.CREDITS_EARNED) {
        res += next.data.amountCredit;
      }
    }
    return Math.max(0, res);
  }
  return runProjector({ streamName: `creditAccount-${id}` }, reducer, 0);
}

export async function runCardExistProjector(id: string): Promise<boolean> {
  function reducer(res: boolean, next: Event) {
    if (
      next.type === EventType.GIFT_CARD_ADDED ||
      next.type === EventType.GIFT_CARD_UPDATED
    ) {
      res = true;
      return res;
    } else {
      res = false;
      return res;
    }
  }
  return runProjector({ streamName: `giftCard-${id}` }, reducer, false);
}
