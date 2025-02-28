"use client";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import style from "./page.module.css";
export default function Home() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setOutput("");
    const response = await fetch("/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "summarize in bullet points" + input,
      }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      try {
        chunk.split("\n").forEach((jsonString) => {
          if (jsonString.trim()) {
            const json = JSON.parse(jsonString);
            if (json.response) {
              setOutput((prev) => prev + json.response);
            }
          }
        });
      } catch (error) {
        console.error("Error parsing JSON chunk:", error);
      }
    }
  };

  return (
    <main className={style.container}>
      <div className={style.content}>
        <h1>Lakhssa</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text..."
          />
          <button type="submit">Summarize</button>
        </form>
      </div>
      <div className={style.output}>
        <div>Summary</div>
        <ReactMarkdown style={{ whiteSpace: "pre-wrap" }}>
          {output}
        </ReactMarkdown>
      </div>
    </main>
  );
}
