import asyncio
import socketio
from metrics import get_system_metrics
from logs import get_docker_logs

class SocketServer:
    def __init__(self, host='0.0.0.0', port=55000):
        self.sio = socketio.AsyncServer(async_mode='asgi')
        self.app = socketio.ASGIApp(self.sio)
        self.host = host
        self.port = port
        self.subscriptions = set()
        self._register_events()

    def _register_events(self):
        @self.sio.event
        async def connect(sid, environ):
            print(f'Client {sid} connected')

        @self.sio.event
        async def disconnect(sid):
            print(f'Client {sid} disconnected')
            self.subscriptions.discard(sid)

        @self.sio.event
        async def subscribe(sid, data):
            print(f'Client {sid} subscribed with data {data}')
            self.subscriptions.add(sid)

        @self.sio.event
        async def unsubscribe(sid, data):
            print(f'Client {sid} unsubscribed')
            self.subscriptions.discard(sid)

    async def _emit_metrics(self):
        while True:
            metrics = get_system_metrics()
            logs = get_docker_logs()
            for sid in list(self.subscriptions):
                try:
                    await self.sio.emit('metrics', metrics, to=sid)
                    await self.sio.emit('logs', logs, to=sid)
                except (socketio.exceptions.BadNamespaceError, socketio.exceptions.ConnectionError) as e:
                    print(f'Error sending to {sid}: {e}')
                    self.subscriptions.discard(sid)
            await asyncio.sleep(1)

    def start(self):
        import uvicorn
        config = uvicorn.Config(self.app, host=self.host, port=self.port)
        server = uvicorn.Server(config)
        loop = asyncio.get_event_loop()
        loop.create_task(self._emit_metrics())
        loop.run_until_complete(server.serve())
