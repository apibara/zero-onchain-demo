import {
  data,
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useFetcher,
  useLoaderData,
  type ActionFunctionArgs,
  type FetcherWithComponents,
  type LoaderFunctionArgs,
} from "react-router";
import { parse as parseCookie, serialize as serializeCookie } from "cookie";
import { Zero } from "@rocicorp/zero";

import { schema, type Schema } from "@zero-onchain/schema";

import type { Route } from "./+types/root";
import stylesheet from "./app.css?url";
import { ZeroProvider } from "@rocicorp/zero/react";
import { useEffect, useState } from "react";
import { decodeJwt, SignJWT } from "jose";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  { rel: "stylesheet", href: stylesheet },
];

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const userId = formData.get("userId");

  if (!userId || typeof userId !== "string") {
    return {};
  }

  const jwtPayload = {
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
  };

  const jwt = await new SignJWT(jwtPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30days")
    .sign(new TextEncoder().encode(process.env.ZERO_AUTH_SECRET));

  return data({ jwt }, {
    headers: {
      "Set-Cookie": serializeCookie("jwt", jwt, {
        path: "/",
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      })
    },
  })
}

export function loader({ request }: LoaderFunctionArgs) {
  const jwt =
    parseCookie(request.headers.get("Cookie") ?? "")["jwt"];

  return { jwt };
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const fetcher = useFetcher();
  const { jwt } = useLoaderData<typeof loader>();

  const [z, setZ] = useState<Zero<Schema> | null>(null);

  useEffect(() => {
    if (jwt) {
      const decoded = decodeJwt(jwt);

      const z = new Zero({
        userID: decoded.sub ?? "anon",
        auth: () => jwt,
        server: import.meta.env.VITE_PUBLIC_ZERO_URL,
        schema,
        kvStore: "mem",
      });
      setZ(z);
    }
  }, [jwt])


  if (!jwt) {
    return <LoginForm fetcher={fetcher} />;
  }

  if (!z) {
    return <div>Loading...</div>;
  }

  return <ZeroProvider zero={z}><Outlet /></ZeroProvider>;
}

function LoginForm<T>({ fetcher }: { fetcher: FetcherWithComponents<T> }) {
  return (
    <div className="flex flex-col gap-4 p-4 max-w-[400px]">
      <h1 className="text-2xl font-bold">Login</h1>
      <fetcher.Form method="post">
        <input type="text" name="userId" autoComplete="off" className="border rounded-md p-1" />
        <button type="submit" className="bg-black text-white rounded-md p-1">Login</button>
      </fetcher.Form>
    </div>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
