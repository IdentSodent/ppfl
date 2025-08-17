#!/usr/bin/env python3
"""
YOLOv10 Object Detection Module
Handles spatial object detection for surveillance anomalies
"""

import cv2
import numpy as np
import logging
from typing import List, Dict, Tuple, Optional
import time
import random

logger = logging.getLogger(__name__)

class YOLODetector:
    """YOLOv10-based object detector for surveillance anomalies"""
    
    def __init__(self, model_path: str = "yolov8n.pt"):
        """Initialize YOLO detector with pretrained weights"""
        self.model_path = model_path
        self.model = None
        self.confidence_threshold = 0.3
        self.iou_threshold = 0.5
        
        # Anomaly-relevant object classes (COCO dataset indices)
        self.anomaly_classes = {
            0: "person",           # People detection for behavior analysis
            1: "bicycle",          # Unauthorized vehicles
            2: "car",              # Vehicle monitoring
            3: "motorcycle",       # Security vehicles
            5: "bus",              # Large vehicles
            7: "truck",            # Cargo monitoring
            15: "cat",             # Animal intrusion
            16: "dog",             # Animal intrusion
            24: "handbag",         # Suspicious objects
            26: "suitcase",        # Suspicious luggage
            28: "sports ball",     # Thrown objects
            39: "bottle",          # Potential weapons
            43: "knife",           # Weapons (if trained)
            44: "spoon",           # Potential weapons
            45: "bowl",            # Containers
            73: "laptop",          # Valuable items
            74: "mouse",           # Electronics
            75: "remote",          # Electronics
            76: "keyboard",        # Electronics
            77: "cell phone"       # Personal items
        }
        
        # High-priority anomaly objects (weapons, tools)
        self.high_priority_objects = ["knife", "person", "car", "motorcycle", "handbag", "suitcase"]
        
    def load_model(self) -> bool:
        """Load YOLO model (simulated for demo)"""
        try:
            logger.info(f"Loading YOLO model from {self.model_path}")
            # Simulate model loading for demo
            self.model = "simulated_yolo_model"
            logger.info("YOLO model loaded successfully (simulated)")
            return True
        except Exception as e:
            logger.error(f"Failed to load YOLO model: {e}")
            return False
            
    def detect_objects(self, image: np.ndarray) -> List[Dict]:
        """
        Detect objects in image using YOLO
        
        Returns:
            List of detections with format:
            {
                "class_name": str,
                "confidence": float,
                "bbox": [x1, y1, x2, y2],
                "is_anomaly": bool,
                "priority": str
            }
        """
        if self.model is None:
            if not self.load_model():
                return []
                
        try:
            start_time = time.time()
            
            # Simulate YOLO inference for demo
            detections = self._simulate_yolo_detections(image)
            
            # In production, this would be:
            # results = self.model(image, conf=self.confidence_threshold, iou=self.iou_threshold)
            
            processing_time = (time.time() - start_time) * 1000
            logger.info(f"YOLO detected {len(detections)} objects in {processing_time:.1f}ms")
            
            return detections
            
        except Exception as e:
            logger.error(f"YOLO detection failed: {e}")
            return []
    
    def annotate_image(self, image: np.ndarray, detections: List[Dict]) -> np.ndarray:
        """
        Draw bounding boxes and labels on image for anomaly objects
        
        Args:
            image: Input image
            detections: List of detection dictionaries
            
        Returns:
            Annotated image with red bounding boxes for anomalies
        """
        annotated = image.copy()
        
        for detection in detections:
            if not detection["is_anomaly"]:
                continue
                
            bbox = detection["bbox"]
            class_name = detection["class_name"]
            confidence = detection["confidence"]
            priority = detection["priority"]
            
            # Color coding: Red for high priority, Orange for medium
            color = (0, 0, 255) if priority == "high" else (0, 165, 255)  # BGR format
            thickness = 3 if priority == "high" else 2
            
            # Draw bounding box
            cv2.rectangle(annotated, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, thickness)
            
            # Create label with class name and confidence
            label = f"{class_name}: {confidence:.2f}"
            label_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)[0]
            
            # Draw label background
            cv2.rectangle(annotated, 
                         (bbox[0], bbox[1] - label_size[1] - 10),
                         (bbox[0] + label_size[0], bbox[1]),
                         color, -1)
            
            # Draw label text
            cv2.putText(annotated, label,
                       (bbox[0], bbox[1] - 5),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
        return annotated
    
    def get_anomaly_summary(self, detections: List[Dict]) -> Dict:
        """
        Generate summary of detected anomalies
        
        Returns:
            Summary statistics and priority information
        """
        anomaly_detections = [d for d in detections if d["is_anomaly"]]
        
        if not anomaly_detections:
            return {
                "anomaly_detected": False,
                "anomaly_count": 0,
                "highest_priority": "none",
                "object_types": [],
                "confidence_scores": []
            }
        
        # Calculate summary statistics
        object_types = [d["class_name"] for d in anomaly_detections]
        confidence_scores = [d["confidence"] for d in anomaly_detections]
        priorities = [d["priority"] for d in anomaly_detections]
        
        highest_priority = "high" if "high" in priorities else "medium"
        
        return {
            "anomaly_detected": True,
            "anomaly_count": len(anomaly_detections),
            "highest_priority": highest_priority,
            "object_types": list(set(object_types)),
            "confidence_scores": confidence_scores,
            "max_confidence": max(confidence_scores),
            "avg_confidence": sum(confidence_scores) / len(confidence_scores),
            "detections": anomaly_detections
        }
    
    def _simulate_yolo_detections(self, image: np.ndarray) -> List[Dict]:
        """Simulate YOLO detections for demo purposes"""
        height, width = image.shape[:2]
        
        # Generate 0-3 random detections
        num_detections = random.randint(0, 3)
        detections = []
        
        for _ in range(num_detections):
            # Random object class
            class_names = ["person", "car", "handbag", "knife", "bottle"]
            class_name = random.choice(class_names)
            class_id = hash(class_name) % 100
            
            # Random bounding box
            x1 = random.randint(0, width // 2)
            y1 = random.randint(0, height // 2)
            x2 = random.randint(x1 + 50, min(width, x1 + 200))
            y2 = random.randint(y1 + 50, min(height, y1 + 200))
            
            # Random confidence
            confidence = random.uniform(0.3, 0.9)
            
            # Check if anomaly
            is_anomaly = class_id in self.anomaly_classes or class_name in self.high_priority_objects
            priority = "high" if class_name in self.high_priority_objects else "medium"
            
            detection = {
                "class_name": class_name,
                "confidence": confidence,
                "bbox": [x1, y1, x2, y2],
                "is_anomaly": is_anomaly,
                "priority": priority,
                "class_id": class_id
            }
            
            detections.append(detection)
        
        return detections