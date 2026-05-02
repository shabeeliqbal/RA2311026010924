# Campus Notification System - Design Document

## 1. Overview
The **Campus Notification System** is designed to solve the problem of student inbox fatigue caused by high volumes of campus notifications. The core feature is a **Priority Inbox** that algorithmically sorts and limits the displayed notifications to the "Top N" most critical items, ensuring students see vital updates first.

## 2. Priority Logic & Algorithm
The sorting algorithm is based on predefined notification weights, evaluating the `type` attribute of each incoming notification constraint.

**Weight Mapping:**
1. **Placement**: `3` (Highest Priority)
2. **Result**: `2` (High Priority)
3. **Event**: `1` (Normal Priority)

**Process Flow:**
1. Retrieve raw JSON notification structures from the remote evaluation service.
2. Sort the array descendingly based on the assigned integer weight of the notification `type`.
3. Truncate the sorted array to return only the `Top N` results requested by the client (default is often 10).

## 3. System Architecture & Project Structure
The workspace is split into three distinct modules:

### A. Frontend (`notification_app_fe/`)
A React single-page application initialized via Vite. 
- Fetches and visualizes the priority inbox.
- Represents priority categories through distinct UI visual cues (e.g., Green for Placements, Yellow for Results, Blue for Events).
- Allows exactly specifying the top `N` notifications via user controls.

### B. Backend Data Fetcher (`notification_app_be/`)
A Python-based standalone client pipeline (`priority_inbox.py`) that acts as a secure connector to the remote API.
- **Authentication**: Performs `POST` requests to `/evaluation-service/auth` using pre-registered credentials (`clientId`, `clientSecret`, etc.) to obtain a Bearer authorization token.
- **Data Ingestion**: Pings `/evaluation-service/notifications` with the securely acquired token.
- **Processing**: Sorts the payload in real-time utilizing Python's built-in `sorted` functionality and outputs standard JSON arrays for downstream consumption.

### C. Logging Middleware (`logging_middleware/`)
A customized Node.js/Express.js compatible logging mechanism (`logger.js`).
- Hooks into incoming API requests and traces client IPs, request methods, dynamic endpoints, HTTP output statuses, and overall execution times (in milliseconds).
- Persists log output automatically to a local `server.log` file for long-term telemetry audits.

## 4. External API Integration Map
The system interacts seamlessly with three main endpoints on the remote evaluation server (`http://20.207.122.201`):
1. **POST `/register`**: Issues a new `clientId` and `clientSecret` bound to the student's Roll Number and institutional email.
2. **POST `/auth`**: Validates the issued client credentials and returns a secure Authentication Session Token.
3. **GET `/notifications`**: Requires the Auth Token header; returns the real-time JSON notification corpus (utilizing properties such as `massage` and `timestamp`).