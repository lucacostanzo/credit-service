import {
  emitEvent,
  sendCommand,
  subscribe,
  Message,
  readLastMessage,
  combineSubscriber,
} from "@keix/message-store-client";
import { runBalanceProjector } from "./projector";

import { Command, CommandType, EventType } from "./types";

async function businnesLogic(cmd: Command) {
  const MIN_USE_CREDITS_AMOUNT = 100;

  if (
    await isLastMessageAfterGlobalPosition(`creditAccount-${cmd.data.id}`, cmd)
  ) {
    return;
  }

  switch (cmd.type) {
    case CommandType.EARN_CREDITS:
      if (cmd.data.amountCredit > 0) {
        return emitEvent({
          category: "creditAccount",
          id: cmd.data.id,
          event: EventType.CREDITS_EARNED,
          data: {
            id: cmd.data.id,
            amountCredit: cmd.data.amountCredit,
          },
        });
      } else {
        return;
      }
    case CommandType.USE_CREDITS:
      let balance = await runBalanceProjector(cmd.data.id);
      if (
        balance >= MIN_USE_CREDITS_AMOUNT &&
        balance - cmd.data.amountCredit > 0
      ) {
        return emitEvent({
          category: "creditAccount",
          id: cmd.data.id,
          event: EventType.CREDITS_USED,
          data: {
            id: cmd.data.id,
            amountCredit: cmd.data.amountCredit,
          },
        });
      } else {
        return emitEvent({
          category: "creditAccount",
          id: cmd.data.id,
          event: EventType.CREDITS_ERROR,
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
