import { Sink, SinkCursorParams } from "@apibara/indexer";
import { Zero } from "@rocicorp/zero";
import { Schema, schema } from "@zero-onchain/schema";

export function createZero(server: string) {
    return new Zero({
        userID: "indexer",
        server,
        schema,
        kvStore: "mem",
    })
}

export function zeroSink({ z }: { z: Zero<Schema> }) {
    return new ZeroSink(z);
}

export class ZeroSink extends Sink {
    constructor(private readonly z: Zero<Schema>) {
        super();
    }

    async transaction({ cursor, endCursor, finality }: SinkCursorParams, cb: (params: unknown) => Promise<void>) {
        if (this.z.closed) {
            throw new Error("Zero is closed");
        }

        await this.z.mutateBatch(async (tx) => {
            await cb(tx);
        })
    }

    async invalidate() {
    }

    async invalidateOnRestart() {
    }

    async finalize() {
    }
}