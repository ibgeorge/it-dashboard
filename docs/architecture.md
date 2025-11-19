# IT Dashboard - Architecture Documentation

**Version:** 0.1.0  
**Last Updated:** 2025-11-19  
**Status:** Initial Design Phase

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Principles](#architecture-principles)
3. [High-Level Architecture](#high-level-architecture)
4. [Component Design](#component-design)
5. [Data Architecture](#data-architecture)
6. [Security Architecture](#security-architecture)
7. [Integration Architecture](#integration-architecture)
8. [Deployment Architecture](#deployment-architecture)
9. [Scalability & Performance](#scalability--performance)
10. [Technology Stack](#technology-stack)
11. [Design Decisions](#design-decisions)

---

## 1. System Overview

### Purpose
The IT Dashboard is an enterprise-grade web application designed to aggregate, visualize, and analyze IT operational metrics and KPIs in real-time. It serves as a centralized platform for IT management, monitoring, and decision support.

### Scope
- Real-time monitoring of IT infrastructure and services
- Historical data analysis and trend visualization
- Customizable dashboards and reporting
- Multi-tenant support with role-based access control
- Integration with various data sources (databases, APIs, log files)
- Alerting and notification system

### Stakeholders
- **IT Management:** Strategic oversight and decision-making
- **System Administrators:** Operational monitoring and troubleshooting
- **Support Teams:** Incident tracking and SLA management
- **Executives:** High-level KPI visibility

---

## 2. Architecture Principles

### Core Philosophy
The system is built on four non-negotiable pillars, prioritized in this order:

1. **Security First**
   - Security by design, not as an afterthought
   - Defense in depth strategy
   - Zero-trust security model
   - Least privilege access control
   - Comprehensive audit logging

2. **Functional Excellence**
   - Robust error handling
   - Data integrity and consistency
   - Comprehensive validation
   - Graceful degradation
   - High availability

3. **Scalability**
   - Horizontal and vertical scaling capabilities
   - Modular, loosely-coupled components
   - Stateless application design
   - Efficient resource utilization
   - Cloud-ready architecture

4. **User Experience**
   - Intuitive interface design
   - Responsive performance (<2s page load)
   - Mobile-friendly responsive design
   - Accessibility compliance (WCAG 2.1 AA)
   - Consistent user experience

### Design Patterns
- **Layered Architecture:** Clear separation of concerns
- **Repository Pattern:** Abstract data access
- **Service Layer Pattern:** Business logic encapsulation
- **Dependency Injection:** Loose coupling
- **Circuit Breaker:** Fault tolerance
- **CQRS (Light):** Separate read/write optimization

---

## 3. High-Level Architecture

### System Context Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        External Users                        │
│     (Browsers, Mobile Devices, API Clients)                 │
└────────────────┬────────────────────────────────────────────┘
                 │ HTTPS
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                     Load Balancer / Reverse Proxy            │
│                         (Optional)                           │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    IT Dashboard Application                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Presentation Layer                       │  │
│  │  (REST API, WebSocket, Static Resources)             │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                          │
│  ┌────────────────▼─────────────────────────────────────┐  │
│  │              Service Layer                            │  │
│  │  (Business Logic, Validation, Orchestration)         │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                          │
│  ┌────────────────▼─────────────────────────────────────┐  │
│  │              Data Access Layer                        │  │
│  │  (Repositories, ORM, Query Builders)                 │  │
│  └────────────────┬─────────────────────────────────────┘  │
└───────────────────┼──────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
  ┌──────────┐ ┌──────────┐ ┌──────────┐
  │   SQL    │ │ External │ │  Cache   │
  │  Server  │ │   APIs   │ │  (Redis) │
  │ Database │ │          │ │          │
  └──────────┘ └──────────┘ └──────────┘
```

### Layer Responsibilities

#### 1. Presentation Layer
- **REST API:** JSON-based RESTful endpoints
- **WebSocket:** Real-time data streaming
- **Static Content:** HTML, CSS, JavaScript, images
- **Authentication:** Token-based auth (JWT)
- **Input Validation:** Request sanitization

#### 2. Service Layer
- **Business Logic:** Core application functionality
- **Orchestration:** Coordinate multiple operations
- **Validation:** Business rule enforcement
- **Transaction Management:** ACID compliance
- **Error Handling:** Centralized exception handling

#### 3. Data Access Layer
- **Repository Pattern:** Abstract data operations
- **ORM:** Entity mapping (JPA/Hibernate)
- **Query Optimization:** Efficient data retrieval
- **Connection Pooling:** Resource management
- **Caching:** Reduce database load

---

## 4. Component Design

### Application Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Components                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐ │
│  │  Authentication │  │  Dashboard     │  │  Reporting   │ │
│  │  Service        │  │  Service       │  │  Service     │ │
│  └────────────────┘  └────────────────┘  └──────────────┘ │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐ │
│  │  Data          │  │  Alert &       │  │  User        │ │
│  │  Collection    │  │  Notification  │  │  Management  │ │
│  │  Service       │  │  Service       │  │  Service     │ │
│  └────────────────┘  └────────────────┘  └──────────────┘ │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐ │
│  │  Export        │  │  Audit         │  │  Configuration│ │
│  │  Service       │  │  Logging       │  │  Service     │ │
│  └────────────────┘  └────────────────┘  └──────────────┘ │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐                    │
│  │  Scheduled     │  │  Real-Time     │                    │
│  │  Job Service   │  │  Data Service  │                    │
│  └────────────────┘  └────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

### Component Descriptions

#### Authentication Service
**Responsibilities:**
- User authentication and authorization
- Session management
- Token generation and validation (JWT)
- Role-based access control (RBAC)
- Integration with Windows AD / OAuth providers

**Technologies:**
- Spring Security
- JWT (JSON Web Tokens)
- BCrypt password hashing

#### Dashboard Service
**Responsibilities:**
- Dashboard configuration management
- Widget rendering and layout
- Data aggregation from multiple sources
- Caching frequently accessed data
- Real-time data updates

**Key Operations:**
- Create/update/delete dashboards
- Add/remove/configure widgets
- Apply filters and date ranges
- Share dashboards between users

#### Reporting Service
**Responsibilities:**
- Generate scheduled and on-demand reports
- Multiple export formats (PDF, Excel, CSV)
- Report template management
- Historical data analysis
- Trend calculation and visualization

**Technologies:**
- Apache POI (Excel generation)
- iText (PDF generation)
- Spring Batch (scheduled reports)

#### Data Collection Service
**Responsibilities:**
- Connect to multiple data sources
- Extract and transform data (ETL)
- Data validation and cleansing
- Store in central database
- Handle connection failures gracefully

**Data Sources:**
- SQL Server databases
- REST APIs
- Log files
- CSV/Excel files
- Message queues

#### Alert & Notification Service
**Responsibilities:**
- Monitor metrics against thresholds
- Trigger alerts based on conditions
- Send notifications via multiple channels
- Alert escalation and acknowledgment
- Alert history and audit trail

**Notification Channels:**
- Email (SMTP)
- SMS (Twilio integration)
- In-app notifications
- Webhooks

#### User Management Service
**Responsibilities:**
- User profile management
- User preferences and settings
- Access control and permissions
- User activity tracking
- User group management

#### Export Service
**Responsibilities:**
- Export dashboards to various formats
- Generate snapshots for archival
- Bulk data export
- Schedule automated exports

#### Audit Logging Service
**Responsibilities:**
- Log all user actions
- Track data modifications
- Security event logging
- Compliance reporting
- Log retention and archival

#### Configuration Service
**Responsibilities:**
- Application configuration management
- Feature flags
- Environment-specific settings
- Dynamic configuration updates
- Configuration versioning

#### Scheduled Job Service
**Responsibilities:**
- Execute recurring tasks
- Data refresh jobs
- Report generation jobs
- Cleanup and maintenance tasks
- Job monitoring and alerting

**Technologies:**
- Spring Scheduler / Quartz

#### Real-Time Data Service
**Responsibilities:**
- WebSocket connection management
- Push real-time updates to clients
- Handle client subscriptions
- Broadcast notifications
- Connection state management

**Technologies:**
- Spring WebSocket
- STOMP protocol

---

## 5. Data Architecture

### Database Schema Overview

```
Core Tables:
├── Users
│   └── user_id (PK), username, email, password_hash, created_at
├── Roles
│   └── role_id (PK), role_name, permissions
├── UserRoles
│   └── user_id (FK), role_id (FK)
│
├── Dashboards
│   └── dashboard_id (PK), user_id (FK), name, layout_config, created_at
├── Widgets
│   └── widget_id (PK), dashboard_id (FK), widget_type, config, position
├── DataSources
│   └── source_id (PK), source_type, connection_string, credentials
│
├── Metrics
│   └── metric_id (PK), source_id (FK), metric_name, value, timestamp
├── Alerts
│   └── alert_id (PK), metric_id (FK), condition, threshold, recipients
├── AlertHistory
│   └── history_id (PK), alert_id (FK), triggered_at, resolved_at, severity
│
├── Reports
│   └── report_id (PK), user_id (FK), name, template, schedule
├── ReportExecutions
│   └── execution_id (PK), report_id (FK), executed_at, status, output_path
│
└── AuditLog
    └── log_id (PK), user_id (FK), action, entity_type, entity_id, timestamp
```

### Data Model Design Decisions

#### Normalization
- **3NF (Third Normal Form):** Core transactional tables
- **Denormalization:** Metrics and reporting tables for performance
- **Separate Read Models:** CQRS pattern for heavy queries

#### Data Types
- **IDs:** BIGINT or UUID for global uniqueness
- **Timestamps:** DATETIME2 with UTC timezone
- **JSON:** NVARCHAR(MAX) for flexible configuration storage
- **Decimals:** DECIMAL(18,4) for precise metric values

#### Indexing Strategy
```sql
-- Primary keys: Clustered indexes
-- Foreign keys: Non-clustered indexes
-- Frequently queried columns: Non-clustered indexes
-- Timestamp columns: Non-clustered indexes for range queries

-- Example indexes
CREATE INDEX IX_Metrics_Timestamp ON Metrics(timestamp DESC);
CREATE INDEX IX_Metrics_SourceId_Timestamp ON Metrics(source_id, timestamp DESC);
CREATE INDEX IX_AuditLog_UserId_Timestamp ON AuditLog(user_id, timestamp DESC);
```

#### Data Retention
- **Metrics:** 90 days detailed, 2 years aggregated, 5 years summarized
- **Audit Logs:** 7 years for compliance
- **User Sessions:** 30 days
- **Reports:** Indefinite (configurable)

### Data Flow

```
External Source → Data Collection → Validation → Transform → Store → Cache
                                                                    ↓
User Request → API → Service Layer → Repository → Database
                                   ↓                     ↑
                                 Cache ←─────────────────┘
                                   ↓
                             Response → Client
```

---

## 6. Security Architecture

### Security Layers

#### 1. Network Security
- **HTTPS Only:** TLS 1.2+ encryption
- **Firewall Rules:** Restrict access to necessary ports
- **DDoS Protection:** Rate limiting and throttling
- **IP Whitelisting:** Optional for sensitive endpoints

#### 2. Application Security

##### Authentication
```
User Login Request
    ↓
Validate Credentials (AD / Database)
    ↓
Generate JWT Token (signed with secret)
    ↓
Return Token to Client
    ↓
Client includes token in Authorization header
    ↓
Server validates token signature and expiration
    ↓
Extract user identity and permissions
    ↓
Process request with authorized context
```

##### Authorization
- **Role-Based Access Control (RBAC)**
  - Admin: Full system access
  - Manager: Department-level access
  - User: Personal dashboards only
  - Viewer: Read-only access

- **Resource-Level Permissions**
  - Owner: Full control
  - Editor: Modify but not delete
  - Viewer: Read-only

##### Input Validation
```java
// All inputs validated at controller layer
@PostMapping("/api/dashboards")
public ResponseEntity<?> createDashboard(@Valid @RequestBody DashboardRequest request) {
    // @Valid triggers Bean Validation
    // Sanitize HTML input
    // Validate data types
    // Check length constraints
    // Prevent SQL injection
    // Prevent XSS attacks
}
```

#### 3. Data Security

##### Encryption
- **At Rest:** Database Transparent Data Encryption (TDE)
- **In Transit:** TLS 1.2+
- **Passwords:** BCrypt hashing with salt
- **Secrets:** Environment variables / Key Vault

##### SQL Injection Prevention
```java
// Always use parameterized queries
String query = "SELECT * FROM Users WHERE username = ?";
PreparedStatement stmt = connection.prepareStatement(query);
stmt.setString(1, username);  // Safe from injection
```

##### XSS Prevention
- Output encoding for user-generated content
- Content Security Policy (CSP) headers
- HTTP-only cookies
- CSRF tokens for state-changing operations

#### 4. Audit & Compliance
- Log all authentication attempts
- Log all data modifications
- Log all administrative actions
- Retain logs per compliance requirements
- Tamper-evident logging

### Security Checklist

Before each deployment:
- [ ] No hardcoded credentials in code
- [ ] All secrets in environment variables
- [ ] Database connections use least-privilege accounts
- [ ] Input validation on all endpoints
- [ ] Output encoding for user content
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Dependencies scanned for vulnerabilities
- [ ] Audit logging enabled
- [ ] Error messages don't leak sensitive info

---

## 7. Integration Architecture

### Integration Patterns

#### 1. Database Integration
```
IT Dashboard → JDBC → SQL Server
    ↓
Read metrics, configuration, user data
Write audit logs, calculated metrics
```

#### 2. REST API Integration
```
IT Dashboard → HTTP Client → External API
    ↓
Request data (JSON/XML)
    ↓
Parse and transform
    ↓
Store in local database
```

#### 3. File-Based Integration
```
External System → File Share / S3
    ↓
IT Dashboard monitors directory
    ↓
Parse files (CSV, Excel, Log)
    ↓
Import data
    ↓
Archive processed files
```

#### 4. Message Queue Integration (Future)
```
External System → Message Queue (RabbitMQ/Kafka)
    ↓
IT Dashboard subscribes to topics
    ↓
Process messages
    ↓
Update database
```

### Integration Security
- API keys stored securely
- OAuth 2.0 for third-party APIs
- Encrypted file transfers (SFTP)
- Certificate-based authentication
- Request signing for webhooks

### Error Handling
- Retry logic with exponential backoff
- Circuit breaker pattern
- Fallback data sources
- Graceful degradation
- Alert on repeated failures

---

## 8. Deployment Architecture

### Deployment Options

#### Option 1: Traditional Server Deployment
```
Windows Server / Linux Server
    ↓
Java Runtime (JRE 17+)
    ↓
Application JAR
    ↓
SQL Server (on same or separate server)
```

**Pros:** Simple, full control, no cloud costs  
**Cons:** Manual scaling, manual updates, single point of failure

#### Option 2: Containerized Deployment (Docker)
```
Docker Host
    ├── IT Dashboard Container (Java app)
    ├── SQL Server Container (or external DB)
    └── Redis Container (caching)
```

**Pros:** Consistent environments, easy scaling, isolated  
**Cons:** Requires Docker knowledge, resource overhead

#### Option 3: Cloud Deployment (Azure/AWS)
```
Load Balancer
    ├── App Service / EC2 Instance 1
    ├── App Service / EC2 Instance 2
    └── App Service / EC2 Instance 3
         ↓
Azure SQL / RDS SQL Server
         ↓
Redis Cache / ElastiCache
```

**Pros:** Auto-scaling, high availability, managed services  
**Cons:** Cloud costs, vendor lock-in, complexity

### Recommended Production Architecture

```
                  ┌──────────────┐
                  │  Cloudflare  │ (CDN + DDoS Protection)
                  │  or similar  │
                  └──────┬───────┘
                         │
                  ┌──────▼───────┐
                  │ Load Balancer│
                  └──────┬───────┘
                         │
       ┌─────────────────┼─────────────────┐
       │                 │                 │
  ┌────▼─────┐     ┌────▼─────┐     ┌────▼─────┐
  │ App      │     │ App      │     │ App      │
  │ Server 1 │     │ Server 2 │     │ Server 3 │
  └────┬─────┘     └────┬─────┘     └────┬─────┘
       │                 │                 │
       └─────────────────┼─────────────────┘
                         │
                  ┌──────▼───────┐
                  │  SQL Server  │
                  │  (Primary)   │
                  └──────┬───────┘
                         │
                  ┌──────▼───────┐
                  │  SQL Server  │
                  │ (Replica)    │
                  └──────────────┘
```

### Environment Strategy

#### Development
- Local workstations
- Shared development database
- Mock external services
- Debug logging enabled

#### Staging
- Production-like environment
- Anonymized production data
- Real external services (test mode)
- Performance testing

#### Production
- High availability setup
- Automated backups
- Monitoring and alerting
- Minimal logging (INFO level)

---

## 9. Scalability & Performance

### Horizontal Scaling
- Stateless application design
- Session data in Redis (not in-memory)
- Load balancer distributes requests
- Auto-scaling based on CPU/memory

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Optimize JVM heap size
- Database server upgrades

### Database Scalability

#### Read Scaling
- Read replicas for reporting queries
- Caching layer (Redis) for hot data
- Materialized views for complex queries
- Connection pooling

#### Write Scaling
- Batch inserts for metrics
- Asynchronous writes for non-critical data
- Partitioning large tables by date
- Archive old data to separate tables

### Caching Strategy

```
Request → Check Cache
             ├─ Hit: Return cached data (fast)
             └─ Miss: Query database → Store in cache → Return data

Cache Invalidation:
- Time-based: Expire after X minutes
- Event-based: Invalidate on data update
- Manual: Admin cache clear
```

#### Cache Layers
1. **Application-Level:** In-memory cache (Caffeine)
2. **Distributed Cache:** Redis for shared state
3. **Database-Level:** SQL Server query cache
4. **CDN:** Static resources (JS, CSS, images)

### Performance Targets
- **Page Load:** <2 seconds (95th percentile)
- **API Response:** <500ms (95th percentile)
- **Dashboard Refresh:** <1 second
- **Report Generation:** <5 seconds (small), <30 seconds (large)
- **Concurrent Users:** 500+ without degradation

### Performance Monitoring
- Application Performance Monitoring (APM) tools
- Database query performance metrics
- Real user monitoring (RUM)
- Synthetic monitoring

---

## 10. Technology Stack

### Backend
- **Language:** Java 17 (LTS)
- **Framework:** Spring Boot 3.x
  - Spring Web (REST API)
  - Spring Data JPA (ORM)
  - Spring Security (Authentication/Authorization)
  - Spring WebSocket (Real-time)
  - Spring Scheduler (Jobs)
- **Database:** Microsoft SQL Server 2016+
- **ORM:** Hibernate 6.x
- **Connection Pool:** HikariCP
- **Caching:** Redis + Caffeine
- **Validation:** Hibernate Validator
- **Testing:** JUnit 5, Mockito, Spring Test

### Frontend (Planned)
- **Framework:** React 18+ or Vue 3+
- **State Management:** Redux / Vuex
- **Charts:** Chart.js / D3.js
- **UI Library:** Material-UI / Ant Design
- **Build Tool:** Vite / Webpack
- **HTTP Client:** Axios

### DevOps & Tools
- **Build:** Maven 3.8+ / Gradle 7+
- **Version Control:** Git
- **CI/CD:** GitHub Actions / Jenkins / Azure DevOps
- **Containerization:** Docker
- **Orchestration:** Kubernetes (optional)
- **Monitoring:** Prometheus + Grafana
- **Logging:** ELK Stack (Elasticsearch, Logstash, Kibana)

### Security Tools
- **Dependency Scanning:** OWASP Dependency-Check
- **Static Analysis:** SonarQube
- **Secret Scanning:** git-secrets, TruffleHog
- **Vulnerability Scanning:** Snyk

---

## 11. Design Decisions

### Decision Log

#### Decision 1: Java + Spring Boot
**Date:** 2025-11-19  
**Decision:** Use Java 17 with Spring Boot for backend  
**Rationale:**
- Mature ecosystem with extensive libraries
- Strong typing reduces runtime errors
- Excellent Spring ecosystem for enterprise features
- Wide talent pool
- Long-term support (LTS)

**Alternatives Considered:**
- .NET Core: Strong option, but team more familiar with Java
- Node.js: Performance concerns for CPU-intensive operations
- Python: Better for data science, but slower for web services

#### Decision 2: SQL Server Database
**Date:** 2025-11-19  
**Decision:** Use Microsoft SQL Server as primary database  
**Rationale:**
- Windows Integrated Security simplifies authentication
- Existing organizational SQL Server infrastructure
- Strong ACID compliance for critical data
- Excellent reporting services integration
- Mature management tools

**Alternatives Considered:**
- PostgreSQL: Free, but would require separate auth setup
- MySQL: Considered, but SQL Server better for Windows environment
- MongoDB: Not suitable for relational data and transactions

#### Decision 3: Monolithic Architecture (Initial)
**Date:** 2025-11-19  
**Decision:** Start with monolithic architecture, design for microservices  
**Rationale:**
- Simpler to develop and deploy initially
- Lower operational complexity
- Can refactor to microservices later if needed
- Use modular design to enable future splitting

**Future Consideration:**
- Extract services as load patterns emerge
- Potential candidates: Reporting, Data Collection

#### Decision 4: JWT for Authentication
**Date:** 2025-11-19  
**Decision:** Use JWT tokens for API authentication  
**Rationale:**
- Stateless authentication (enables horizontal scaling)
- Self-contained tokens reduce database lookups
- Industry standard with good library support
- Works well with mobile and SPA clients

**Security Measures:**
- Short expiration (1 hour)
- Refresh token rotation
- Secure secret management
- Token revocation list for logout

#### Decision 5: Real-Time via WebSocket
**Date:** 2025-11-19  
**Decision:** Use WebSocket for real-time updates  
**Rationale:**
- Bi-directional communication
- Lower latency than polling
- Reduced server load compared to HTTP polling
- Native browser support

**Alternatives Considered:**
- Server-Sent Events (SSE): Simpler, but uni-directional
- Long Polling: Less efficient, more overhead

---

## Appendix A: API Design

### REST API Conventions

#### Endpoint Structure
```
/api/v1/{resource}/{id}/{sub-resource}
```

#### HTTP Methods
- **GET:** Retrieve resources
- **POST:** Create new resources
- **PUT:** Full update of existing resource
- **PATCH:** Partial update of existing resource
- **DELETE:** Remove resource

#### Response Codes
- **200 OK:** Successful GET, PUT, PATCH
- **201 Created:** Successful POST
- **204 No Content:** Successful DELETE
- **400 Bad Request:** Invalid input
- **401 Unauthorized:** Authentication required
- **403 Forbidden:** Insufficient permissions
- **404 Not Found:** Resource doesn't exist
- **500 Internal Server Error:** Server error

#### Example Endpoints
```
GET    /api/v1/dashboards              # List all dashboards
GET    /api/v1/dashboards/{id}         # Get specific dashboard
POST   /api/v1/dashboards              # Create dashboard
PUT    /api/v1/dashboards/{id}         # Update dashboard
DELETE /api/v1/dashboards/{id}         # Delete dashboard
GET    /api/v1/dashboards/{id}/widgets # List widgets in dashboard
POST   /api/v1/dashboards/{id}/widgets # Add widget to dashboard
```

---

## Appendix B: Database Scripts

### Initial Database Setup
```sql
-- Create database
CREATE DATABASE ITDashboard;
GO

USE ITDashboard;
GO

-- Create schemas
CREATE SCHEMA security;
CREATE SCHEMA config;
CREATE SCHEMA metrics;
CREATE SCHEMA audit;
GO

-- Core tables (examples)
CREATE TABLE security.Users (
    user_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(100) NOT NULL UNIQUE,
    email NVARCHAR(255) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    last_login DATETIME2,
    is_active BIT NOT NULL DEFAULT 1
);

CREATE TABLE config.Dashboards (
    dashboard_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    dashboard_name NVARCHAR(200) NOT NULL,
    layout_config NVARCHAR(MAX),  -- JSON
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Dashboards_Users FOREIGN KEY (user_id) REFERENCES security.Users(user_id)
);

CREATE TABLE metrics.MetricData (
    metric_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    source_id INT NOT NULL,
    metric_name NVARCHAR(100) NOT NULL,
    metric_value DECIMAL(18,4),
    timestamp DATETIME2 NOT NULL,
    metadata NVARCHAR(MAX)  -- JSON
);

CREATE INDEX IX_MetricData_Timestamp ON metrics.MetricData(timestamp DESC);
CREATE INDEX IX_MetricData_SourceTimestamp ON metrics.MetricData(source_id, timestamp DESC);
```

---

**Document Version:** 1.0  
**Last Reviewed:** 2025-11-19  
**Next Review Date:** 2026-01-19  
**Maintained By:** Architecture Team
