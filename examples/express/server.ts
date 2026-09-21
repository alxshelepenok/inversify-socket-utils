import "reflect-metadata";

import { createServer } from "http";
import { Server } from "socket.io";
import { Container } from "inversify";
import { InversifyExpressHttpAdapter } from "@inversifyjs/http-express";
import { interfaces, InversifySocketServer, TYPE } from "inversify-socket-utils";

import { UserService } from "./services/user";
import { UserController } from "./controllers/user";
import { MessageController } from "./controllers/message";

const port = Number(process.env.PORT ?? 3000);
const container = new Container();

container.bind(UserService).toSelf().inSingletonScope();
container.bind(UserController).toSelf();

container
  .bind<interfaces.Controller>(TYPE.Controller)
  .to(MessageController);

const adapter = new InversifyExpressHttpAdapter(container, {
  logger: true,
  useJson: true,
});

const app = await adapter.build();

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

container.bind(Server).toConstantValue(io);

new InversifySocketServer(container, io).build();

httpServer.listen(port, () => {
  console.log(`HTTP is listening on http://127.0.0.1:${port}/api/users`);
  console.log(`WS is listening on ws://127.0.0.1:${port}`);
});
