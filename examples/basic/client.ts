import { io } from "socket.io-client";

const port = process.env.PORT ?? 3000;
const client = io(`http://127.0.0.1:${port}/namespace`, {
  transports: ["websocket"],
});

client.on("connect_error", (error) => {
  console.error("[client] connect error:", error.message);
  process.exit(1);
});

await new Promise<void>((resolve) => client.once("connect", resolve));
console.log("[client] connected to /namespace");

const reply = new Promise<string>((resolve) =>
  client.once("message", resolve),
);

client.emit("message");

const answer = await reply;
console.log("[client] received:", answer);

if (answer !== "hello!") {
  console.error("[client] unexpected reply:", answer);
  process.exit(1);
}

client.disconnect();
setTimeout(() => process.exit(0), 300);
