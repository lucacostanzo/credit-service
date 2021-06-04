import { testUtils } from "@keix/message-store-client";
import { v4 } from "uuid";
import { EventTypeCredit } from "../src/credits/types";
import {
  getUserAmount,
  getUserTransaction,
  run,
} from "../src/aggregators/index";

it("should return the amount of credits", async () => {
  let idAccount = v4();
  let idTransaction = v4();
  let idTransaction1 = v4();
  let idTransaction2 = v4();
  testUtils.setupMessageStore([
    {
      type: EventTypeCredit.CREDITS_EARNED,
      stream_name: "creditAccount-" + idAccount,
      data: {
        id: idAccount,
        transactionId: idTransaction,
        amount: 30,
      },
    },
    {
      type: EventTypeCredit.CREDITS_EARNED,
      stream_name: "creditAccount-" + idAccount,
      data: {
        id: idAccount,
        transactionId: idTransaction1,
        amount: 60,
      },
    },
    {
      type: EventTypeCredit.CREDITS_USED,
      stream_name: "creditAccount-" + idAccount,
      data: {
        id: idAccount,
        transactionId: idTransaction2,
        amount: 50,
      },
    },
  ]);

  await testUtils.expectIdempotency(run, async () => {
    expect(await getUserAmount(idAccount)).toEqual("40");
  });
});

it("should return the transaction list", async () => {
  let idAccount = v4();
  let idTransaction = v4();
  testUtils.setupMessageStore([
    {
      type: EventTypeCredit.CREDITS_EARNED,
      stream_name: "creditAccount-" + idAccount,
      data: {
        id: idAccount,
        transactionId: idTransaction,
        amount: 30,
      },
    },
    {
      type: EventTypeCredit.CREDITS_EARNED,
      stream_name: "creditAccount-" + idAccount,
      data: {
        id: idAccount,
        transactionId: idTransaction,
        amount: 150,
      },
    },
    {
      type: EventTypeCredit.CREDITS_EARNED,
      stream_name: "creditAccount-" + idAccount,
      data: {
        id: idAccount,
        transactionId: idTransaction,
        amount: 120,
      },
    },
    {
      type: EventTypeCredit.CREDITS_EARNED,
      stream_name: "creditAccount-" + idAccount,
      data: {
        id: idAccount,
        transactionId: idTransaction,
        amount: 20,
      },
    },
  ]);

  await testUtils.expectIdempotency(run, async () => {
    expect(await getUserTransaction(idAccount)).toEqual([
      { id: idTransaction, amount: 30 },
      { id: idTransaction, amount: 150 },
      { id: idTransaction, amount: 120 },
      { id: idTransaction, amount: 20 },
    ]);
  });
});
