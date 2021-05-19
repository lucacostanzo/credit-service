import { testUtils } from "@keix/message-store-client";
import { v4 } from "uuid";
import {
  runCardExistProjector,
  runVerifyAmountProjector,
  runVerifyDeliveryProjector,
  runVerifyErrorProjector,
  runVerifyPendingProjector,
  runVerifyProcessingProjector,
} from "../src/projector";
import { CommandTypeCard, EventTypeCard } from "../src/typesCard";

it("Trovare una carta esistente", async () => {
  let idCard = v4();
  testUtils.setupMessageStore([
    {
      type: EventTypeCard.GIFT_CARD_ADDED,
      stream_name: "giftCard-" + idCard,
      data: {
        id: idCard,
        name: "Amazon",
        description: "Carta per comprarti il frigo",
        image_url: "https://img.it",
        amounts: [5, 10, 20, 30, 50],
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
      type: EventTypeCard.GIFT_CARD_ADDED,
      stream_name: "giftCard-" + idCard,
      data: {
        id: idCard,
        name: "Amazon",
        description: "Carta per comprarti il frigo",
        image_url: "https://img.it",
        amounts: [5, 10, 20, 30, 50],
      },
    },
  ]);

  expect(await runCardExistProjector(idCardinesistente)).toEqual(false);
});

it("Trovare una carta esistente ma adesso rimossa", async () => {
  let idCard = v4();
  testUtils.setupMessageStore([
    {
      type: EventTypeCard.GIFT_CARD_ADDED,
      stream_name: "giftCard-" + idCard,
      data: {
        id: idCard,
        name: "Amazon",
        description: "Carta per comprarti il frigo",
        image_url: "https://img.it",
        amounts: [5, 10, 20, 30, 50],
      },
    },
    {
      type: EventTypeCard.GIFT_CARD_REMOVED,
      stream_name: "giftCard-" + idCard,
      data: {
        id: idCard,
      },
    },
  ]);

  expect(await runCardExistProjector(idCard)).toEqual(false);
});

it("Verifica se un taglio esiste", async () => {
  let idCard = v4();
  testUtils.setupMessageStore([
    {
      type: EventTypeCard.GIFT_CARD_ADDED,
      stream_name: "giftCard-" + idCard,
      data: {
        id: idCard,
        name: "Amazon",
        description: "Carta per comprarti il frigo",
        image_url: "https://img.it",
        amounts: [5, 10, 20, 30, 50],
      },
    },
  ]);

  expect(await runVerifyAmountProjector(idCard, 10)).toEqual(true);
});

it("Verifica se un taglio non esiste", async () => {
  let idCard = v4();
  testUtils.setupMessageStore([
    {
      type: EventTypeCard.GIFT_CARD_ADDED,
      stream_name: "giftCard-" + idCard,
      data: {
        id: idCard,
        name: "Amazon",
        description: "Carta per comprarti il frigo",
        image_url: "https://img.it",
        amounts: [5, 10, 20, 30, 50],
      },
    },
  ]);

  expect(await runVerifyAmountProjector(idCard, 12)).toEqual(false);
});

it("Ritorna false se non è in pending", async () => {
  let idCard = v4();
  let idTrans = v4();
  testUtils.setupMessageStore([
    {
      type: EventTypeCard.GIFT_CARD_ADDED,
      stream_name: "giftCard-" + idCard,
      data: {
        id: idCard,
        name: "Amazon",
        description: "Carta per comprarti il frigo",
        image_url: "https://img.it",
        amounts: [5, 10, 20, 30, 50],
      },
    },
  ]);

  expect(await runVerifyPendingProjector(idTrans)).toEqual(false);
});

it("Ritorna true se è in pending", async () => {
  let idTrans = v4();
  testUtils.setupMessageStore([
    {
      type: EventTypeCard.GIFT_CARD_REDEEM_PENDING,
      stream_name: "giftCardTransaction-" + idTrans,
      data: {},
    },
  ]);

  expect(await runVerifyPendingProjector(idTrans)).toEqual(true);
});

it("Ritorna false se non è in Processing", async () => {
  let idCard = v4();
  let idTrans = v4();
  testUtils.setupMessageStore([
    {
      type: EventTypeCard.GIFT_CARD_ADDED,
      stream_name: "giftCard-" + idCard,
      data: {
        id: idCard,
        name: "Amazon",
        description: "Carta per comprarti il frigo",
        image_url: "https://img.it",
        amounts: [5, 10, 20, 30, 50],
      },
    },
    {
      type: EventTypeCard.GIFT_CARD_REDEEM_PENDING,
      stream_name: "giftCardTransaction-" + idTrans,
      data: {
        id: idTrans,
      },
    },
  ]);

  expect(await runVerifyProcessingProjector(idTrans)).toEqual(false);
});

it("Ritorna true se è in Processing", async () => {
  let idTrans = v4();
  testUtils.setupMessageStore([
    {
      type: EventTypeCard.GIFT_CARD_REDEEM_PROCESSING,
      stream_name: "giftCardTransaction-" + idTrans,
      data: { id: idTrans },
    },
  ]);

  expect(await runVerifyProcessingProjector(idTrans)).toEqual(true);
});

it("Ritorna false se non è in Delivery", async () => {
  let idCard = v4();
  let idTrans = v4();
  testUtils.setupMessageStore([
    {
      type: EventTypeCard.GIFT_CARD_ADDED,
      stream_name: "giftCard-" + idCard,
      data: {
        id: idCard,
        name: "Amazon",
        description: "Carta per comprarti il frigo",
        image_url: "https://img.it",
        amounts: [5, 10, 20, 30, 50],
      },
    },
    {
      type: EventTypeCard.GIFT_CARD_REDEEM_PENDING,
      stream_name: "giftCardTransaction-" + idTrans,
      data: {
        id: idTrans,
      },
    },
  ]);

  expect(await runVerifyDeliveryProjector(idTrans)).toEqual(false);
});

it("Ritorna true se è in delivery", async () => {
  let idTrans = v4();
  testUtils.setupMessageStore([
    {
      type: EventTypeCard.GIFT_CARD_REDEEM_SUCCEDED,
      stream_name: "giftCardTransaction-" + idTrans,
      data: { id: idTrans },
    },
  ]);

  expect(await runVerifyDeliveryProjector(idTrans)).toEqual(true);
});

it("Ritorna false se non c'è stato un errore", async () => {
  let idTrans = v4();
  testUtils.setupMessageStore([
    {
      type: EventTypeCard.GIFT_CARD_REDEEM_SUCCEDED,
      stream_name: "giftCardTransaction-" + idTrans,
      data: { id: idTrans },
    },
  ]);

  expect(await runVerifyErrorProjector(idTrans)).toEqual(false);
});

it("Ritorna true se c'è stato un errore", async () => {
  let idTrans = v4();
  testUtils.setupMessageStore([
    {
      type: EventTypeCard.GIFT_CARD_REDEEM_PENDING,
      stream_name: "giftCardTransaction-" + idTrans,
      data: {
        id: idTrans,
      },
    },
    {
      type: EventTypeCard.GIFT_CARD_REDEEM_FAILED,
      stream_name: "giftCardTransaction-" + idTrans,
      data: {
        id: idTrans,
      },
    },
  ]);

  expect(await runVerifyErrorProjector(idTrans)).toEqual(true);
});
