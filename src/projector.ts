import { Message, runProjector } from "@keix/message-store-client";
import { Event, EventType } from "./types";

export async function runBalanceProjector(id: string): Promise<number> {
  function reducer(res: number, next: Event) {
    if (next.type === EventType.CREDITS_USED) {
      let inverted = next.data.amountCredit * -1;
      res += inverted;
      console.log(res);
      return res;
    } else {
      res += next.data.amountCredit;
      console.log(res);

      return res;
    }
  }
  return runProjector({ streamName: `creditAccount-${id}` }, reducer, 0);
}
