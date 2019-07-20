# inversify-socket-utils

[![circleci build status](https://circleci.com/gh/alxshelepenok/inversify-socket-utils.svg?style=svg)](https://circleci.com/gh/alxshelepenok/inversify-socket-utils)
[![travisci build status](https://travis-ci.org/alxshelepenok/inversify-socket-utils.svg?branch=master)](https://travis-ci.org/alxshelepenok/inversify-socket-utils)
[![npm version](https://badge.fury.io/js/inversify-socket-utils.svg)](https://badge.fury.io/js/inversify-socket-utils)

Some utilities for the development of socket.io applications with Inversify.

## Installation

You can install `inversify-socket-utils` using npm:

```sh
npm install inversify inversify-socket-utils reflect-metadata --save
```

The `inversify-socket-utils` type definitions are included in the npm module and require TypeScript 2.0.
Please refer to the [InversifyJS documentation](https://github.com/inversify/InversifyJS#installation) to learn more about the installation process.

## How to use

Step 1: Create a controller.

```ts
import { injectable } from "inversify";
import {Controller, Payload, ConnectedSocket, OnConnect, OnDisconnect, OnMessage} from "../../../src";
import "reflect-metadata";

@injectable()
@Controller(
  '/namespace'
)
export class MessageController {
  @OnConnect("connection")
    connection() {
        console.log("Client connected");
    }

    @OnDisconnect("disconnect")
    disconnect() {
        console.log("Client disconnected");
    }

    @OnMessage("message")
    message(@Payload() payload: any, @ConnectedSocket() socket: any) {
        console.log("Message received");
        socket.emit("message", "Hello!");
    }
}

```

Step 2: Configure container and server.

Configure the inversify container in your composition root as usual.

Then, pass the container to the InversifySocketServer constructor. This will allow it to register all controllers and their dependencies from your container and attach them to the Socket IO app.
Then just call server.build() to prepare your app.

In order for the InversifySocketServer to find your controllers, you must bind them to the `TYPE.Controller` service identifier and tag the binding with the controller's name.

```ts
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

```

## License

The MIT License (MIT)

Copyright (c) 2019 Alexander Shelepenok

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
