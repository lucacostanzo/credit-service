import {
  emitEvent,
  subscribe,
  Message,
  readLastMessage,
  combineSubscriber,
  sendCommand,
} from "@keix/message-store-client";
import {
  runCardExistProjector,
  runVerifyAmountProjector,
  runVerifyPendingProjector,
} from "./projector";

import {
  EventCredits,
  CommandCredits,
  CommandTypeCredit,
  EventTypeCredit,
} from "./typesCredits";
import {
  EventCard,
  CommandCard,
  CommandTypeCard,
  EventTypeCard,
} from "./typesCard";

async function businnesLogic(cmd: CommandCard) {
  if (await isLastMessageAfterGlobalPosition(`giftCard-${cmd.data.id}`, cmd)) {
    return;
  }

  switch (cmd.type) {
    case CommandTypeCard.ADD_GIFT_CARD:
      return emitEvent({
        category: "giftCard",
        id: cmd.data.id,
        event: EventTypeCard.GIFT_CARD_ADDED,
        data: {
          id: cmd.data.id,
          amounts: cmd.data.amounts,
          name: cmd.data.name,
          description: cmd.data.description,
          image_url: cmd.data.image_url,
        },
      });
    case CommandTypeCard.UPDATE_GIFT_CARD:
      if (await runCardExistProjector(cmd.data.id)) {
        return emitEvent({
          category: "giftCard",
          id: cmd.data.id,
          event: EventTypeCard.GIFT_CARD_UPDATED,
          data: {
            id: cmd.data.id,
            name: cmd.data.name,
            description: cmd.data.description,
          },
        });
      } else {
        return emitEvent({
          category: "giftCard",
          id: cmd.data.id,
          event: EventTypeCard.GIFT_CARD_ERROR,
          data: {
            type: "CardNotExist",
          },
        });
      }

    case CommandTypeCard.REMOVE_GIFT_CARD:
      if (await runCardExistProjector(cmd.data.id)) {
        return emitEvent({
          category: "giftCard",
          id: cmd.data.id,
          event: EventTypeCard.GIFT_CARD_REMOVED,
          data: {
            id: cmd.data.id,
          },
        });
      } else {
        return emitEvent({
          category: "giftCard",
          id: cmd.data.id,
          event: EventTypeCard.GIFT_CARD_ERROR,
          data: {
            type: "CardNotExist",
          },
        });
      }
    case CommandTypeCard.REDEEM_GIFT_CARD:
      await emitEvent({
        category: "giftCard",
        id: cmd.data.userId,
        event: EventTypeCard.GIFT_CARD_REDEEM_PROCESSING,
        data: {},
      });
      if (
        (await runCardExistProjector(cmd.data.id)) &&
        (await runVerifyAmountProjector(cmd.data.id, cmd.data.amount))
      ) {
        return await sendCommand({
          command: CommandTypeCredit.USE_CREDITS,
          category: "creditAccount",
          data: {
            id: cmd.data.userId,
            amountCredit: cmd.data.amount,
          },
        });
      } else {
        return emitEvent({
          category: "giftCard",
          id: cmd.data.id,
          event: EventTypeCard.GIFT_CARD_REDEEM_FAILED,
          data: {
            id: cmd.data.id,
            type: "RedeemError",
          },
        });
      }
  }
}

async function businnesLogicCredits(event: EventCredits) {
  if (event.type === EventTypeCredit.CREDITS_USED) {
    if (runVerifyPendingProjector(event.data.idCard)) return;
  }
  switch (event.type) {
    case EventTypeCredit.CREDITS_USED:
      return emitEvent({
        category: "giftCard",
        id: event.data.idCard,
        event: EventTypeCard.GIFT_CARD_REDEEM_SUCCEDED,
        data: {
          id: event.data.idCard,
          amount: 20,
        },
      });
    case EventTypeCredit.CREDITS_EARNED:
      return console.log(event, "GUADAGNO");
  }
}

export async function runGiftCard() {
  return combineSubscriber(
    subscribe(
      {
        streamName: "giftCard:command",
      },
      businnesLogic
    ),
    subscribe(
      {
        streamName: "creditAccount",
      },
      businnesLogicCredits
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
