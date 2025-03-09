import subprocess

def get_docker_logs():
    try:
        return subprocess.check_output(['docker-compose', 'logs', '--tail=1000']).decode('utf-8')
    except subprocess.CalledProcessError:
        return None
