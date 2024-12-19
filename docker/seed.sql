CREATE DATABASE zonchain;
CREATE DATABASE zonchain_cvr;
CREATE DATABASE zonchain_cdb;

\c zonchain;

CREATE TABLE "balance" (
    "address" TEXT PRIMARY KEY,
    "lastUpdated" TIMESTAMP NOT NULL,
    "balance" INTEGER NOT NULL,
    "balanceExact" TEXT NOT NULL
);

CREATE TABLE "watchedAddress" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "address" TEXT NOT NULL
);

CREATE TABLE "transfer" (
    "id" TEXT PRIMARY KEY,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "amountExact" TEXT NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "blockTimestamp" TIMESTAMP NOT NULL
);
