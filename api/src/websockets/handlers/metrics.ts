import { Client } from '../types/client';
import { Handler } from '../types/handler';

export class MetricsHandler implements Handler {
  clients: Client[] = [];

  async handleSubscribe(client: Client, data: any): Promise<void> {
    if (this.clients.length === 0) {
      console.log('Need start metrics');
    }
    this.clients.push(client);
    client.socket.emit('message', 'subscribed to metrics');
  }

  async handleUnsubscribe(client: Client, data: any): Promise<void> {
    this.clients = this.clients.filter((c) => c.userId !== client.userId);
    if (this.clients.length === 0) {
      console.log('Need stop metrics');
    }
    client.socket.emit('message', 'unsubscribed from metrics');
  }
}
