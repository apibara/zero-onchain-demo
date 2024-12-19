
export function shortenHex(address: string, targetLength: number = 30) {
    const n = Math.floor((targetLength - 2) / 2);
    return `${address.slice(0, n + 2)}...${address.slice(-n)}`;
}