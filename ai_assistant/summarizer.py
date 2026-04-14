from typing import List, Dict

def summarize_monitors(monitors: List[Dict]) -> str:
    """
    Create a human-readable summary of monitor statuses.
    """
    up = [m for m in monitors if m["status"] == "UP"]
    down = [m for m in monitors if m["status"] == "DOWN"]

    summary = f"Total Monitors: {len(monitors)}\n"
    summary += f"UP: {len(up)} | DOWN: {len(down)}\n"

    if down:
        summary += "Down Monitors:\n"
        for m in down:
            summary += f"- {m['project_name']} ({m['url']})\n"
    
    return summary