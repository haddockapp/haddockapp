import multiprocessing
import uvicorn
import asyncio
from servers.ws import SocketServer
from servers.http import HttpServer
from config import Config

def run_http_server():
    """ Function to run the HTTP server in a separate process. """
    http = HttpServer()
    uvicorn.run(http.app, host="0.0.0.0", port=Config.HTTP_PORT)

def run_ws_server():
    """ Function to run the WebSocket server with async tasks. """
    ws = SocketServer()

    async def start_ws_server():
        config = uvicorn.Config(ws.app, host="0.0.0.0", port=Config.WS_PORT)
        server = uvicorn.Server(config)

        # Start background WebSocket tasks
        asyncio.create_task(ws._emit_metrics())
        asyncio.create_task(ws.collect_data())

        # Run the WebSocket server
        await server.serve()

    # Ensure the event loop runs properly
    asyncio.run(start_ws_server())

class Server:
    def __init__(self, host="0.0.0.0"):
        self.host = host

    def start(self):
        """ Starts both WebSocket and HTTP servers in separate processes. """
        ws_process = multiprocessing.Process(target=run_ws_server)
        http_process = multiprocessing.Process(target=run_http_server)

        ws_process.start()
        http_process.start()

        ws_process.join()
        http_process.join()

if __name__ == "__main__":
    server = Server()
    server.start()
