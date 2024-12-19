import { StarknetStream } from "@apibara/starknet";
import { defineIndexer } from "@apibara/indexer";
import { useLogger } from "@apibara/indexer/plugins/logger";
import { hash } from "starknet";
import { formatUnits } from "viem";
import type { Balance, Transfer } from "@zero-onchain/schema";

const contractAddress = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";
const balanceKey = hash.getSelectorFromName("ERC20_balances");
const decimals = 18;

export default defineIndexer(StarknetStream)({
    streamUrl: "https://starknet.preview.apibara.org",
    startingCursor: {
        orderKey: 900_000n,
    },
    filter: {
        events: [{
            address: contractAddress,
            keys: [hash.getSelector("Transfer") as `0x${string}`]
        }],
        storageDiffs: [{
            contractAddress,
        }],
    },
    async transform({ block }) {
        const logger = useLogger();
        const { events, header, storageDiffs } = block;
        logger.log(`Block number ${header?.blockNumber}`)

        const storageToAddress: Record<string, string> = {};

        const transfers: Transfer[] = [];
        const balances: Balance[] = [];

        const timestamp = header?.timestamp?.getTime() ?? 0;

        for (const event of events) {
            if (event.data?.length !== 4) {
                throw new Error("Invalid event data");
            }

            const [from, to, amountLower, amountUpper] = event.data;

            if (amountUpper !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
                throw new Error("Invalid amount");
            }

            const amount = formatUnits(BigInt(amountLower), decimals);

            addAddress(storageToAddress, from);
            addAddress(storageToAddress, to);

            logger.log(`Event ${event.eventIndex} from=${from} to=${to} amount=${amount}`)

            transfers.push({
                id: `${event.transactionHash}-${event.eventIndex}`,
                from,
                to,
                amount: Number(amount),
                amountExact: amount,
                transactionHash: event.transactionHash!,
                blockNumber: Number(header?.blockNumber ?? 0),
                blockTimestamp: timestamp,
            });
        }

        for (const diff of storageDiffs) {
            for (const entry of diff.storageEntries ?? []) {
                if (!entry.key || !entry.value) {
                    continue;
                }

                const address = storageToAddress[entry.key];

                if (!address) {
                    continue;
                }

                const balance = formatUnits(BigInt(entry.value), decimals);
                logger.log(`address=${address} balance=${balance}`);

                balances.push({
                    address,
                    lastUpdated: timestamp,
                    balance: Number(balance),
                    balanceExact: balance,
                });
            }
        }
    },
});

const ADDR_BOUND = 2n ** 251n - 256n;

function addAddress(map: Record<string, string>, addr: string) {
    if (map[addr]) return;

    let acc = hash.getSelectorFromName("ERC20_balances");
    acc = hash.computePedersenHash(acc, addr);
    let res = BigInt(acc);
    while (res > ADDR_BOUND) {
        res -= ADDR_BOUND;
    }
    map[`0x${res.toString(16).padStart(64, "0")}`] = addr;
}
