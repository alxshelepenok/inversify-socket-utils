import { io } from "socket.io-client";

const port = process.env.PORT ?? 3000;
const base = `http://127.0.0.1:${port}`;

const fail = (message: string): never => {
  console.error(`[client] ${message}`);
  process.exit(1);
};

const listResponse = await fetch(`${base}/api/users`);
const users = (await listResponse.json()) as Array<{ name: string }>;

console.log(`[http] GET /api/users -> ${users.map((user) => user.name).join(", ")}`);

if (!listResponse.ok || users.length === 0) {
  fail("GET /api/users did not return any users");
}

const detailResponse = await fetch(`${base}/api/users/1`);
if (detailResponse.status !== 200) {
  fail(`GET /api/users/1 -> ${detailResponse.status}`);
}

const missingResponse = await fetch(`${base}/api/users/999`);
if (missingResponse.status !== 404) {
  fail(`GET /api/users/999 -> ${missingResponse.status}, expected 404`);
}

const client = io(base, {
  transports: ["websocket"],
});

client.on("connect_error", (error) => fail(`connect error: ${error.message}`));

const connected = new Promise<{ totalUsers: number }>((resolve) =>
  client.once("connected", resolve),
);
await new Promise<void>((resolve) => client.once("connect", resolve));

const hello = await connected;
console.log(`[ws] connected, server knows ${hello.totalUsers} user(s)`);

const reply = new Promise<string>((resolve) => client.once("message", resolve));
client.emit("message", { text: "hello" });

const answer = await reply;
console.log(`[ws] received: ${answer}`);
if (!answer.includes("hello")) {
  fail(`unexpected echo: ${answer}`);
}

const created = new Promise<{ name: string }>((resolve) =>
  client.once("user:created", resolve),
);

const createResponse = await fetch(`${base}/api/users`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ name: "Summer Smith", email: "summer@example.com" }),
});

const createdUser = (await createResponse.json()) as { name: string };

console.log(`[http] POST /api/users -> ${createdUser.name}`);

const broadcast = await created;
console.log(`[ws] broadcast received: user:created ${broadcast.name}`);
if (broadcast.name !== createdUser.name) {
  fail("broadcast payload mismatch");
}

client.disconnect();

setTimeout(() => process.exit(0), 300);
