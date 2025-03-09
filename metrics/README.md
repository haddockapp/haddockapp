# Socket.IO System Metrics Server

## Overview
This service is a Socket.IO-based server that periodically emits system metrics to subscribed clients.

## Prerequisites
Ensure you have Python 3.8+ installed. Install the required dependencies using:
```bash
pip install uvicorn python-socketio psutil
```

## Running the Server
To start the Socket.IO server, run:
```bash
python __main__.py
```
By default, the server runs on `http://0.0.0.0:55000`.

## Communication Process
1. **Client Connection**: When a client connects, it can choose to subscribe to system metrics.
2. **Subscription**: Clients send a `subscribe` event to the server.
3. **Metrics Emission**: The server periodically (every second) sends system metrics with server events.
4. **Unsubscription**: Clients can send an `unsubscribe` event to stop receiving updates.
5. **Disconnection Handling**: If a client disconnects, it is automatically unsubscribed from updates.

### Event Summary

#### Client Events

| Event        | Sender  | Description |
|-------------|---------|-------------|
| `subscribe` | Client  | Client requests to receive metrics updates |
| `unsubscribe` | Client | Client stops receiving metrics updates |

#### Server Events

| Event        | Description |
|-------------|-------------|
| `metrics` | Server sends system metrics to subscribed clients |
| `logs` | Server sends log messages to subscribed clients |

## Example Client Communication
A client can subscribe to metrics using the following Socket.IO command:
```javascript
socket.emit('subscribe', {});
```
And handle incoming metrics:
```javascript
socket.on('metrics', (data) => {
    console.log(`CPU Usage: ${data.cpu_usage}%`);
    console.log(`Memory Usage: ${data.memory_usage}%`);
});
```

## License
This project is part of Haddock and released under the same [license](../LICENSE).
