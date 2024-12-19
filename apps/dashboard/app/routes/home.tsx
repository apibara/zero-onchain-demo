import { useQuery, useZero } from "@rocicorp/zero/react";
import { useState } from "react";
import type { Route } from "./+types/home";
import type { Schema } from "@zero-onchain/schema";
import { useNavigate } from "react-router";
import Card from "~/components/ui/card";
import Grid from "~/components/ui/grid";
import Input from "~/components/ui/input";
import Button from "~/components/ui/button";
import DataTable from "~/components/ui/table";
import { shortenHex } from "~/lib/address";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Zero + Apibara Demo" },
  ];
}

export default function Home() {
  const z = useZero<Schema>();
  const navigate = useNavigate();

  const [watchlist] = useQuery(z.query.watchedAddress.where("userId", "=", z.userID).related("balance"));

  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState("");

  const handleSubmit = async () => {
    if (!address || !address.startsWith("0x") || address.length !== 66) {
      setError("Invalid address");
      return;
    };

    setError(null);
    const id = crypto.randomUUID();
    await z.mutate.watchedAddress.insert({
      id,
      userId: z.userID,
      address,
    })
    setAddress("");
  }

  const handleDelete = async (id: string) => {
    await z.mutate.watchedAddress.delete({
      id,
    })
  }

  const rows = watchlist.map(({ address, balance }) => [
    <button onClick={() => navigate(`/transfer/${address}`)} className="pointer">{shortenHex(address)}</button>,
    balance?.[0]?.balance.toFixed(2) ?? "0"
  ]);

  return (
    <Grid>
      <Card title="WATCHLIST">
        <Input autoComplete="off" name="address" label="ADDRESS" onChange={(e) => setAddress(e.target.value)} value={address} />
        {error ? <>
          <br />
          <p>{error}</p>
        </> : null}
        <br />
        <Button onClick={handleSubmit}>WATCH ADDRESS</Button>
        <br />
        <br />
        <DataTable data={[
          ["ADDRESS", "BALANCE"],
          ...rows,
        ]}
        />
      </Card>
    </Grid>
  )
}
