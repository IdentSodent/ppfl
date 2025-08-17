#!/usr/bin/env python3
"""
Fusion Engine for Combining YOLO + TimeSformer Predictions
Provides robust anomaly classification through multi-modal analysis
"""

import numpy as np
import logging
from typing import Dict, List, Tuple, Optional, Any
import time

logger = logging.getLogger(__name__)

class FusionEngine:
    """
    Fusion engine that combines YOLO object detection with TimeSformer temporal analysis
    for robust surveillance anomaly detection
    """
    
    def __init__(self):
        """Initialize fusion engine with confidence weighting parameters"""
        
        # Confidence weighting for different detection types
        self.weights = {
            "yolo_spatial": 0.6,      # Object detection weight
            "timesformer_temporal": 0.4  # Temporal analysis weight
        }
        
        # Severity escalation rules
        self.severity_matrix = {
            ("none", "none"): "none",
            ("none", "low"): "low",
            ("none", "medium"): "low",
            ("none", "high"): "medium",
            ("none", "critical"): "high",
            ("low", "none"): "low",
            ("low", "low"): "low",
            ("low", "medium"): "medium",
            ("low", "high"): "high",
            ("low", "critical"): "critical",
            ("medium", "none"): "low",
            ("medium", "low"): "medium",
            ("medium", "medium"): "medium",
            ("medium", "high"): "high",
            ("medium", "critical"): "critical",
            ("high", "none"): "medium",
            ("high", "low"): "high",
            ("high", "medium"): "high",
            ("high", "high"): "high",
            ("high", "critical"): "critical",
            ("critical", "none"): "high",
            ("critical", "low"): "critical",
            ("critical", "medium"): "critical",
            ("critical", "high"): "critical",
            ("critical", "critical"): "critical"
        }
        
        # Priority escalation rules
        self.priority_matrix = {
            ("low", "low"): "low",
            ("low", "medium"): "medium",
            ("low", "high"): "medium",
            ("medium", "low"): "medium",
            ("medium", "medium"): "medium",
            ("medium", "high"): "high",
            ("high", "low"): "medium",
            ("high", "medium"): "high",
            ("high", "high"): "high"
        }
        
        # Critical object-activity combinations
        self.critical_combinations = {
            ("person", "weapon_detection"): {"severity": "critical", "priority": "high"},
            ("person", "fighting"): {"severity": "high", "priority": "high"},
            ("knife", "suspicious_activity"): {"severity": "critical", "priority": "high"},
            ("person", "intrusion"): {"severity": "high", "priority": "high"},
            ("car", "suspicious_activity"): {"severity": "medium", "priority": "medium"},
            ("person", "theft"): {"severity": "high", "priority": "high"}
        }
    
    def fuse_predictions(self, yolo_result: Dict, timesformer_result: Dict, 
                        frame_metadata: Optional[Dict] = None) -> Dict:
        """
        Fuse YOLO and TimeSformer predictions into comprehensive anomaly assessment
        
        Args:
            yolo_result: YOLO object detection results
            timesformer_result: TimeSformer temporal analysis results
            frame_metadata: Additional frame/video metadata
            
        Returns:
            Fused prediction with comprehensive anomaly assessment
        """
        start_time = time.time()
        
        try:
            # Extract key information from both models
            yolo_anomaly = yolo_result.get("anomaly_detected", False)
            yolo_objects = yolo_result.get("object_types", [])
            yolo_confidence = yolo_result.get("max_confidence", 0.0)
            yolo_priority = yolo_result.get("highest_priority", "low")
            
            timesformer_anomaly = timesformer_result.get("anomaly_detected", False)
            timesformer_type = timesformer_result.get("anomaly_type", "normal")
            timesformer_confidence = timesformer_result.get("confidence", 0.0)
            timesformer_severity = timesformer_result.get("severity", "none")
            timesformer_priority = timesformer_result.get("priority", "low")
            
            # Calculate fused confidence score
            fused_confidence = self._calculate_fused_confidence(
                yolo_confidence, timesformer_confidence, yolo_anomaly, timesformer_anomaly
            )
            
            # Determine if overall anomaly is detected
            overall_anomaly = yolo_anomaly or timesformer_anomaly
            
            # Check for critical object-activity combinations
            critical_combo = self._check_critical_combinations(yolo_objects, timesformer_type)
            
            if critical_combo:
                overall_anomaly = True
                fused_confidence = max(fused_confidence, 0.85)
            
            # Determine fused anomaly type
            anomaly_type = self._determine_anomaly_type(
                yolo_objects, timesformer_type, overall_anomaly
            )
            
            # Calculate fused severity and priority
            yolo_severity = self._infer_yolo_severity(yolo_objects, yolo_priority)
            fused_severity = self._fuse_severity(yolo_severity, timesformer_severity)
            fused_priority = self._fuse_priority(yolo_priority, timesformer_priority)
            
            # Override with critical combination if applicable
            if critical_combo:
                fused_severity = critical_combo["severity"]
                fused_priority = critical_combo["priority"]
            
            # Generate comprehensive description
            description = self._generate_fusion_description(
                yolo_result, timesformer_result, anomaly_type, fused_severity
            )
            
            # Compile fusion metadata
            fusion_metadata = {
                "yolo_detection": {
                    "anomaly_detected": yolo_anomaly,
                    "objects": yolo_objects,
                    "confidence": yolo_confidence,
                    "detections_count": yolo_result.get("anomaly_count", 0)
                },
                "timesformer_analysis": {
                    "anomaly_detected": timesformer_anomaly,
                    "anomaly_type": timesformer_type,
                    "confidence": timesformer_confidence,
                    "temporal_features": timesformer_result.get("temporal_features", {})
                },
                "fusion_weights": self.weights,
                "critical_combination": critical_combo is not None,
                "processing_method": "multi_modal_fusion"
            }
            
            # Add frame metadata if provided
            if frame_metadata:
                fusion_metadata.update(frame_metadata)
            
            processing_time = (time.time() - start_time) * 1000
            
            # Compile final result
            fused_result = {
                "success": True,
                "anomaly_detected": overall_anomaly,
                "anomaly_type": anomaly_type,
                "confidence": fused_confidence,
                "severity": fused_severity,
                "priority": fused_priority,
                "description": description,
                "processing_time_ms": processing_time,
                "model_used": "YOLO + TimeSformer Fusion Engine",
                "metadata": fusion_metadata
            }
            
            logger.info(f"Fusion completed: {anomaly_type} (confidence: {fused_confidence:.3f})")
            return fused_result
            
        except Exception as e:
            logger.error(f"Fusion engine error: {e}")
            return self._get_fallback_result()
    
    def _calculate_fused_confidence(self, yolo_conf: float, timesformer_conf: float,
                                   yolo_anomaly: bool, timesformer_anomaly: bool) -> float:
        """Calculate weighted confidence score from both models"""
        
        # If neither detects anomaly, return low confidence
        if not yolo_anomaly and not timesformer_anomaly:
            return min(yolo_conf, timesformer_conf) * 0.5
        
        # If both detect anomaly, use weighted average with bonus
        if yolo_anomaly and timesformer_anomaly:
            weighted_avg = (yolo_conf * self.weights["yolo_spatial"] + 
                           timesformer_conf * self.weights["timesformer_temporal"])
            return min(0.95, weighted_avg * 1.2)  # Bonus for agreement
        
        # If only one detects anomaly, reduce confidence
        if yolo_anomaly:
            return yolo_conf * 0.7
        else:
            return timesformer_conf * 0.6
    
    def _check_critical_combinations(self, objects: List[str], activity: str) -> Optional[Dict]:
        """Check for critical object-activity combinations"""
        for obj in objects:
            combo = (obj, activity)
            if combo in self.critical_combinations:
                return self.critical_combinations[combo]
        return None
    
    def _determine_anomaly_type(self, objects: List[str], temporal_type: str, 
                               has_anomaly: bool) -> str:
        """Determine primary anomaly type from multi-modal analysis"""
        if not has_anomaly:
            return "normal"
        
        # Priority order for anomaly types
        if temporal_type == "weapon_detection" or "knife" in objects:
            return "weapon_detected"
        elif temporal_type == "fighting":
            return "violent_behavior"
        elif temporal_type == "theft":
            return "theft_detected"
        elif temporal_type == "intrusion":
            return "unauthorized_access"
        elif "person" in objects and temporal_type == "suspicious_activity":
            return "suspicious_person_behavior"
        elif temporal_type == "running":
            return "rapid_movement"
        elif temporal_type == "loitering":
            return "loitering_detected"
        elif objects:
            return f"suspicious_object_{objects[0]}"
        else:
            return temporal_type
    
    def _infer_yolo_severity(self, objects: List[str], priority: str) -> str:
        """Infer severity level from YOLO detections"""
        if "knife" in objects:
            return "critical"
        elif "person" in objects and priority == "high":
            return "high"
        elif priority == "high":
            return "medium"
        elif priority == "medium":
            return "low"
        else:
            return "none"
    
    def _fuse_severity(self, yolo_severity: str, timesformer_severity: str) -> str:
        """Fuse severity levels from both models"""
        combo = (yolo_severity, timesformer_severity)
        return self.severity_matrix.get(combo, "medium")
    
    def _fuse_priority(self, yolo_priority: str, timesformer_priority: str) -> str:
        """Fuse priority levels from both models"""
        combo = (yolo_priority, timesformer_priority)
        return self.priority_matrix.get(combo, "medium")
    
    def _generate_fusion_description(self, yolo_result: Dict, timesformer_result: Dict,
                                   anomaly_type: str, severity: str) -> str:
        """Generate comprehensive description of fused detection"""
        
        yolo_objects = yolo_result.get("object_types", [])
        timesformer_type = timesformer_result.get("anomaly_type", "normal")
        yolo_conf = yolo_result.get("max_confidence", 0)
        timesformer_conf = timesformer_result.get("confidence", 0)
        
        if anomaly_type == "normal":
            return "Normal surveillance activity detected across spatial and temporal analysis"
        
        # Build description components
        spatial_desc = ""
        if yolo_objects:
            spatial_desc = f"Objects detected: {', '.join(yolo_objects)} (conf: {yolo_conf:.2f})"
        
        temporal_desc = ""
        if timesformer_type != "normal":
            temporal_desc = f"Activity: {timesformer_type} (conf: {timesformer_conf:.2f})"
        
        # Combine descriptions
        if spatial_desc and temporal_desc:
            description = f"Multi-modal anomaly: {spatial_desc}; {temporal_desc}"
        elif spatial_desc:
            description = f"Spatial anomaly: {spatial_desc}"
        elif temporal_desc:
            description = f"Temporal anomaly: {temporal_desc}"
        else:
            description = f"Anomaly detected: {anomaly_type}"
        
        # Add severity context
        if severity in ["high", "critical"]:
            description += f" [SEVERITY: {severity.upper()}]"
        
        return description
    
    def _get_fallback_result(self) -> Dict:
        """Return fallback result in case of fusion engine failure"""
        return {
            "success": False,
            "anomaly_detected": False,
            "anomaly_type": "processing_error",
            "confidence": 0.0,
            "severity": "none",
            "priority": "low",
            "description": "Fusion engine processing failed",
            "processing_time_ms": 0,
            "model_used": "Fusion Engine (Error)",
            "metadata": {"error": "fusion_processing_failed"}
        }