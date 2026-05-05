import time
from loguru import logger
from app.engine.target_manager.manager import TargetManager
from app.engine.network.checker import NetworkChecker
from app.engine.http.checker import HTTPChecker
from app.engine.content.checker import ContentChecker
from app.engine.change_detection.detector import ChangeDetector
from typing import Dict, Any

class MonitoringOrchestrator:
    @classmethod
    def run_full_pipeline(cls, url: str, expected_keyword: str = None) -> Dict[str, Any]:
        """
        Executes the entire monitoring pipeline for a target.
        """
        logger.info(f"Orchestrating pipeline for: {url}")
        
        # 1. Normalize
        normalized_url = TargetManager.normalize_url(url)
        hostname = TargetManager.validate_target(normalized_url).domain + "." + TargetManager.validate_target(normalized_url).tld
        
        # 2. Network Check
        network_stats = NetworkChecker.run_all(hostname)
        
        # 3. HTTP Check
        http_stats = HTTPChecker.run_full_http(normalized_url)
        
        # 4. Content Check
        content_stats = ContentChecker.analyze_page(normalized_url, [expected_keyword] if expected_keyword else [])
        
        # 5. Pipeline Consolidation
        status = "UP" if http_stats["success"] else "DOWN"
        if http_stats["success"] and http_stats["total_time"] > 5000:
            status = "DEGRADED"
            
        result = {
            "url": normalized_url,
            "status": status,
            "network": network_stats,
            "http": http_stats,
            "content": content_stats,
            "timestamp": time.time() if 'time' in globals() else None # Should import time
        }
        
        logger.info(f"Pipeline complete for {url} | Status: {status}")
        return result
