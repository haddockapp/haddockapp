import asyncio
import socketio
from config import Config
from collector import collector
from project_types import CollectorEnum

from collector import Collector, get_system_metrics, get_docker_logs, get_docker_status
from project_types import CollectorEnum


class SocketServer:
    def __init__(self, host='0.0.0.0', port=Config.PORT):
        self.sio = socketio.AsyncServer(async_mode='asgi')
        self.app = socketio.ASGIApp(self.sio)
        self.host = host
        self.port = port
        self.subscriptions = {}

        self.collector = Collector()
        self.collector.register_collector(CollectorEnum.METRICS, get_system_metrics, 3)
        self.collector.register_collector(CollectorEnum.LOGS, get_docker_logs, 3)
        self.collector.register_collector(CollectorEnum.STATUS, get_docker_status, 3)

        self._register_events()

    def _register_events(self):
        @self.sio.event
        async def connect(sid, environ):
            print(f'Client {sid} connected')

        @self.sio.event
        async def disconnect(sid):
            print(f'Client {sid} disconnected')
            self.subscriptions.pop(sid, None)

        @self.sio.event
        async def subscribe(sid, data):
            if not set(data).issubset(set([c.value for c in CollectorEnum])):
                return
            print(f'Client {sid} subscribed to {data}')
            self.subscriptions[sid] = set(data)

        @self.sio.event
        async def unsubscribe(sid, data):
            print(f'Client {sid} unsubscribed')
            self.subscriptions.pop(sid, None)
    
    def get_data_to_collect(self):
        to_collect = set()
        for _, subscriptions in self.subscriptions.items():
            to_collect.update(subscriptions)
        return to_collect

    async def collect_data(self):
        while True:
            to_collect = self.get_data_to_collect()
            await self.collector.run(to_collect)
            await asyncio.sleep(3)
    
    async def send_data(self):
        for sid, subscriptions in self.subscriptions.items():
            try:
                for key in subscriptions:
                    value = self.collector.get_collected(key)
                    if value is not None:
                        await self.sio.emit(key, value, to=sid)
            except (socketio.exceptions.BadNamespaceError, socketio.exceptions.ConnectionError) as e:
                print(f'Error sending to {sid}: {e}')
                self.subscriptions.pop(sid, None)
        

    async def _emit_metrics(self):
        while True:
            await self.send_data()
            await asyncio.sleep(3)

    def start(self):
        import uvicorn
        config = uvicorn.Config(self.app, host=self.host, port=self.port)
        server = uvicorn.Server(config)
        loop = asyncio.get_event_loop()
        loop.create_task(self._emit_metrics())
        loop.create_task(self.collect_data())
        loop.run_until_complete(server.serve())
