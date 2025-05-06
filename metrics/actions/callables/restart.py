import subprocess
from config import Config
from actions import get_service_status
from project_types import RunException
import time

async def assert_restart_run(service: str):
    status = await get_service_status(service)
    if status is None:
        raise RunException('Service not found')

async def restart_service(service: str):
    try:
        time.sleep(5)
        subprocess.run(['docker-compose', '-f', Config.COMPOSE_PATH, 'restart', service], stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
    except subprocess.CalledProcessError:
        return None
