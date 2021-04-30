import {
  emitEvent,
  sendCommand,
  subscribe,
  Message,
  readLastMessage,
  combineSubscriber,
} from "@keix/message-store-client";

import { Command, CommandType, EventType } from "./types";

async function businnesLogic(cmd: Command) {
  if (
    await isLastMessageAfterGlobalPosition(`creditAccount-${cmd.data.id}`, cmd)
  ) {
    return;
  }

  switch (cmd.type) {
    case CommandType.EARN_CREDITS:
      return emitEvent({
        category: "creditAccount",
        id: cmd.data.id,
        event: EventType.CREDITS_EARNED,
        data: {
          id: cmd.data.id,
          amountCredit: cmd.data.amountCredit,
        },
      });
    case CommandType.USE_CREDITS:
      return emitEvent({
        category: "creditAccount",
        id: cmd.data.id,
        event: EventType.CREDITS_USED,
        data: {
          id: cmd.data.id,
          amountCredit: cmd.data.amountCredit,
        },
      });
  }
}

export async function run() {
  return combineSubscriber(
    /* subscribe(
      {
        streamName: "credits:command",
      },
      businnesLogic
    ), */

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
