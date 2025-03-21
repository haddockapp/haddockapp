from collector import get_docker_status

def get_service_status(service: str):
    """
    Check the status of a service
    """
    status = get_docker_status()
    if status is None:
        return None

    for container in status:
        if container['Service'] == service:
            return container['State']

    return None