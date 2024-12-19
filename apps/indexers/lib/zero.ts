import { Zero } from "@rocicorp/zero";
import { schema } from "@zero-onchain/schema";

export function createZero(server: string) {
    return new Zero({
        userID: "indexer",
        server,
        schema,
        kvStore: "mem",
    })
}