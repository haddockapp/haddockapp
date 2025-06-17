import subprocess
from config import Config

async def get_docker_logs():
    try:
        return subprocess.check_output(['docker', 'compose', '-f', Config.COMPOSE_PATH, 'logs', '--tail=1000'], stderr=subprocess.PIPE).decode('utf-8')
    except subprocess.CalledProcessError:
        return None
