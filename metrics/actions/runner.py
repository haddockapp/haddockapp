import time
from typing import Callable
from project_types import ActionEnum, RunException

class ActionRunner:
    def __init__(self):
        self.mutex = False
        self.actions = []

    def register_action(self, name: ActionEnum, action: Callable, can_run: Callable = None):
        self.actions.append((name, action, can_run))

    def is_running(self):
        return self.mutex

    async def assert_run(self, name: str, service: str):
        if self.mutex:
            raise RunException('An action is already running')
        for action_name, _, can_run in self.actions:
            if action_name.value != name:
                continue
            if can_run is None:
                return
            return await can_run(service)
        raise RunException('Action not found')

    async def run(self, name: str, service: str):
        if self.mutex:
            return
        self.mutex = True
        for action_name, action, _ in self.actions:
            if action_name.value == name:
                await action(service)
                break
        self.mutex = False
