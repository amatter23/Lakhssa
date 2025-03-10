export async function POST(req) {
  const { prompt } = await req.json();

  const response = await fetch("http://207.154.240.233:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gemma2:2b", prompt, stream: true }),
  });

  const readableStream = new ReadableStream({
    async start(controller) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            controller.close();
            break;
          }

          // Accumulate the decoded chunk
          buffer += decoder.decode(value, { stream: true });
          
          // Process complete JSON objects
          const lines = buffer.split('\n');
          
          // Keep any incomplete last line in the buffer
          buffer = lines.pop();

          lines.forEach(line => {
            if (line.trim()) {
              try {
                const parsedChunk = JSON.parse(line);
                if (parsedChunk.response) {
                  controller.enqueue(new TextEncoder().encode(parsedChunk.response));
                }
              } catch (parseError) {
                // If parsing fails, it might be a partial response
                console.error('Parsing error:', parseError);
              }
            }
          });
        }

        // Process any remaining buffer
        if (buffer.trim()) {
          try {
            const parsedChunk = JSON.parse(buffer);
            if (parsedChunk.response) {
              controller.enqueue(new TextEncoder().encode(parsedChunk.response));
            }
          } catch (parseError) {
            console.error('Final buffer parsing error:', parseError);
          }
        }
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(readableStream, {
    headers: { 
      "Content-Type": "text/plain",
      "Transfer-Encoding": "chunked"
    },
  });
}