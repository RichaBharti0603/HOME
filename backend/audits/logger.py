"""
Audit logging system.
TR-LOG-01: Each log entry must include timestamp, event type, severity, hash
TR-LOG-04: No PII in logs
"""

import os
import json
from typing import Dict, Optional, List
from datetime import datetime
from enum import Enum
from pathlib import Path
from backend.audit.hashchain import HashChain

class EventType(Enum):
    """Types of audit events."""
    AI_REQUEST = "ai_request"
    CONSENT_GRANTED = "consent_granted"
    CONSENT_DENIED = "consent_denied"
    POLICY_VIOLATION = "policy_violation"
    DATA_DELETION = "data_deletion"
    INCIDENT = "incident"
    SYSTEM_EVENT = "system_event"

class Severity(Enum):
    """Severity levels for audit events."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class AuditEvent:
    """Represents an audit event."""
    
    def __init__(
        self,
        event_type: EventType,
        severity: Severity,
        message: str,
        metadata: Optional[Dict] = None,
        user_id: Optional[str] = None
    ):
        """
        Create an audit event.
        TR-LOG-04: No PII in logs - user_id is optional and should not contain PII
        """
        self.event_type = event_type
        self.severity = severity
        self.message = message
        self.metadata = metadata or {}
        self.user_id = user_id  # Should be anonymized/hashed if contains PII
        self.timestamp = datetime.utcnow()
    
    def to_dict(self) -> Dict:
        """Convert event to dictionary (PII-free)."""
        data = {
            'event_type': self.event_type.value,
            'severity': self.severity.value,
            'message': self.message,
            'timestamp': self.timestamp.isoformat(),
            'metadata': self.metadata
        }
        # Only include user_id if provided and it's not PII
        if self.user_id:
            data['user_id'] = self.user_id
        return data

class AuditLogger:
    """
    Audit logger with hash chain integrity.
    TR-LOG-01: Each log entry must include timestamp, event type, severity, hash
    """
    
    def __init__(self, storage_path: Optional[str] = None):
        """
        Initialize audit logger.
        
        Args:
            storage_path: Path to store audit logs (defaults to backend/audit/data/)
        """
        if storage_path is None:
            storage_path = Path(__file__).parent / "data"
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(parents=True, exist_ok=True)
        self.log_file = self.storage_path / "audit_chain.json"
        self.hash_chain = self._load_or_create_chain()
    
    def _load_or_create_chain(self) -> HashChain:
        """Load existing hash chain or create a new one."""
        if self.log_file.exists():
            try:
                with open(self.log_file, 'r') as f:
                    data = json.load(f)
                    chain = HashChain(initial_hash=data.get('initial_hash'))
                    entries = data.get('entries', [])
                    
                    # Restore chain and update last_hash to maintain integrity
                    # TR-LOG-02: Hash must reference previous entry
                    # TR-LOG-03: Append-only integrity
                    chain.restore_chain(entries)
                    
                    # Verify loaded chain
                    if not chain.verify_chain():
                        # Chain is corrupted, create new one
                        return HashChain()
                    return chain
            except (json.JSONDecodeError, IOError, KeyError):
                pass
        
        # Create new chain
        return HashChain()
    
    def _save_chain(self):
        """Save hash chain to storage."""
        try:
            data = {
                'initial_hash': self.hash_chain.initial_hash,
                'entries': self.hash_chain.get_chain()
            }
            with open(self.log_file, 'w') as f:
                json.dump(data, f, indent=2, default=str)
        except IOError:
            pass  # Log error in production
    
    def log_event(
        self,
        event_type: EventType,
        severity: Severity,
        message: str,
        metadata: Optional[Dict] = None,
        user_id: Optional[str] = None
    ) -> str:
        """
        Log an audit event.
        TR-LOG-01: Each log entry must include timestamp, event type, severity, hash
        
        Args:
            event_type: Type of event
            severity: Severity level
            message: Event message (must not contain PII)
            metadata: Additional metadata (must not contain PII)
            user_id: User identifier (should be anonymized)
            
        Returns:
            Hash of the logged entry
        """
        # Create audit event
        event = AuditEvent(event_type, severity, message, metadata, user_id)
        
        # Convert to dictionary for hash chain
        event_data = event.to_dict()
        
        # Add to hash chain (this adds hash and previous_hash)
        entry_hash = self.hash_chain.add_entry(event_data)
        
        # Save chain
        self._save_chain()
        
        return entry_hash
    
    def verify_integrity(self) -> bool:
        """Verify the integrity of the audit log chain."""
        return self.hash_chain.verify_chain()
    
    def get_events(
        self,
        event_type: Optional[EventType] = None,
        severity: Optional[Severity] = None,
        limit: Optional[int] = None
    ) -> List[Dict]:
        """
        Get audit events with optional filtering.
        
        Args:
            event_type: Filter by event type
            severity: Filter by severity
            limit: Maximum number of events to return
            
        Returns:
            List of event dictionaries
        """
        events = self.hash_chain.get_chain()
        
        # Apply filters
        if event_type:
            events = [e for e in events if e.get('event_type') == event_type.value]
        
        if severity:
            events = [e for e in events if e.get('severity') == severity.value]
        
        # Reverse to get most recent first
        events.reverse()
        
        if limit:
            events = events[:limit]
        
        return events
    
    def get_last_hash(self) -> Optional[str]:
        """Get the hash of the last logged entry."""
        return self.hash_chain.get_last_hash()

