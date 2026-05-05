import difflib
from typing import List, Dict, Any, Optional

class ChangeDetector:
    @staticmethod
    def compare_text(old_text: str, new_text: str) -> Dict[str, Any]:
        """
        Compares two text versions and returns a delta.
        """
        if old_text == new_text:
            return {"changed": False, "delta": None}

        # Generate unified diff
        diff = difflib.unified_diff(
            old_text.splitlines(),
            new_text.splitlines(),
            fromfile='previous',
            tofile='current',
            lineterm=''
        )
        
        delta = list(diff)
        return {
            "changed": len(delta) > 0,
            "delta": delta,
            "summary": {
                "added": sum(1 for line in delta if line.startswith('+') and not line.startswith('+++')),
                "removed": sum(1 for line in delta if line.startswith('-') and not line.startswith('---'))
            }
        }

    @staticmethod
    def is_significant_change(delta: List[str], threshold: int = 5) -> bool:
        """
        Determines if a change is significant based on line count.
        """
        added = sum(1 for line in delta if line.startswith('+') and not line.startswith('+++'))
        removed = sum(1 for line in delta if line.startswith('-') and not line.startswith('---'))
        return (added + removed) > threshold
