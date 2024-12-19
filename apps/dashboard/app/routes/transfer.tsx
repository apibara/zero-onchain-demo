import { useQuery, useZero } from "@rocicorp/zero/react";
import type { Schema } from "@zero-onchain/schema";
import { redirect, useLoaderData, type LoaderFunctionArgs } from "react-router";
import Card from "~/components/ui/card";
import Grid from "~/components/ui/grid";
import DataTable from "~/components/ui/table";
import { shortenHex } from "~/lib/address";

export function loader({ params }: LoaderFunctionArgs) {
    const address = params.address;
    if (!address) {
        throw redirect("/");
    }

    return { address };
}

export default function TransferPage() {
    const { address } = useLoaderData<typeof loader>();
    const z = useZero<Schema>();

    const query = z.query.transfer.where(({ or, cmp }) => or(cmp("from", "=", address), cmp("to", "=", address))).orderBy("blockTimestamp", "desc").limit(50);

    const [transfers] = useQuery(query);

    const rows = transfers.map(({ from, to, amount, transactionHash, blockNumber }) => [
        <span className={from === address ? "font-bold" : ""}>{shortenHex(from, 8)}</span>,
        <span className={to === address ? "font-bold" : ""}>{shortenHex(to, 8)}</span>,
        <span className="">{amount.toFixed(2)}</span>,
        <span className="">{blockNumber}</span>,
        <span className="">{shortenHex(transactionHash, 6)}</span>,
    ]);

    return (
        <Grid>
            <a href="/">Back</a>
            <br />
            <Card title={shortenHex(address)}>
                <DataTable data={[["FROM", "TO", "AMOUNT", "TRANSACTION HASH"], ...rows]} />
            </Card>
        </Grid>
    )
}