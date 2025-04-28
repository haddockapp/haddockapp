import subprocess
from config import Config
import json

def parse_docker_status(status):
    lines = status.split('\n')
    containers = []

    for line in lines:
        try:
            line = json.loads(line)
            containers.append(line)
        except Exception:
            pass
    return containers


async def get_docker_status():
    try:
        status = subprocess.check_output(['docker-compose', '-f', Config.COMPOSE_PATH, 'ps', '-a', '--format={{json.}}'], stderr=subprocess.PIPE).decode('utf-8')
        return parse_docker_status(status)
    except subprocess.CalledProcessError:
        return None
