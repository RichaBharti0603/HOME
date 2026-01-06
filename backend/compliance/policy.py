"""
Policy management module.
TR-COM-01: Policy rules must be environment-driven
TR-COM-03: Policy violations must raise compliance events
TR-COM-04: Compliance logic must be backend-only (no frontend trust)
"""

import os
from typing import Dict, List, Optional
from enum import Enum
from datetime import datetime

class PolicyViolation(Exception):
    """Exception raised when a policy violation is detected."""
    
    def __init__(self, policy_name: str, violation_type: str, details: str):
        self.policy_name = policy_name
        self.violation_type = violation_type
        self.details = details
        self.timestamp = datetime.utcnow()
        super().__init__(f"Policy violation: {policy_name} - {violation_type}")

class PolicyType(Enum):
    """Types of policies."""
    DATA_RETENTION = "data_retention"
    ACCESS_CONTROL = "access_control"
    PRIVACY = "privacy"
    SECURITY = "security"
    COMPLIANCE = "compliance"

class PolicyManager:
    """
    Manages compliance policies.
    Policies are environment-driven (TR-COM-01).
    """
    
    def __init__(self):
        self.policies: Dict[str, Dict] = {}
        self._load_policies_from_env()
    
    def _load_policies_from_env(self):
        """Load policies from environment variables."""
        # TR-COM-01: Environment-driven policies
        
        # Data retention policies
        default_retention_days = int(os.getenv('COMPLIANCE_RETENTION_DAYS', '365'))
        self.policies['data_retention'] = {
            'type': PolicyType.DATA_RETENTION,
            'default_days': default_retention_days,
            'enabled': os.getenv('COMPLIANCE_RETENTION_ENABLED', 'true').lower() == 'true'
        }
        
        # Privacy policies
        self.policies['privacy'] = {
            'type': PolicyType.PRIVACY,
            'require_consent': os.getenv('COMPLIANCE_REQUIRE_CONSENT', 'true').lower() == 'true',
            'sanitize_prompts': os.getenv('COMPLIANCE_SANITIZE_PROMPTS', 'true').lower() == 'true',
            'enabled': True
        }
        
        # Access control policies
        self.policies['access_control'] = {
            'type': PolicyType.ACCESS_CONTROL,
            'require_authentication': os.getenv('COMPLIANCE_REQUIRE_AUTH', 'false').lower() == 'true',
            'enabled': True
        }
        
        # Security policies
        self.policies['security'] = {
            'type': PolicyType.SECURITY,
            'audit_all_requests': os.getenv('COMPLIANCE_AUDIT_ALL', 'true').lower() == 'true',
            'enabled': True
        }
    
    def check_policy(self, policy_name: str, context: Dict) -> bool:
        """
        Check if an action complies with a policy.
        
        Args:
            policy_name: Name of the policy to check
            context: Context information for policy evaluation
            
        Returns:
            True if compliant, False otherwise
            
        Raises:
            PolicyViolation: If policy is violated
        """
        if policy_name not in self.policies:
            return True  # Unknown policies don't block
        
        policy = self.policies[policy_name]
        
        if not policy.get('enabled', True):
            return True  # Disabled policies don't block
        
        # Check specific policy types
        if policy['type'] == PolicyType.PRIVACY:
            if policy.get('require_consent') and not context.get('has_consent'):
                raise PolicyViolation(
                    policy_name,
                    'missing_consent',
                    'Consent required for this operation'
                )
        
        if policy['type'] == PolicyType.DATA_RETENTION:
            if not policy.get('enabled'):
                return True
        
        return True
    
    def get_policy(self, policy_name: str) -> Optional[Dict]:
        """Get a specific policy configuration."""
        return self.policies.get(policy_name)
    
    def update_policy(self, policy_name: str, updates: Dict):
        """
        Update a policy configuration.
        Note: In production, this should reload from environment or secure config store.
        """
        if policy_name in self.policies:
            self.policies[policy_name].update(updates)
    
    def get_all_policies(self) -> Dict[str, Dict]:
        """Get all policies (for reporting)."""
        return self.policies.copy()


