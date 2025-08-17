#!/usr/bin/env python3
"""
Enhanced FastAPI AI Microservice for Multi-Modal Surveillance Anomaly Detection
Integrates YOLO object detection + TimeSformer temporal analysis with fusion engine
"""

import os
import io
import asyncio
import logging
import time
from typing import Dict, List, Optional, Any
import cv2
import numpy as np
from PIL import Image
import tempfile
import base64
from pathlib import Path

from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field

# Import our enhanced AI models
from models.yolo import YOLODetector
from models.timesformer import TimeSformerDetector  
from models.fusion import FusionEngine

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Enhanced AI Configuration
app = FastAPI(
    title="Enhanced Surveillance AI Microservice",
    description="Multi-modal anomaly detection with YOLO + TimeSformer fusion for production surveillance",
    version="2.0.0"
)

# CORS middleware for Node.js backend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer(auto_error=False)
API_KEY = os.getenv("AI_SERVICE_API_KEY", "dev-key-12345")

# Response Models
# Enhanced Response Models
class PredictionResponse(BaseModel):
    success: bool = Field(..., description="Whether the prediction was successful")
    anomaly_detected: bool = Field(..., description="Whether an anomaly was detected")
    anomaly_type: str = Field(..., description="Type of anomaly detected")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score")
    severity: str = Field(..., description="Severity level (none, low, medium, high, critical)")
    priority: str = Field(..., description="Priority level (low, medium, high)")
    description: str = Field(..., description="Human-readable description")
    processing_time_ms: float = Field(..., description="Processing time in milliseconds")
    model_used: str = Field(..., description="AI model identifier")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")
    bounding_boxes: List[Dict] = Field(default_factory=list, description="Object detection bounding boxes")

class AnnotatedImageResponse(BaseModel):
    success: bool = Field(..., description="Whether annotation was successful")
    image_b64: str = Field(..., description="Base64 encoded annotated image")
    annotations_count: int = Field(..., description="Number of annotations added")
    processing_time_ms: float = Field(..., description="Processing time in milliseconds")

class HealthResponse(BaseModel):
    status: str = Field(..., description="Service health status")
    model_loaded: bool = Field(..., description="Whether AI model is loaded")
    uptime_seconds: float = Field(..., description="Service uptime in seconds")
    version: str = Field(..., description="Service version")

# Enhanced Global Model Management
model_cache = {}
start_time = time.time()

# Initialize AI models
yolo_detector = YOLODetector()
timesformer_detector = TimeSformerDetector()
fusion_engine = FusionEngine()

# Model loading status
models_loaded = {"yolo": False, "timesformer": False, "fusion": True}

def verify_api_key(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify API key for secure communication"""
    if not credentials or credentials.credentials != API_KEY:
        # For development, we'll be lenient - in production, enforce this
        logger.warning("Invalid or missing API key")
    return True

def initialize_models():
    """Initialize all AI models for enhanced surveillance system"""
    global models_loaded
    
    try:
        # Load YOLO detector
        logger.info("Initializing YOLO detector...")
        models_loaded["yolo"] = yolo_detector.load_model()
        
        # Load TimeSformer detector
        logger.info("Initializing TimeSformer detector...")
        models_loaded["timesformer"] = timesformer_detector.load_model()
        
        logger.info(f"Models loaded: {models_loaded}")
        return all(models_loaded.values())
        
    except Exception as e:
        logger.error(f"Failed to initialize models: {e}")
        return False

def extract_video_frames(video_path: str, num_frames: int = 16) -> List[np.ndarray]:
    """
    Extract evenly spaced frames from video for TimeSformer processing
    """
    cap = cv2.VideoCapture(video_path)
    frames = []
    
    try:
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        if total_frames == 0:
            raise ValueError("No frames found in video")
        
        # Calculate frame indices for even spacing
        frame_indices = np.linspace(0, total_frames - 1, num_frames, dtype=int)
        
        for frame_idx in frame_indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
            ret, frame = cap.read()
            if ret:
                # Convert BGR to RGB for model processing
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                frames.append(frame_rgb)
            else:
                logger.warning(f"Failed to read frame at index {frame_idx}")
        
        if len(frames) == 0:
            raise ValueError("No frames could be extracted from video")
        
        # Pad with last frame if we didn't get enough frames
        while len(frames) < num_frames:
            frames.append(frames[-1])
            
        return frames[:num_frames]
    
    finally:
        cap.release()

def process_multimodal_detection(frames: List[np.ndarray], is_video: bool = True) -> Dict[str, Any]:
    """
    Enhanced multi-modal detection using YOLO + TimeSformer + Fusion
    """
    start_time = time.time()
    
    try:
        # Step 1: YOLO Object Detection (spatial analysis)
        yolo_result = {"anomaly_detected": False, "object_types": [], "max_confidence": 0.0, "highest_priority": "low"}
        if frames:
            yolo_detections = yolo_detector.detect_objects(frames[0])  # Use first frame for YOLO
            yolo_result = yolo_detector.get_anomaly_summary(yolo_detections)
        
        # Step 2: TimeSformer Temporal Analysis
        if is_video and len(frames) > 1:
            timesformer_result = timesformer_detector.detect_temporal_anomalies(frames)
        else:
            # Single image analysis
            timesformer_result = timesformer_detector.analyze_single_image(frames[0] if frames else np.zeros((224, 224, 3)))
        
        # Step 3: Fusion Engine combines both results
        frame_metadata = {
            "frame_count": len(frames),
            "resolution": f"{frames[0].shape[1]}x{frames[0].shape[0]}" if frames else "unknown",
            "file_type": "video" if is_video else "image"
        }
        
        fused_result = fusion_engine.fuse_predictions(yolo_result, timesformer_result, frame_metadata)
        
        # Add bounding boxes for frontend visualization
        if frames and yolo_result.get("detections"):
            fused_result["bounding_boxes"] = yolo_result["detections"]
        
        return fused_result
        
    except Exception as e:
        logger.error(f"Multi-modal detection failed: {e}")
        # Fallback to simple simulation
        return {
            "success": True,
            "anomaly_detected": False,
            "anomaly_type": "normal",
            "confidence": 0.2,
            "severity": "none",
            "priority": "low",
            "description": "Fallback detection due to processing error",
            "processing_time_ms": (time.time() - start_time) * 1000,
            "model_used": "Fallback Detection",
            "metadata": {"error": str(e)},
            "bounding_boxes": []
        }

@app.on_event("startup")
async def startup_event():
    """Initialize the enhanced AI service on startup"""
    global start_time
    start_time = time.time()
    logger.info("Starting Enhanced AI Microservice...")
    
    # Initialize all models on startup for faster inference
    initialize_models()
    logger.info("Enhanced AI Microservice ready")

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Enhanced health check endpoint for multi-modal AI service"""
    current_time = time.time()
    uptime = current_time - start_time
    
    # Check if critical models are loaded
    models_available = models_loaded.get("yolo", False) or models_loaded.get("timesformer", False)
    
    return HealthResponse(
        status="healthy" if models_available else "degraded",
        model_loaded=models_available,
        uptime_seconds=uptime,
        version="2.0.0"
    )

@app.post("/predict", response_model=PredictionResponse)
async def predict_anomaly(
    file: UploadFile = File(..., description="Video or image file for enhanced multi-modal anomaly detection"),
    _: bool = Depends(verify_api_key)
):
    """
    Enhanced anomaly detection using YOLO + TimeSformer fusion engine
    """
    try:
        # Validate file type
        if not file.content_type:
            raise HTTPException(status_code=400, detail="File type not specified")
        
        is_video = file.content_type.startswith('video/')
        is_image = file.content_type.startswith('image/')
        
        if not (is_video or is_image):
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file type: {file.content_type}. Only video and image files are supported."
            )
        
        # Save uploaded file temporarily
        file_suffix = Path(file.filename).suffix if file.filename else '.tmp'
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_suffix) as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name
        
        try:
            if is_video:
                # Extract frames from video for multi-modal analysis
                frames = timesformer_detector.extract_video_frames(tmp_file_path, max_frames=16)
                logger.info(f"Extracted {len(frames)} frames from video")
            else:
                # Process single image
                image = cv2.imread(tmp_file_path)
                if image is None:
                    raise ValueError("Could not read image file")
                image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                frames = [image_rgb]
            
            # Run enhanced multi-modal detection
            result = process_multimodal_detection(frames, is_video)
            
            return PredictionResponse(**result)
            
        finally:
            # Clean up temporary file
            try:
                os.unlink(tmp_file_path)
            except OSError:
                pass
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/annotate", response_model=AnnotatedImageResponse)
async def annotate_image(
    file: UploadFile = File(..., description="Image file to annotate with bounding boxes"),
    _: bool = Depends(verify_api_key)
):
    """
    Annotate image with red bounding boxes for detected anomalies
    """
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Only image files are supported for annotation")
        
        # Save uploaded file temporarily
        file_suffix = Path(file.filename).suffix if file.filename else '.jpg'
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_suffix) as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name
        
        try:
            start_time = time.time()
            
            # Read image
            image = cv2.imread(tmp_file_path)
            if image is None:
                raise ValueError("Could not read image file")
            
            # Convert BGR to RGB for processing
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Run YOLO detection for objects to annotate
            detections = yolo_detector.detect_objects(image_rgb)
            
            # Annotate image with red bounding boxes
            annotated_image = yolo_detector.annotate_image(image_rgb, detections)
            
            # Convert back to BGR for encoding
            annotated_bgr = cv2.cvtColor(annotated_image, cv2.COLOR_RGB2BGR)
            
            # Encode to base64
            _, buffer = cv2.imencode('.jpg', annotated_bgr)
            img_b64 = base64.b64encode(buffer).decode('utf-8')
            
            processing_time = (time.time() - start_time) * 1000
            
            return AnnotatedImageResponse(
                success=True,
                image_b64=img_b64,
                annotations_count=len([d for d in detections if d["is_anomaly"]]),
                processing_time_ms=processing_time
            )
            
        finally:
            # Clean up temporary file
            try:
                os.unlink(tmp_file_path)
            except OSError:
                pass
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Annotation error: {e}")
        raise HTTPException(status_code=500, detail=f"Annotation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    
    # Configuration
    host = os.getenv("AI_SERVICE_HOST", "0.0.0.0")
    port = int(os.getenv("AI_SERVICE_PORT", "8001"))
    
    logger.info(f"Starting AI Microservice on {host}:{port}")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )