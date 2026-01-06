"""
Incident severity classification system.
TR-INC-01: Incidents categorized as Low/Medium/High/Critical
TR-INC-02: Severity based on service + data risk
TR-INC-03: Critical incidents flagged for compliance report
TR-INC-04: Classification must be deterministic (rule-based)
"""

from typing import Dict, Optional
from enum import Enum
from datetime import datetime

class IncidentSeverity(Enum):
    """Incident severity levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class ServiceType(Enum):
    """Types of services."""
    PAYMENT = "payment"
    AUTHENTICATION = "authentication"
    DATABASE = "database"
    API = "api"
    MONITORING = "monitoring"
    AI_SERVICE = "ai_service"
    GENERAL = "general"

class DataRiskLevel(Enum):
    """Data risk levels."""
    NONE = "none"  # No sensitive data
    LOW = "low"  # Public data
    MEDIUM = "medium"  # Internal data
    HIGH = "high"  # Personal data (PII)
    CRITICAL = "critical"  # Financial, health, or highly sensitive data

class IncidentClassifier:
    """
    Classifies incidents based on service type and data risk.
    TR-INC-04: Classification must be deterministic (rule-based)
    """
    
    # Service criticality mapping
    SERVICE_CRITICALITY = {
        ServiceType.PAYMENT: 4,  # Most critical
        ServiceType.AUTHENTICATION: 4,
        ServiceType.DATABASE: 4,
        ServiceType.API: 3,
        ServiceType.AI_SERVICE: 2,
        ServiceType.MONITORING: 2,
        ServiceType.GENERAL: 1
    }
    
    # Data risk severity mapping
    DATA_RISK_SEVERITY = {
        DataRiskLevel.NONE: 0,
        DataRiskLevel.LOW: 1,
        DataRiskLevel.MEDIUM: 2,
        DataRiskLevel.HIGH: 3,
        DataRiskLevel.CRITICAL: 4
    }
    
    def classify(
        self,
        service_type: ServiceType,
        data_risk: DataRiskLevel,
        impact_description: Optional[str] = None
    ) -> IncidentSeverity:
        """
        Classify incident severity.
        TR-INC-02: Severity based on service + data risk
        
        Args:
            service_type: Type of service affected
            data_risk: Risk level of data involved
            impact_description: Optional description of impact
            
        Returns:
            IncidentSeverity level
        """
        # Get service criticality score
        service_score = self.SERVICE_CRITICALITY.get(service_type, 1)
        
        # Get data risk score
        data_score = self.DATA_RISK_SEVERITY.get(data_risk, 0)
        
        # Calculate combined score
        combined_score = service_score + data_score
        
        # Determine severity based on score
        # TR-INC-04: Deterministic rule-based classification
        if combined_score >= 7:
            return IncidentSeverity.CRITICAL
        elif combined_score >= 5:
            return IncidentSeverity.HIGH
        elif combined_score >= 3:
            return IncidentSeverity.MEDIUM
        else:
            return IncidentSeverity.LOW
    
    def is_critical(self, severity: IncidentSeverity) -> bool:
        """
        Check if incident is critical.
        TR-INC-03: Critical incidents flagged for compliance report
        """
        return severity == IncidentSeverity.CRITICAL
    
    def create_incident_record(
        self,
        service_type: ServiceType,
        data_risk: DataRiskLevel,
        description: str,
        metadata: Optional[Dict] = None
    ) -> Dict:
        """
        Create a complete incident record.
        
        Args:
            service_type: Type of service affected
            data_risk: Risk level of data
            description: Incident description
            metadata: Additional metadata
            
        Returns:
            Incident record dictionary
        """
        severity = self.classify(service_type, data_risk, description)
        
        record = {
            'incident_id': f"INC-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
            'timestamp': datetime.utcnow().isoformat(),
            'service_type': service_type.value,
            'data_risk': data_risk.value,
            'severity': severity.value,
            'description': description,
            'is_critical': self.is_critical(severity),
            'metadata': metadata or {}
        }
        
        return record

