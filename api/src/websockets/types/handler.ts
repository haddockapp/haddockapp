import { Client } from "./client";
import { CronJob } from "cron";

export interface Handler {
  handleSubscribe(client: Client, data: any): Promise<void>;
  handleUnsubscribe(client: Client, data: any): Promise<void>;
  clients: Client[];
  job: CronJob;
}
