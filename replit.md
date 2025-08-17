# Overview

This is a Privacy-Preserving Federated Learning (PPFL) surveillance system designed for distributed anomaly detection across edge devices. The system enables machine learning training on sensitive surveillance data while maintaining privacy through federated learning, differential privacy, and secure aggregation. It features a modern React dashboard for real-time monitoring of edge devices, anomaly detection, and federated learning rounds with cybersecurity-themed UI components.

**NEW**: Enhanced with multi-modal AI detection system featuring YOLOv10 object detection + TimeSformer temporal analysis with fusion engine. Provides production-ready surveillance anomaly detection with bounding box visualization, severity classification, and real-time processing capabilities. **LATEST**: Added comprehensive Anomaly Analysis interface with enhanced detection features showcase.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built with a modern React 18 stack using TypeScript and component-based design:

- **UI Framework**: shadcn/ui components built on Radix UI primitives for accessibility and design consistency
- **Styling**: Tailwind CSS with a custom cybersecurity-themed design system supporting dark/light mode with glass morphism effects
- **State Management**: TanStack Query for server state management with real-time caching and optimistic updates
- **Real-time Communication**: Custom WebSocket hook for live data streaming from federated learning rounds and anomaly detection
- **Routing**: Wouter for lightweight client-side routing with support for multiple pages (Dashboard, Timeline, Devices, Training, Privacy, Settings)
- **Build System**: Vite for fast development builds and optimized production bundles with TypeScript support

## Backend Architecture
The server follows a modular Express.js architecture with TypeScript:

- **API Layer**: RESTful endpoints for CRUD operations on surveillance data, federated learning rounds, edge devices, and privacy metrics
- **WebSocket Server**: Real-time bidirectional communication for live dashboard updates and client coordination
- **Service Layer**: Specialized services for anomaly detection (TensorFlow.js + TimeSformer AI), federated learning orchestration, and client simulation
- **AI Microservice Integration**: Python FastAPI service for TimeSformer-based anomaly detection with automatic fallback to local detection
- **Storage Abstraction**: Database layer using Drizzle ORM with PostgreSQL for type-safe operations
- **File Processing**: Multer integration for handling image/video uploads up to 50MB with format validation

## AI Microservice Architecture
Separate Python FastAPI service for advanced anomaly detection:

- **TimeSformer Model**: Pretrained video transformer model fine-tuned on UCF-Crime dataset for real-time crime detection
- **Frame Processing**: Automatic video frame extraction and preprocessing for model inference
- **Health Monitoring**: Service health checks with automatic failover to local detection
- **Secure Communication**: API key-based authentication between Node.js and Python services
- **Real-time Integration**: Seamless integration with existing WebSocket system for live anomaly alerts

## Database Design
PostgreSQL database with Drizzle ORM providing comprehensive data modeling:

- **Devices**: Edge device registry with capabilities, status monitoring, and federated learning participation tracking
- **FL Rounds**: Training round management with algorithm selection (FedAvg, FedProx, SCAFFOLD), aggregation methods, and convergence metrics
- **Anomalies**: Security incident records with confidence scores, severity classifications, and metadata
- **Privacy Budgets**: Differential privacy budget tracking with epsilon/delta monitoring across training rounds
- **Users**: Authentication and authorization for system access
- **Model Registry**: Versioned model storage with deployment tracking

## Privacy-Preserving Features
The system implements enterprise-grade privacy protection mechanisms:

- **Differential Privacy**: Configurable epsilon budgets with noise injection during model training to protect individual data points
- **Secure Aggregation**: Cryptographic protocols for combining model updates without revealing individual contributions
- **Local Training**: Edge devices perform local model training on sensitive surveillance data without centralized data sharing
- **Privacy Budget Monitoring**: Real-time tracking and alerting of privacy expenditure across federated learning rounds

## Federated Learning Architecture
Multi-algorithm federated learning system with robust aggregation:

- **Algorithm Support**: FedAvg, FedProx, and SCAFFOLD algorithms for different data distribution scenarios
- **Aggregation Methods**: Weighted averaging, secure aggregation protocols for model parameter combination
- **Client Simulation**: Realistic simulation of 20+ edge devices with varying capabilities and network conditions
- **Round Management**: 20-round training cycles with convergence monitoring and accuracy tracking

# External Dependencies

## Core Technologies
- **React 18**: Frontend framework with hooks and component composition
- **TypeScript**: Type safety across frontend and backend
- **Express.js**: Node.js web framework for API server
- **Vite**: Build tool and development server
- **TailwindCSS**: Utility-first CSS framework

## Database & ORM
- **PostgreSQL**: Primary database via Neon serverless platform
- **Drizzle ORM**: Type-safe database operations and schema management
- **Drizzle Kit**: Database migration and schema management tools

## UI Components & Styling
- **Radix UI**: Unstyled, accessible UI primitives
- **shadcn/ui**: Pre-built component library based on Radix
- **Lucide React**: Icon library
- **TailwindCSS**: Styling with custom cyber security theme

## State Management & Networking
- **TanStack Query**: Server state management and caching
- **WebSocket**: Real-time communication between client and server
- **Zod**: Runtime type validation and schema parsing

## File Processing & AI
- **Multer**: File upload handling middleware
- **TensorFlow.js**: Client-side and server-side machine learning
- **Sharp**: Image processing library

## Development & Build Tools
- **TypeScript**: Type checking and compilation
- **PostCSS**: CSS processing with Autoprefixer
- **ESBuild**: Fast JavaScript bundler for production builds
- **Replit Integration**: Development environment plugins and error handling