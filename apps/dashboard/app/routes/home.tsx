import { useQuery, useZero } from "@rocicorp/zero/react";
import { useState } from "react";
import type { Route } from "./+types/home";
import type { Schema } from "@zero-onchain/schema";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Zero + Apibara Demo" },
  ];
}

export default function Home() {
  const z = useZero<Schema>();

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

  return (
  <div className="flex flex-col gap-4 p-4 max-w-[400px]">
    <h1 className="text-2xl font-bold">Watchlist</h1>
    <div className="flex flex-col gap-2 border p-4 rounded-md">
      <div className="flex flex-row gap-2">
        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="flex-grow border rounded-md p-1" />
        <button type="submit" onClick={handleSubmit} className="bg-black text-white rounded-md p-1">Add</button>
      </div>
      {error && <p className="text-red-500">{error}</p>}
    </div>
    <ul className="flex flex-col gap-2">
      {watchlist.map((w) => (
        <li key={w.address} className="flex flex-row gap-2">
          <Link to={`/transfer/${w.address}`} className="hover:underline">
              {w.address.slice(0, 8)}...{w.address.slice(-6)}
          </Link>
          <p>
            {w.balance?.[0]?.balance ?? "0"} STRK
          </p>
          <button onClick={() => handleDelete(w.id)} className="bg-red-500 text-white rounded-md w-7 h-6 text-xs">x</button>
        </li>
      ))}
    </ul>
  </div>
  )
}
