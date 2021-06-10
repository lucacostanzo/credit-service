import { subscribe } from "@keix/message-store-client";
import { EventCredits, EventTypeCredit } from "../credits/types";
import Redis from "ioredis";

interface UserTransaction {
  id: string;
  amount: number;
}

let redisClient = new Redis();

export async function getUserAmount(id: string) {
  return await redisClient.hget("userCredits", id);
}

export async function getUserTransaction(
  id: string
): Promise<UserTransaction[]> {
  let arrayTransaction = `creditAccount-${id}`;
  let listTrans = await redisClient.lrange(
    arrayTransaction,
    0,
    await redisClient.llen(arrayTransaction)
  );
  return listTrans.map((transaction) => {
    return JSON.parse(transaction);
  });
}

export async function hasProcessedTransaction(
  id: string,
  transactionId: string
): Promise<boolean> {
  let transactions = await getUserTransaction(id);
  return (
    transactions.find((d: { id: string }) => d.id == transactionId) != null
  );
}

async function handler(event: EventCredits) {
  if (
    (event.type == EventTypeCredit.CREDITS_EARNED ||
      event.type == EventTypeCredit.CREDITS_USED) &&
    (await hasProcessedTransaction(event.data.id, event.data.transactionId))
  ) {
    return;
  }
  switch (event.type) {
    case EventTypeCredit.CREDITS_EARNED: {
      await redisClient.hincrby(
        "userCredits",
        event.data.id,
        event.data.amount
      );
      let key = `creditAccount-${event.data.id}`;
      let transaction: UserTransaction = {
        id: event.data.transactionId,
        amount: event.data.amount,
      };
      return await redisClient.rpush(key, JSON.stringify(transaction));
    }

    case EventTypeCredit.CREDITS_USED: {
      await redisClient.hincrby(
        "userCredits",
        event.data.id,
        -event.data.amount
      );

      let key = `creditAccount-${event.data.id}`;
      let transaction: UserTransaction = {
        id: event.data.transactionId,
        amount: -event.data.amount,
      };
      return await redisClient.rpush(key, JSON.stringify(transaction));
    }
  }
}

export async function run() {
  return subscribe(
    {
      streamName: "creditAccount",
    },
    handler
  );
}
