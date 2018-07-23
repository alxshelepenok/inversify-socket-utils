import * as http from "http";
import * as SocketIO from "socket.io";
import { Container } from "inversify";
import { Interfaces, InversifySocketServer, TYPE } from "../../src";
import { MessageController } from "./controllers/message";

let container = new Container();

container.bind<Interfaces.Controller>(TYPE.Controller).to(MessageController);

let app = http.createServer();

let io = SocketIO(app);
let server = new InversifySocketServer(container, io);
server.build();

app.listen(3000);
console.log(`Server is listening on port 3000`);
