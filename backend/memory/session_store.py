# backend/memory/session_store.py

from typing import List, Dict

# Simple in-memory session store
_sessions: Dict[str, List[Dict[str, str]]] = {}


def get_session_context(session_id: str) -> List[Dict[str, str]]:
    """
    Returns the conversation history for a given session.
    Each message is a dict: {'role': 'user'/'assistant', 'message': str}
    """
    return _sessions.get(session_id, [])


def append_to_session(session_id: str, role: str, message: str):
    """
    Appends a message to the session.
    """
    if session_id not in _sessions:
        _sessions[session_id] = []
    _sessions[session_id].append({"role": role, "message": message})
