const TYPESAFE_ORIGIN = "https://api.typesafe.ai";

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
  async fetch(request, env) {
    const url = new URL(request.url);
    const isSystemOne = url.pathname === "/v1/systemone";
    const isModels = url.pathname === "/v1/models";

    if (!isSystemOne && !isModels) {
      return env.ASSETS.fetch(request);
    }

    const requestOrigin = request.headers.get("Origin");
    if (requestOrigin && requestOrigin !== url.origin) {
      return new Response("Forbidden origin", { status: 403 });
    }
    const origin = requestOrigin || url.origin;

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin),
      });
    }

    const allowed =
      (request.method === "POST" && isSystemOne) ||
      (request.method === "GET" && isModels);

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
