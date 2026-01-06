"""
Data retention policy management.
TR-COM-02: Data must be tagged with retention metadata
"""

import os
from typing import Dict, Optional, List
from datetime import datetime, timedelta
from enum import Enum
from dataclasses import dataclass, asdict

class RetentionPolicy(Enum):
    """Retention policy types."""
    IMMEDIATE = "immediate"  # Delete immediately
    SHORT_TERM = "short_term"  # 30 days
    MEDIUM_TERM = "medium_term"  # 90 days
    LONG_TERM = "long_term"  # 365 days
    INDEFINITE = "indefinite"  # Never delete (with justification)

@dataclass
class RetentionMetadata:
    """Metadata for data retention."""
    policy: RetentionPolicy
    created_at: datetime
    expires_at: Optional[datetime]
    data_type: str
    user_id: Optional[str] = None
    justification: Optional[str] = None  # Required for INDEFINITE
    
    def to_dict(self) -> Dict:
        """Convert to dictionary."""
        data = asdict(self)
        data['policy'] = self.policy.value
        data['created_at'] = self.created_at.isoformat()
        if self.expires_at:
            data['expires_at'] = self.expires_at.isoformat()
        return data
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'RetentionMetadata':
        """Create from dictionary."""
        data = data.copy()
        data['policy'] = RetentionPolicy(data['policy'])
        data['created_at'] = datetime.fromisoformat(data['created_at'])
        if data.get('expires_at'):
            data['expires_at'] = datetime.fromisoformat(data['expires_at'])
        return cls(**data)

class RetentionManager:
    """
    Manages data retention policies.
    TR-COM-02: Data must be tagged with retention metadata
    """
    
    def __init__(self):
        """Initialize retention manager."""
        self.policy_days = {
            RetentionPolicy.IMMEDIATE: 0,
            RetentionPolicy.SHORT_TERM: int(os.getenv('RETENTION_SHORT_DAYS', '30')),
            RetentionPolicy.MEDIUM_TERM: int(os.getenv('RETENTION_MEDIUM_DAYS', '90')),
            RetentionPolicy.LONG_TERM: int(os.getenv('RETENTION_LONG_DAYS', '365')),
            RetentionPolicy.INDEFINITE: None
        }
    
    def create_retention_metadata(
        self,
        policy: RetentionPolicy,
        data_type: str,
        user_id: Optional[str] = None,
        justification: Optional[str] = None
    ) -> RetentionMetadata:
        """
        Create retention metadata for data.
        
        Args:
            policy: Retention policy to apply
            data_type: Type of data (e.g., "conversation", "audit_log", "user_profile")
            user_id: User ID if applicable
            justification: Required justification for INDEFINITE policy
            
        Returns:
            RetentionMetadata object
        """
        if policy == RetentionPolicy.INDEFINITE and not justification:
            raise ValueError("Justification required for INDEFINITE retention policy")
        
        created_at = datetime.utcnow()
        expires_at = None
        
        if policy != RetentionPolicy.INDEFINITE:
            days = self.policy_days.get(policy, 365)
            # Use >= 0 to handle IMMEDIATE policy (0 days) correctly
            # IMMEDIATE should set expires_at to created_at (immediately expired)
            if days >= 0:
                expires_at = created_at + timedelta(days=days)
        
        return RetentionMetadata(
            policy=policy,
            created_at=created_at,
            expires_at=expires_at,
            data_type=data_type,
            user_id=user_id,
            justification=justification
        )
    
    def is_expired(self, metadata: RetentionMetadata) -> bool:
        """Check if data retention period has expired."""
        if metadata.policy == RetentionPolicy.INDEFINITE:
            return False
        
        # Handle IMMEDIATE policy (0 days) - always expired
        if metadata.policy == RetentionPolicy.IMMEDIATE:
            return True
        
        if metadata.expires_at is None:
            return False
        
        return datetime.utcnow() > metadata.expires_at
    
    def get_expired_items(self, items: List[Dict]) -> List[Dict]:
        """
        Filter items that have expired retention periods.
        
        Args:
            items: List of items with 'retention_metadata' field
            
        Returns:
            List of expired items
        """
        expired = []
        for item in items:
            if 'retention_metadata' in item:
                try:
                    metadata = RetentionMetadata.from_dict(item['retention_metadata'])
                    if self.is_expired(metadata):
                        expired.append(item)
                except (KeyError, ValueError):
                    continue
        return expired
    
    def should_delete(self, metadata: RetentionMetadata) -> bool:
        """
        Determine if data should be deleted based on retention policy.
        
        Args:
            metadata: Retention metadata
            
        Returns:
            True if data should be deleted
        """
        if metadata.policy == RetentionPolicy.INDEFINITE:
            return False
        
        return self.is_expired(metadata)


