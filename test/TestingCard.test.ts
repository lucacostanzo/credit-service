import { testUtils } from "@keix/message-store-client";
import { v4 } from "uuid";
import { runGiftCard } from "../src/index2";
import { runCardExistProjector } from "../src/projector";
import { CommandType, EventType } from "../src/types";

it("Aggiungere una carta", async () => {
  let idCard = v4();
  testUtils.setupMessageStore([
    {
      type: CommandType.ADD_GIFT_CARD,
      stream_name: "giftCard:command-" + idCard,
      data: {
        id: idCard,
        name: "Amazon",
        description: "Carta per comprarti il frigo",
        image_url: "https://img.it",
        amounts_available: [5, 10, 20, 30, 50],
      },
    },
  ]);

  await testUtils.expectIdempotency(runGiftCard, () => {
    let event = testUtils.getStreamMessages("giftCard");
    expect(event).toHaveLength(1);
    expect(event[0].type).toEqual(EventType.GIFT_CARD_ADDED);
    expect(event[0].data.id).toEqual(idCard);
    expect(event[0].data.name).toEqual("Amazon");
    expect(event[0].data.amounts_available).toEqual([5, 10, 20, 30, 50]);
  });
});

it("Trovare una carta esistente", async () => {
  let idCard = v4();
  testUtils.setupMessageStore([
    {
      type: EventType.GIFT_CARD_ADDED,
      stream_name: "giftCard-" + idCard,
      data: {
        id: idCard,
        name: "Amazon",
        description: "Carta per comprarti il frigo",
        image_url: "https://img.it",
        amounts_available: [5, 10, 20, 30, 50],
      },
    },
  ]);

  expect(await runCardExistProjector(idCard)).toEqual(true);
});

it("Trovare una carta non esistente", async () => {
  let idCard = v4();
  let idCardinesistente = v4();
  testUtils.setupMessageStore([
    {
      type: EventType.GIFT_CARD_ADDED,
      stream_name: "giftCard-" + idCard,
      data: {
        id: idCard,
        name: "Amazon",
        description: "Carta per comprarti il frigo",
        image_url: "https://img.it",
        amounts_available: [5, 10, 20, 30, 50],
      },
    },
  ]);

  expect(await runCardExistProjector(idCardinesistente)).toEqual(false);
});

it("Trovare una carta esistente ma adesso rimossa", async () => {
  let idCard = v4();
  testUtils.setupMessageStore([
    {
      type: EventType.GIFT_CARD_ADDED,
      stream_name: "giftCard-" + idCard,
      data: {
        id: idCard,
        name: "Amazon",
        description: "Carta per comprarti il frigo",
        image_url: "https://img.it",
        amounts_available: [5, 10, 20, 30, 50],
      },
    },
    {
      type: EventType.GIFT_CARD_REMOVED,
      stream_name: "giftCard-" + idCard,
      data: {
        id: idCard,
      },
    },
  ]);

  expect(await runCardExistProjector(idCard)).toEqual(false);
});

it("Rimuovere una carta non esistente", async () => {
  let idCard = v4();
  testUtils.setupMessageStore([
    {
      type: CommandType.REMOVE_GIFT_CARD,
      stream_name: "giftCard:command-" + idCard,
      data: {
        id: idCard,
      },
    },
  ]);

  await testUtils.expectIdempotency(runGiftCard, () => {
    let event = testUtils.getStreamMessages("giftCard");
    expect(event).toHaveLength(1);
    expect(event[0].type).toEqual(EventType.GIFT_CARD_ERROR);
    expect(event[0].data.type).toEqual("CardNotExist");
  });
});

it("Rimuovere una carta", async () => {
  let idCard = v4();
  testUtils.setupMessageStore([
    {
      type: EventType.GIFT_CARD_ADDED,
      stream_name: "giftCard-" + idCard,
      data: {
        id: idCard,
        name: "Amazon",
        description: "Carta per comprarti il frigo",
        image_url: "https://img.it",
        amounts_available: [5, 10, 20, 30, 50],
      },
    },
    {
      type: CommandType.REMOVE_GIFT_CARD,
      stream_name: "giftCard:command-" + idCard,
      data: {
        id: idCard,
      },
    },
  ]);

  await testUtils.expectIdempotency(runGiftCard, () => {
    let event = testUtils.getStreamMessages("giftCard");
    expect(event).toHaveLength(2);
    expect(event[1].type).toEqual(EventType.GIFT_CARD_REMOVED);
    expect(event[1].data.id).toEqual(idCard);
  });
});

/* 
it("All'istante zero, tutti gli account hanno un balance di zero crediti", async () => {
  let idAccount1 = v4();
  testUtils.setupMessageStore([]);

  expect(await runBalanceProjector(idAccount1)).toEqual(0);
});

it("Accredito balance ad un dato account", async () => {
  let idAccount1 = v4();
  testUtils.setupMessageStore([
    {
      type: CommandType.EARN_CREDITS,
      stream_name: "creditAccount:command-" + idAccount1,
      data: {
        id: idAccount1,
        amountCredit: 30,
      },
    },
  ]);

  await testUtils.expectIdempotency(runCredits, () => {
    let event = testUtils.getStreamMessages("creditAccount");
    expect(event).toHaveLength(1);
    expect(event[0].type).toEqual(EventType.CREDITS_EARNED);
    expect(event[0].data.id).toEqual(idAccount1);
    expect(event[0].data.amountCredit).toEqual(30);
  });
});

it("Accredito balance negativo ad un dato account", async () => {
  let idAccount1 = v4();
  testUtils.setupMessageStore([
    {
      type: CommandType.EARN_CREDITS,
      stream_name: "creditAccount:command-" + idAccount1,
      data: {
        id: idAccount1,
        amountCredit: -30,
      },
    },
  ]);

  await testUtils.expectIdempotency(runCredits, () => {
    let event = testUtils.getStreamMessages("creditAccount");
    expect(event).toHaveLength(0);
  });
});*/
