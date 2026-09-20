const TYPESAFE_ORIGIN = "https://api.typesafe.ai";
const ALLOWED_ORIGIN = "https://kmtshn.github.io";

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...corsHeaders(origin),
    },
  });
}

export default {
  async fetch(request) {
    const origin = request.headers.get("Origin") || "";

    if (origin !== ALLOWED_ORIGIN) {
      return new Response("Forbidden origin", { status: 403 });
    }

    const url = new URL(request.url);
    const allowedPath = url.pathname === "/v1/systemone" || url.pathname === "/v1/models";

    if (!allowedPath) {
      return json({ error: "Not found" }, 404, origin);
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin),
      });
    }

    const allowed =
      (request.method === "POST" && url.pathname === "/v1/systemone") ||
      (request.method === "GET" && url.pathname === "/v1/models");

    if (!allowed) {
      return json({ error: "Method not allowed" }, 405, origin);
    }

    const authorization = request.headers.get("Authorization");
    if (!authorization || !authorization.startsWith("Bearer ") || !authorization.slice(7).trim()) {
      return json({ error: "Missing API key" }, 401, origin);
    }

    const headers = new Headers();
    headers.set("Authorization", authorization);
    headers.set("Accept", "application/json");
    if (request.method === "POST") {
      headers.set("Content-Type", "application/json");
    }

    let upstream;
    try {
      upstream = await fetch(TYPESAFE_ORIGIN + url.pathname, {
        method: request.method,
        headers,
        body: request.method === "POST" ? request.body : undefined,
        redirect: "manual",
        cache: "no-store",
      });
    } catch (_error) {
      return json({ error: "Upstream connection failed" }, 502, origin);
    }

    const responseHeaders = new Headers();
    responseHeaders.set(
      "Content-Type",
      upstream.headers.get("Content-Type") || "application/json; charset=utf-8"
    );
    responseHeaders.set("Cache-Control", "no-store");
    responseHeaders.set("X-Content-Type-Options", "nosniff");
    for (const [key, value] of Object.entries(corsHeaders(origin))) {
      responseHeaders.set(key, value);
    }

    const requestId = upstream.headers.get("x-typesafe-request-id");
    if (requestId) responseHeaders.set("x-typesafe-request-id", requestId);

    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  },
};
