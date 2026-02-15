# inversify-socket-utils

Some utilities for the development of socket.io applications with Inversify.

## Installation

You can install `inversify-socket-utils` using npm:

```sh
npm install inversify inversify-socket-utils reflect-metadata --save
```

Please refer to the [InversifyJS documentation](https://github.com/inversify/InversifyJS?tab=readme-ov-file#-installation) to learn more about the installation process.

## How to use

Step 1: Create a controller.

```ts
import "reflect-metadata";

import { injectable } from "inversify";
import { Socket } from "socket.io";

import {
  connectedSocket,
  controller,
  onConnect,
  onDisconnect,
  onMessage,
} from "inversify-socket-utils";

@injectable()
@controller("/namespace")
export class MessageController {
  @onConnect("connection")
  connection() {
    console.log("client connected");
  }

  @onDisconnect("disconnect")
  disconnect() {
    console.log("client disconnected");
  }

  @onMessage("message")
  message(@connectedSocket() socket: Socket) {
    console.log("message received");
    socket.emit("message", "hello!");
  }
}
```

Step 2: Configure container and server.

Configure the inversify container in your composition root as usual.

Then, pass the container to the InversifySocketServer constructor. This will allow it to register all controllers and their dependencies from your container and attach them to the socket.io app.
Then just call server.build() to prepare your app.

In order for the InversifySocketServer to find your controllers, you must bind them to the `TYPE.Controller` service identifier and tag the binding with the controller's name.

```ts
import { createServer } from "http";
import { Container } from "inversify";
import { Server } from "socket.io";

import { MessageController } from "./controllers/message";
import {
  interfaces,
  InversifySocketServer,
  TYPE,
} from "inversify-socket-utils";

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
```

## License

The MIT License (MIT)

Copyright (c) 2026 Alex Shelepenok

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
