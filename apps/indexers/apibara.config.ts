import { defineConfig } from "apibara/config";
import typescript from '@rollup/plugin-typescript';

export default defineConfig({
    runtimeConfig: {
        serverUrl: process.env.ZERO_URL ?? "http://127.0.0.1:4848",
    },
    rollupConfig: {
        plugins: [
            typescript(),
        ]
    }
});