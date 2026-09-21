import "reflect-metadata";

import { inject } from "inversify";
import { Server } from "socket.io";
import {
  Body,
  Controller,
  CreatedHttpResponse,
  Get,
  NotFoundHttpResponse,
  Params,
  Post,
} from "@inversifyjs/http-core";

import type { User } from "../services/user";
import { UserService } from "../services/user";

@Controller("/api/users")
export class UserController {
  constructor(
    @inject(UserService) private readonly users: UserService,
    @inject(Server) private readonly io: Server,
  ) {}

  @Get("/")
  list(): User[] {
    return this.users.list();
  }

  @Get("/:id")
  detail(@Params({ name: "id" }) id: string): NotFoundHttpResponse | User {
    const user = this.users.get(Number(id));
    return user ?? new NotFoundHttpResponse();
  }

  @Post("/")
  create(@Body() body: Omit<User, "id">): CreatedHttpResponse {
    const user = this.users.create(body);

    this.io.emit("user:created", user);

    return new CreatedHttpResponse(user);
  }
}
