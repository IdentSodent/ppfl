#!/usr/bin/env python3
"""
Script to start the AI microservice on Replit
"""

import os
import sys
import subprocess

def main():
    # Set environment variables
    os.environ['AI_SERVICE_HOST'] = '0.0.0.0'
    os.environ['AI_SERVICE_PORT'] = '8001'
    os.environ['AI_SERVICE_API_KEY'] = 'dev-key-12345'
    
    print("Starting AI Microservice...")
    print(f"Service will be available at: http://localhost:8001")
    print(f"Health check: http://localhost:8001/health")
    print(f"API Docs: http://localhost:8001/docs")
    
    # Change to ai_service directory
    ai_service_dir = os.path.join(os.path.dirname(__file__), 'ai_service')
    os.chdir(ai_service_dir)
    
    # Start the FastAPI service
    try:
        subprocess.run([
            sys.executable, '-m', 'uvicorn', 
            'main:app',
            '--host', '0.0.0.0',
            '--port', '8001',
            '--reload'
        ], check=True)
    except KeyboardInterrupt:
        print("\nAI Service stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"Failed to start AI service: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())