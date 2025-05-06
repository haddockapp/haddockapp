import asyncio
import logging
from concurrent.futures import ThreadPoolExecutor
from fastapi import FastAPI, HTTPException
from project_types import ActionEnum, RunException
from actions import ActionRunner, restart_service, assert_restart_run, start_service, assert_start_run, stop_service, assert_stop_run

logging.basicConfig(level=logging.INFO)

class HttpServer:
    def __init__(self):
        self.app = FastAPI()
        self.executor = ThreadPoolExecutor(max_workers=3)
        self._register_routes()

        self.runner = ActionRunner()
        self.runner.register_action(ActionEnum.RESTART, restart_service, assert_restart_run)
        self.runner.register_action(ActionEnum.START, start_service, assert_start_run)
        self.runner.register_action(ActionEnum.STOP, stop_service, assert_stop_run)

    def _run_in_thread(self, action, service):
        """Runs the action in a separate thread to avoid blocking the FastAPI event loop."""
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            loop.run_until_complete(self.runner.run(action, service))
        finally:
            loop.close()

    def _register_routes(self):
        @self.app.post('/action')
        async def action(data: dict):
            if 'service' not in data or 'action' not in data:
                raise HTTPException(status_code=400, detail='You must provide a service and action')
            if not isinstance(data['service'], str) or not isinstance(data['action'], str):
                raise HTTPException(status_code=400, detail='Service and action must be strings')
            if data['action'] not in [a.value for a in ActionEnum]:
                raise HTTPException(status_code=400, detail='Invalid action')

            try:
                await self.runner.assert_run(data['action'], data['service'])
            except RunException as e:
                raise HTTPException(status_code=400, detail=str(e))
            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))

            logging.info(f"Starting {data['action']} on {data['service']} in background thread")

            self.executor.submit(self._run_in_thread, data['action'], data['service'])

            return {'status': 'ok'}
