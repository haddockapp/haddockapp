import subprocess
from config import Config
from actions import get_service_status
from project_types import RunException

async def assert_stop_run(service: str):
    status = await get_service_status(service)
    if status is None:
        raise RunException('Service not found')
    if status != "running":
        raise RunException('Service is not running')

async def stop_service(service: str):
    try:
        subprocess.run(['docker-compose', '-f', Config.COMPOSE_PATH, 'stop', service], stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
    except subprocess.CalledProcessError:
        return None
