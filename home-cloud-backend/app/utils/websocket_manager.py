from typing import Dict, List
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # active_connections: { monitor_id: [WebSocket, ...] }
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # global_connections: active connections for overall dashboard
        self.global_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket, monitor_id: str = None):
        await websocket.accept()
        if monitor_id:
            if monitor_id not in self.active_connections:
                self.active_connections[monitor_id] = []
            self.active_connections[monitor_id].append(websocket)
        else:
            self.global_connections.append(websocket)

    def disconnect(self, websocket: WebSocket, monitor_id: str = None):
        if monitor_id and monitor_id in self.active_connections:
            self.active_connections[monitor_id].remove(websocket)
        elif websocket in self.global_connections:
            self.global_connections.remove(websocket)

    async def broadcast_status(self, monitor_id: str, status: str, last_response_time: int = None):
        message = {
            "type": "status_update",
            "monitor_id": monitor_id,
            "status": status,
            "last_response_time": last_response_time
        }
        
        # Notify specific monitor listeners
        if monitor_id in self.active_connections:
            for connection in self.active_connections[monitor_id]:
                await connection.send_json(message)
        
        # Notify global dashboard listeners
        for connection in self.global_connections:
            await connection.send_json(message)

manager = ConnectionManager()
