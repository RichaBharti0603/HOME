"""
Consent validation and tracking module.
TR-CON-01: Consent required for AI usage
TR-CON-02: Consent stored with timestamp & purpose
TR-CON-03: Missing consent must block AI request
TR-CON-04: Consent check must occur before sanitizer
"""

import os
import json
from typing import Optional, Dict
from datetime import datetime
from enum import Enum
from pathlib import Path

class ConsentStatus(Enum):
    """Consent status values."""
    GRANTED = "granted"
    DENIED = "denied"
    EXPIRED = "expired"
    NOT_PROVIDED = "not_provided"

class ConsentManager:
    """
    Manages user consent for AI usage.
    TR-CON-01: Consent required for AI usage
    TR-CON-02: Consent stored with timestamp & purpose
    """
    
    def __init__(self, storage_path: Optional[str] = None):
        """
        Initialize consent manager.
        
        Args:
            storage_path: Path to store consent records (defaults to backend/compliance/data/)
        """
        if storage_path is None:
            storage_path = Path(__file__).parent / "data"
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(parents=True, exist_ok=True)
        self.consent_file = self.storage_path / "consents.json"
        self._load_consents()
    
    def _load_consents(self):
        """Load consent records from storage."""
        if self.consent_file.exists():
            try:
                with open(self.consent_file, 'r') as f:
                    self.consents = json.load(f)
            except (json.JSONDecodeError, IOError):
                self.consents = {}
        else:
            self.consents = {}
    
    def _save_consents(self):
        """Save consent records to storage."""
        try:
            with open(self.consent_file, 'w') as f:
                json.dump(self.consents, f, indent=2, default=str)
        except IOError:
            pass  # Log error in production
    
    def grant_consent(self, user_id: str, purpose: str, expires_days: Optional[int] = None) -> bool:
        """
        Grant consent for a user.
        
        Args:
            user_id: User identifier
            purpose: Purpose of consent (e.g., "ai_assistance", "data_processing")
            expires_days: Number of days until consent expires (None = never expires)
            
        Returns:
            True if consent was granted
        """
        expires_at = None
        if expires_days:
            from datetime import timedelta
            expires_at = datetime.utcnow() + timedelta(days=expires_days)
        
        consent_record = {
            'user_id': user_id,
            'purpose': purpose,
            'status': ConsentStatus.GRANTED.value,
            'granted_at': datetime.utcnow().isoformat(),
            'expires_at': expires_at.isoformat() if expires_at else None
        }
        
        # Store consent (keyed by user_id and purpose)
        key = f"{user_id}:{purpose}"
        self.consents[key] = consent_record
        self._save_consents()
        
        return True
    
    def check_consent(self, user_id: str, purpose: str) -> ConsentStatus:
        """
        Check if user has valid consent.
        TR-CON-03: Missing consent must block AI request
        
        Args:
            user_id: User identifier
            purpose: Purpose to check consent for
            
        Returns:
            ConsentStatus indicating consent state
        """
        key = f"{user_id}:{purpose}"
        
        if key not in self.consents:
            return ConsentStatus.NOT_PROVIDED
        
        consent = self.consents[key]
        
        # Check if expired
        if consent.get('expires_at'):
            expires_at = datetime.fromisoformat(consent['expires_at'])
            if datetime.utcnow() > expires_at:
                return ConsentStatus.EXPIRED
        
        # Check status
        status = consent.get('status')
        if status == ConsentStatus.GRANTED.value:
            return ConsentStatus.GRANTED
        elif status == ConsentStatus.DENIED.value:
            return ConsentStatus.DENIED
        
        return ConsentStatus.NOT_PROVIDED
    
    def revoke_consent(self, user_id: str, purpose: str) -> bool:
        """Revoke consent for a user."""
        key = f"{user_id}:{purpose}"
        if key in self.consents:
            self.consents[key]['status'] = ConsentStatus.DENIED.value
            self.consents[key]['revoked_at'] = datetime.utcnow().isoformat()
            self._save_consents()
            return True
        return False
    
    def get_consent_record(self, user_id: str, purpose: str) -> Optional[Dict]:
        """Get consent record for a user and purpose."""
        key = f"{user_id}:{purpose}"
        return self.consents.get(key)
    
    def has_consent(self, user_id: str, purpose: str) -> bool:
        """
        Check if user has valid consent (convenience method).
        TR-CON-04: Consent check must occur before sanitizer
        """
        return self.check_consent(user_id, purpose) == ConsentStatus.GRANTED


