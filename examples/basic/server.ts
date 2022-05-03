import { createServer } from "http";
import { Container } from "inversify";
import { Server } from "socket.io";

import { MessageController } from "./controllers/message";
import { interfaces, InversifySocketServer, TYPE } from "@/src";

const container = new Container();

container.bind<interfaces.Controller>(TYPE.Controller).to(MessageController);

const app = createServer();

const io = new Server(app, {
  cors: {
    origin: "*",
  },
});

const server = new InversifySocketServer(container, io);
server.build();

app.listen(3000);

console.log("Server is listening on port 3000");
