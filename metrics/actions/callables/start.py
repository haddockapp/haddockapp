import subprocess
from config import Config
from actions import get_service_status
from project_types import RunException

async def assert_start_run(service: str):
    status = await get_service_status(service)
    if status is None:
        raise RunException('Service not found')
    if status != "exited":
        raise RunException('Service is already running')

async def start_service(service: str):
    try:
        subprocess.run(['docker-compose', '-f', Config.COMPOSE_PATH, 'start', service], stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
    except subprocess.CalledProcessError:
        return None
