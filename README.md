# Zero + Apibara

This demo shows how to use [Zero](https://zero.rocicorp.com/) together with [Apibara](https://www.apibara.com/) to build a simple dashboard for onchain data.

**This demo is not production ready.** It is a proof of concept and should not be used in production.
The most important thing to note is that while the data is streamed in real-time, the Zero sink
doesn't handle chain reorgs yet.

[Screencast](https://github.com/user-attachments/assets/ab6f4bdc-424d-4498-9eb9-070d1e48a2aa)

## Setup

1. Clone the repo
2. Start the Postgres server with `docker compose -f docker/docker-compose.yml up`
3. Install the dependencies with `pnpm install`
4. Run the Zero server with `pnpm dev:zero-cache`
5. Run the Vite server and Apibara indexers with `pnpm dev`
6. Open the dashboard at `http://localhost:5173/`

## How it works

To learn how Zero works, [refer to their documentation](https://zero.rocicorp.dev/).;

This demo introduces a new custom indexer sink that provides a [Zero transaction](https://zero.rocicorp.dev/docs/writing-data#batch-mutate)
to the transform function. This way, the indexer can insert/update and delete data in the database.

The schema is shared between the dashboard and the indexer, you can find it in `packages/schema/src/schema.ts`.

The indexer is a standard Apibara indexer, it listens for Transfer events and contract storage updates. It uses
this information to compute balances and transfers, inserting them into the database.

The dashboard provides a way for the user to create a "watchlist" of addresses and display their balances and transfers.
It uses Zero's relations to fetch and update the account's balance in real-time. When the indexer updates the balance,
the UI is updated automatically. The query is as simple as:

```ts
const query = z.query.watchedAddress
    .where("userId", "=", z.userID).related("balance");
```

Since an account may have _many_ transfers, we use the `limit` option to only fetch the last 50 transfers. As more transfers are indexed,
this query will continously receive new data.

```ts
const query = z.query.transfer
    .where(({ or, cmp }) => or(cmp("from", "=", address), cmp("to", "=", address)))
    .orderBy("blockTimestamp", "desc")
    .limit(50);
```
