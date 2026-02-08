export default {
  async fetch(req: Request): Promise<Response> {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "*",
          "Access-Control-Allow-Headers": "*",
        },
      });
    }

    const url = new URL(req.url).searchParams.get("url");
    if (!url) {
      return new Response("Missing ?url= parameter", { status: 400 });
    }

    try {
      new URL(url);
    } catch {
      return new Response("Invalid URL", { status: 400 });
    }

    try {
      const headers = new Headers(req.headers);
      headers.delete("host");
      headers.delete("cf-connecting-ip");
      headers.delete("cf-ipcountry");
      headers.delete("cf-ray");
      headers.delete("cf-visitor");
      headers.delete("x-forwarded-proto");
      headers.delete("x-real-ip");

      const response = await fetch(url, {
        method: req.method,
        headers,
        body: req.body,
      });

      const res = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
      res.headers.set("Access-Control-Allow-Origin", "*");
      return res;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Fetch failed";
      return new Response(message, { status: 502 });
    }
  },
};
