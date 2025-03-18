import time
from typing import Callable
from project_types import CollectorEnum

class CallableCollector:
    def __init__(self, name: CollectorEnum, collector: Callable, interval: int):
        self.name = name
        self.collector = collector
        self.interval = interval
        self.last_run = 0

    async def run(self):
        if time.time() - self.last_run >= self.interval:
            result = await self.collector()
            self.last_run = time.time()
            return result

class Collector:
    def __init__(self):
        self.store = {}
        self.collectors = []

    def register_collector(self, name: CollectorEnum, collector: Callable, interval: int):
        self.store[name.value] = None
        self.collectors.append(CallableCollector(name, collector, interval))

    async def run(self, names: set = None):
        for collector in self.collectors:
            if names is not None and collector.name.value not in names:
                continue
            result = await collector.run()
            if result is not None:
                self.store[collector.name.value] = result

    def get_collected(self, name: CollectorEnum):
        return self.store[name]
