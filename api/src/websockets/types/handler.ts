import { Client } from "./client";

export interface Handler {
  handleSubscribe(client: Client, data: any): Promise<void>;
  handleUnsubscribe(client: Client, data: any): Promise<void>;
  clients: Client[];
}
