"use client";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import style from "./page.module.css";

export default function Home() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setOutput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "summarize in bullet points" + input,
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error("No reader available");
      }

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        
        // Directly update output with the chunk
        setOutput((prev) => prev + chunk);
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
      setOutput("An error occurred while generating the summary.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={style.container}>
      <div className={style.content}>
        <h1>Mukhtasar</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text..."
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? 'Summarizing...' : 'Summarize'}
          </button>
        </form>
      </div>
      <div className={style.output}>
        <div>Summary</div>
        {isLoading && <p>Generating summary...</p>}
        <ReactMarkdown 
          components={{
            pre: ({node, ...props}) => (
              <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }} {...props} />
            )
          }}
        >
          {output}
        </ReactMarkdown>
      </div>
    </main>
  );
}