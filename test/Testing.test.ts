import { testUtils } from "@keix/message-store-client";
import { v4 } from "uuid";
import { run } from "../src";
import { runBalanceProjector } from "../src/projector";
import { CommandType, EventType } from "../src/types";

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

  await testUtils.expectIdempotency(run, () => {
    let event = testUtils.getStreamMessages("creditAccount");
    expect(event).toHaveLength(1);
    expect(event[0].type).toEqual(EventType.CREDITS_EARNED);
    expect(event[0].data.id).toEqual(idAccount1);
    expect(event[0].data.amountCredit).toEqual(30);
  });
});

it("Addebito sotto al minimo balance ad un dato account", async () => { //////////////////////////////////IMPLEMNETARE
  let idAccount1 = v4();
  testUtils.setupMessageStore([
    {
      type: CommandType.USE_CREDITS,
      stream_name: "creditAccount:command-" + idAccount1,
      data: {
        id: idAccount1,
        amountCredit: 30,
      },
    },
  ]);

  await testUtils.expectIdempotency(run, () => {
    let event = testUtils.getStreamMessages("creditAccount");
    expect(event).toHaveLength(1);
    expect(event[0].type).toEqual(EventType.CREDITS_USED);
    expect(event[0].data.id).toEqual(idAccount1);
    expect(event[0].data.amountCredit).toEqual(30);
  });
});

it("Addebito balance ad un dato account", async () => {
  let idAccount1 = v4();
  testUtils.setupMessageStore([
    {
      type: CommandType.USE_CREDITS,
      stream_name: "creditAccount:command-" + idAccount1,
      data: {
        id: idAccount1,
        amountCredit: 30,
      },
    },
  ]);

  await testUtils.expectIdempotency(run, () => {
    let event = testUtils.getStreamMessages("creditAccount");
    expect(event).toHaveLength(1);
    expect(event[0].type).toEqual(EventType.CREDITS_USED);
    expect(event[0].data.id).toEqual(idAccount1);
    expect(event[0].data.amountCredit).toEqual(30);
  });
});

it("Calcolo balance di un utente", async () => {
  let idAccount1 = v4();
  let idAccount2 = v4();
  testUtils.setupMessageStore([
    {
      type: EventType.CREDITS_EARNED,
      stream_name: "creditAccount-" + idAccount1,
      data: {
        id: idAccount1,
        amountCredit: 30,
      },
    },
    {
      type: EventType.CREDITS_EARNED,
      stream_name: "creditAccount-" + idAccount2,
      data: {
        id: idAccount2,
        amountCredit: 30,
      },
    },
    {
      type: EventType.CREDITS_EARNED,
      stream_name: "creditAccount-" + idAccount1,
      data: {
        id: idAccount1,
        amountCredit: 20,
      },
    },
    {
      type: EventType.CREDITS_EARNED,
      stream_name: "creditAccount-" + idAccount1,
      data: {
        id: idAccount1,
        amountCredit: 50,
      },
    },
  ]);

  expect(await runBalanceProjector(idAccount1)).toEqual(100);
});

it("Calcolo balance negativo di un utente", async () => {
  let idAccount1 = v4();
  let idAccount2 = v4();
  testUtils.setupMessageStore([
    {
      type: EventType.CREDITS_USED,
      stream_name: "creditAccount-" + idAccount1,
      data: {
        id: idAccount1,
        amountCredit: 30,
      },
    },
    {
      type: EventType.CREDITS_USED,
      stream_name: "creditAccount-" + idAccount2,
      data: {
        id: idAccount2,
        amountCredit: 30,
      },
    },
    {
      type: EventType.CREDITS_USED,
      stream_name: "creditAccount-" + idAccount1,
      data: {
        id: idAccount1,
        amountCredit: 20,
      },
    },
    {
      type: EventType.CREDITS_USED,
      stream_name: "creditAccount-" + idAccount1,
      data: {
        id: idAccount1,
        amountCredit: 50,
      },
    },
  ]);

  expect(await runBalanceProjector(idAccount1)).toEqual(-100);
});

it("Calcolo balance misto di un utente", async () => {
  let idAccount1 = v4();
  let idAccount2 = v4();
  testUtils.setupMessageStore([
    {
      type: EventType.CREDITS_EARNED,
      stream_name: "creditAccount-" + idAccount1,
      data: {
        id: idAccount1,
        amountCredit: 10,
      },
    },
    {
      type: EventType.CREDITS_EARNED,
      stream_name: "creditAccount-" + idAccount2,
      data: {
        id: idAccount2,
        amountCredit: 30,
      },
    },
    {
      type: EventType.CREDITS_EARNED,
      stream_name: "creditAccount-" + idAccount1,
      data: {
        id: idAccount1,
        amountCredit: 20,
      },
    },
    {
      type: EventType.CREDITS_USED,
      stream_name: "creditAccount-" + idAccount1,
      data: {
        id: idAccount1,
        amountCredit: 50,
      },
    },
  ]);

  expect(await runBalanceProjector(idAccount1)).toEqual(-20);
});
