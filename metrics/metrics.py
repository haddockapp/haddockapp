import psutil

def get_system_metrics():
    return {
        'cpu_usage': {
            'user': psutil.cpu_times().user,
            'system': psutil.cpu_times().system,
            'idle': psutil.cpu_times().idle,
            'percent': psutil.cpu_percent(),
        },
        'memory_usage': {
            'total': psutil.virtual_memory().total,
            'available': psutil.virtual_memory().available,
            'percent': psutil.virtual_memory().percent,
        },
        'disk_usage': {
            'total': psutil.disk_usage('/').total,
            'used': psutil.disk_usage('/').used,
            'free': psutil.disk_usage('/').free,
            'percent': psutil.disk_usage('/').percent,
        },
    }
