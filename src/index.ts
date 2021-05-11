import {
  emitEvent,
  sendCommand,
  subscribe,
  Message,
  readLastMessage,
  combineSubscriber,
} from "@keix/message-store-client";
import { runBalanceProjector } from "./projector";

import {
  CommandCredits,
  CommandTypeCredit,
  EventTypeCredit,
} from "./typesCredits";

async function businnesLogic(cmd: CommandCredits) {
  const MIN_USE_CREDITS_AMOUNT = 100;

  if (
    await isLastMessageAfterGlobalPosition(`creditAccount-${cmd.data.id}`, cmd)
  ) {
    return;
  }

  switch (cmd.type) {
    case CommandTypeCredit.EARN_CREDITS:
      if (cmd.data.amountCredit > 0) {
        return emitEvent({
          category: "creditAccount",
          id: cmd.data.id,
          event: EventTypeCredit.CREDITS_EARNED,
          data: {
            id: cmd.data.id,
            amountCredit: cmd.data.amountCredit,
          },
        });
      } else {
        return;
      }
    case CommandTypeCredit.USE_CREDITS:
      let balance = await runBalanceProjector(cmd.data.id);
      if (
        balance >= MIN_USE_CREDITS_AMOUNT &&
        balance - cmd.data.amountCredit > 0
      ) {
        return emitEvent({
          category: "creditAccount",
          id: cmd.data.id,
          event: EventTypeCredit.CREDITS_USED,
          data: {
            id: cmd.data.id,
            idCard: cmd.data.idCard,
            amountCredit: cmd.data.amountCredit,
          },
        });
      } else {
        return emitEvent({
          category: "creditAccount",
          id: cmd.data.id,
          event: EventTypeCredit.CREDITS_ERROR,
          data: {
            id: cmd.data.id,
            type:
              balance >= MIN_USE_CREDITS_AMOUNT
                ? "AmmontoMinimoNonRaggiunto"
                : "FondiNonSufficienti",
          },
        });
      }
  }
}

export async function runCredits() {
  return combineSubscriber(
    subscribe(
      {
        streamName: "creditAccount:command",
      },
      businnesLogic
    )
  );
}

async function isLastMessageAfterGlobalPosition(
  streamName: string,
  message: Message
) {
  const { global_position } = message;
  const lastMsg = await readLastMessage({
    streamName,
  });
  return lastMsg && lastMsg.global_position > global_position;
}
