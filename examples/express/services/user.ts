import "reflect-metadata";

import { injectable } from "inversify";

export interface User {
  id: number;
  name: string;
  email: string;
}

@injectable()
export class UserService {
  private readonly users: User[] = [
    { id: 1, name: "Rick Sanchez", email: "rick@example.com" },
    { id: 2, name: "Morty Smith", email: "morty@example.com" },
  ];

  private nextId = 3;

  list(): User[] {
    return [...this.users];
  }

  get(id: number): User | undefined {
    return this.users.find((user) => user.id === id);
  }

  create(data: Omit<User, "id">): User {
    const user: User = { id: this.nextId++, ...data };
    this.users.push(user);
    return user;
  }

  total(): number {
    return this.users.length;
  }
}
