export async function POST(req) {
  const { prompt } = await req.json();

  const response = await fetch("http://207.154.240.233:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gemma2:2b", prompt, stream: true }),
  });

  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      const reader = response.body.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        controller.enqueue(value);
      }

      controller.close();
    },
  });

  return new Response(readableStream, {
    headers: { "Content-Type": "text/plain" },
  });
}
