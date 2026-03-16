export async function sendMessage(message, provider = "local") {
  const response = await fetch("http://127.0.0.1:8000/api/ai/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      provider,
    }),
  });

  if (!response.ok) {
    throw new Error("AI service error");
  }

  const data = await response.json();
  return data.response;
}
