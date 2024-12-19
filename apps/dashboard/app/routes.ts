import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("/transfer/:address", "routes/transfer.tsx"),
] satisfies RouteConfig;
