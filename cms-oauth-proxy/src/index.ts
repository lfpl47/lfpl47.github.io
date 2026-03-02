export interface Env {
  GITHUB_OAUTH_ID: string;
  GITHUB_OAUTH_SECRET: string;
  // Set to "1" if the content repo is private.
  GITHUB_REPO_PRIVATE?: string;
}

function randomHex(bytes: number): string {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return Array.from(buf)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function cookieGet(request: Request, name: string): string | undefined {
  const cookie = request.headers.get("Cookie") ?? "";
  const parts = cookie.split(";").map((p) => p.trim());
  for (const part of parts) {
    if (!part.startsWith(`${name}=`)) continue;
    return decodeURIComponent(part.slice(name.length + 1));
  }
  return undefined;
}

function cookieSet(name: string, value: string): string {
  // 10 minutes is enough for the OAuth flow.
  const maxAge = 60 * 10;
  return `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; Secure; HttpOnly; SameSite=Lax`;
}

function htmlCallback(status: "success" | "error", payload: unknown) {
  const content = JSON.stringify(payload);
  return new Response(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Authorizing…</title>
  </head>
  <body>
    <p>Authorizing Decap…</p>
    <script>
      (function () {
        const content = ${content};
        function receiveMessage(e) {
          window.opener.postMessage(
            \`authorization:github:${status}:\${JSON.stringify(content)}\`,
            e.origin
          );
        }
        window.addEventListener("message", receiveMessage, false);
        window.opener.postMessage("authorizing:github", "*");
      })();
    </script>
  </body>
</html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

async function exchangeCodeForToken(env: Env, code: string, redirectUri: string) {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: env.GITHUB_OAUTH_ID,
      client_secret: env.GITHUB_OAUTH_SECRET,
      code,
      redirect_uri: redirectUri,
    }),
  });

  const json = (await response.json()) as
    | { access_token: string; scope: string; token_type: string }
    | { error: string; error_description?: string };

  if ("access_token" in json) return json.access_token;
  throw new Error(json.error_description ?? json.error ?? "OAuth token exchange failed");
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/auth") {
      const provider = url.searchParams.get("provider");
      if (provider !== "github") return new Response("Invalid provider", { status: 400 });

      const state = randomHex(16);
      const repoIsPrivate = env.GITHUB_REPO_PRIVATE != null && env.GITHUB_REPO_PRIVATE !== "0";
      const scope = repoIsPrivate ? "repo,user" : "public_repo,user";

      const redirectUri = `${url.origin}/callback?provider=github`;
      const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
      authorizeUrl.searchParams.set("response_type", "code");
      authorizeUrl.searchParams.set("client_id", env.GITHUB_OAUTH_ID);
      authorizeUrl.searchParams.set("redirect_uri", redirectUri);
      authorizeUrl.searchParams.set("scope", scope);
      authorizeUrl.searchParams.set("state", state);

      return new Response(null, {
        status: 302,
        headers: {
          Location: authorizeUrl.toString(),
          "Set-Cookie": cookieSet("decap_oauth_state", state),
        },
      });
    }

    if (url.pathname === "/callback") {
      const provider = url.searchParams.get("provider");
      if (provider !== "github") return new Response("Invalid provider", { status: 400 });

      const code = url.searchParams.get("code");
      if (!code) return new Response("Missing code", { status: 400 });

      const state = url.searchParams.get("state") ?? "";
      const expectedState = cookieGet(request, "decap_oauth_state") ?? "";
      if (!expectedState || state !== expectedState) {
        return htmlCallback("error", { error: "Invalid state" });
      }

      try {
        const redirectUri = `${url.origin}/callback?provider=github`;
        const token = await exchangeCodeForToken(env, code, redirectUri);
        return htmlCallback("success", { token, provider: "github" });
      } catch (error) {
        return htmlCallback("error", {
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return new Response("OK", { status: 200 });
  },
};

