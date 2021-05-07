import {
  emitEvent,
  subscribe,
  Message,
  readLastMessage,
  combineSubscriber,
} from "@keix/message-store-client";
import { runCardExistProjector } from "./projector";

import { Event, Command, CommandType, EventType } from "./types";

async function businnesLogic(cmd: Command) {
  if (await isLastMessageAfterGlobalPosition(`giftCard-${cmd.data.id}`, cmd)) {
    return;
  }

  switch (cmd.type) {
    case CommandType.ADD_GIFT_CARD:
      return emitEvent({
        category: "giftCard",
        id: cmd.data.id,
        event: EventType.GIFT_CARD_ADDED,
        data: {
          id: cmd.data.id,
          amounts_available: cmd.data.amounts_available,
          name: cmd.data.name,
          description: cmd.data.description,
          image_url: cmd.data.image_url,
        },
      });
    case CommandType.REMOVE_GIFT_CARD:
      if (await runCardExistProjector(cmd.data.id)) {
        return emitEvent({
          category: "giftCard",
          id: cmd.data.id,
          event: EventType.GIFT_CARD_REMOVED,
          data: {
            id: cmd.data.id,
          },
        });
      } else {
        return emitEvent({
          category: "giftCard",
          id: cmd.data.id,
          event: EventType.GIFT_CARD_ERROR,
          data: {
            type: "CardNotExist",
          },
        });
      }
  }
}

export async function runGiftCard() {
  return combineSubscriber(
    subscribe(
      {
        streamName: "giftCard:command",
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
