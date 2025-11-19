# IT Dashboard - Technical Support Guide

**Version:** 0.1.0  
**Last Updated:** 2025-11-19  
**Audience:** IT Support Staff, System Administrators, DevOps

---

## Table of Contents
1. [Overview](#overview)
2. [System Requirements](#system-requirements)
3. [Installation & Configuration](#installation--configuration)
4. [Troubleshooting Guide](#troubleshooting-guide)
5. [Common Issues & Solutions](#common-issues--solutions)
6. [Database Management](#database-management)
7. [Security & Access Control](#security--access-control)
8. [Performance Tuning](#performance-tuning)
9. [Monitoring & Logs](#monitoring--logs)
10. [Backup & Recovery](#backup--recovery)
11. [Support Escalation](#support-escalation)

---

## 1. Overview

### Purpose
This guide provides technical support staff with comprehensive information for troubleshooting, maintaining, and supporting the IT Dashboard application.

### Architecture Summary
- **Application Layer:** Java Spring Boot application
- **Database:** Microsoft SQL Server
- **Authentication:** Windows Integrated Security / OAuth 2.0
- **Deployment:** [Windows Server / Linux / Docker / Cloud]
- **Web Server:** Embedded Tomcat

### Key Components
- Backend API (`/api/v1/*`)
- Database connection pool
- Authentication service
- Real-time data service (WebSocket)
- Scheduled job processor
- Logging and monitoring

---

## 2. System Requirements

### Server Requirements

#### Minimum Specifications
- **CPU:** 4 cores @ 2.5 GHz
- **RAM:** 8 GB
- **Storage:** 50 GB SSD
- **Network:** 100 Mbps

#### Recommended Specifications
- **CPU:** 8 cores @ 3.0 GHz
- **RAM:** 16 GB
- **Storage:** 100 GB SSD (RAID 1)
- **Network:** 1 Gbps

### Software Requirements

#### Operating System
- Windows Server 2016+ or
- Linux (Ubuntu 20.04+, RHEL 8+, CentOS 8+)

#### Dependencies
- **Java Runtime:** OpenJDK 17+ or Oracle JDK 17+
- **Database:** Microsoft SQL Server 2016+
- **Optional:** Docker 20.10+, Kubernetes 1.20+

### Client Requirements

#### Supported Browsers
- Chrome 90+ (recommended)
- Firefox 88+
- Edge 90+
- Safari 14+

#### Client System
- Any OS with modern browser
- Internet connection (minimum 5 Mbps)
- JavaScript enabled
- Cookies enabled

---

## 3. Installation & Configuration

### Initial Setup

#### Step 1: Verify Prerequisites
```powershell
# Check Java version
java -version

# Verify SQL Server connectivity
sqlcmd -S localhost -E -Q "SELECT @@VERSION"

# Check port availability
Test-NetConnection -ComputerName localhost -Port 8080
```

#### Step 2: Configure Environment
Create `.env` file in application root:
```properties
# Database Configuration
DB_SERVER=your-db-server
DB_NAME=ITDashboard
DB_USE_INTEGRATED_SECURITY=true

# For Basic Auth (alternative)
# DB_USE_INTEGRATED_SECURITY=false
# DB_USERNAME=${DB_USER}
# DB_PASSWORD=${DB_PASS}

# Application Settings
SERVER_PORT=8080
LOG_LEVEL=INFO
MAX_CONNECTIONS=50
CONNECTION_TIMEOUT=30000

# Security
JWT_SECRET=${JWT_SECRET_KEY}
SESSION_TIMEOUT=3600

# Feature Flags
ENABLE_REAL_TIME=true
ENABLE_EXPORT=true
```

#### Step 3: Database Setup
```sql
-- Create database
CREATE DATABASE ITDashboard;
GO

USE ITDashboard;
GO

-- Create application user (if using Basic Auth)
CREATE LOGIN dashboard_app WITH PASSWORD = 'SecurePassword123!';
CREATE USER dashboard_app FOR LOGIN dashboard_app;
GO

-- Grant necessary permissions
EXEC sp_addrolemember 'db_datareader', 'dashboard_app';
EXEC sp_addrolemember 'db_datawriter', 'dashboard_app';
GO
```

#### Step 4: Deploy Application
```powershell
# Extract application files
Expand-Archive -Path it-dashboard.zip -DestinationPath C:\Apps\ITDashboard

# Set file permissions
icacls "C:\Apps\ITDashboard" /grant "IIS_IUSRS:(OI)(CI)F"

# Start application
cd C:\Apps\ITDashboard
java -jar it-dashboard.jar
```

### Configuration Files

#### application.properties
Located in `src/main/resources/`:
```properties
# Server Configuration
server.port=${SERVER_PORT:8080}
server.compression.enabled=true

# Database Configuration
spring.datasource.url=jdbc:sqlserver://${DB_SERVER};databaseName=${DB_NAME};integratedSecurity=${DB_USE_INTEGRATED_SECURITY}
spring.datasource.driver-class-name=com.microsoft.sqlserver.jdbc.SQLServerDriver
spring.datasource.hikari.maximum-pool-size=${MAX_CONNECTIONS:50}
spring.datasource.hikari.connection-timeout=${CONNECTION_TIMEOUT:30000}

# Logging
logging.level.root=${LOG_LEVEL:INFO}
logging.file.name=logs/application.log
logging.pattern.file=%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n
```

---

## 4. Troubleshooting Guide

### Diagnostic Process

#### Step 1: Identify the Problem
- Gather symptom details from user
- Check if issue is reproducible
- Determine scope (single user vs. all users)
- Review error messages and screenshots

#### Step 2: Check System Status
```powershell
# Application status
Get-Process -Name java | Where-Object {$_.Path -like "*it-dashboard*"}

# Check port binding
netstat -ano | findstr :8080

# Review recent logs
Get-Content C:\Apps\ITDashboard\logs\application.log -Tail 50

# Database connectivity
sqlcmd -S your-db-server -E -Q "SELECT GETDATE()"
```

#### Step 3: Review Logs
Log locations:
- **Application Logs:** `logs/application.log`
- **Error Logs:** `logs/error.log`
- **Access Logs:** `logs/access.log`
- **Database Logs:** SQL Server Error Log

#### Step 4: Test Components
```powershell
# API health check
Invoke-WebRequest -Uri http://localhost:8080/api/health -Method GET

# Database query test
Invoke-Sqlcmd -Query "SELECT COUNT(*) FROM sys.tables" -Database ITDashboard

# Authentication test
Invoke-WebRequest -Uri http://localhost:8080/api/auth/status -Method GET
```

---

## 5. Common Issues & Solutions

### Application Won't Start

#### Issue: Port Already in Use
**Symptoms:** Error "Port 8080 is already in use"

**Solution:**
```powershell
# Find process using port
netstat -ano | findstr :8080

# Kill the process
Stop-Process -Id [PID] -Force

# Or change port in .env
# SERVER_PORT=8081
```

#### Issue: Database Connection Failed
**Symptoms:** "Cannot establish connection to SQL Server"

**Diagnosis:**
```powershell
# Test SQL Server connectivity
sqlcmd -S your-db-server -E -Q "SELECT 1"

# Check SQL Server service
Get-Service -Name MSSQLSERVER
```

**Solutions:**
1. Verify SQL Server is running
2. Check firewall rules allow port 1433
3. Confirm connection string in `.env`
4. Verify user has appropriate permissions
5. Check network connectivity

#### Issue: Out of Memory Error
**Symptoms:** "java.lang.OutOfMemoryError: Java heap space"

**Solution:**
```powershell
# Increase heap size
java -Xms512m -Xmx2048m -jar it-dashboard.jar
```

Add to startup script or service configuration.

### Performance Issues

#### Issue: Slow Page Load
**Diagnosis:**
1. Check server CPU/memory usage
2. Review database query performance
3. Analyze network latency
4. Check browser console for errors

**Solutions:**
```sql
-- Find slow queries
SELECT TOP 10
    qs.execution_count,
    qs.total_elapsed_time / qs.execution_count AS avg_elapsed_time,
    qt.text
FROM sys.dm_exec_query_stats qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) qt
ORDER BY avg_elapsed_time DESC;
```

- Add missing indexes
- Optimize queries
- Increase connection pool size
- Enable caching

#### Issue: Database Timeouts
**Symptoms:** "Connection timeout" or "Query timeout"

**Solutions:**
1. Increase timeout in `.env`:
   ```properties
   CONNECTION_TIMEOUT=60000
   QUERY_TIMEOUT=30000
   ```
2. Optimize database queries
3. Add indexes to frequently queried columns
4. Update database statistics

### Authentication Issues

#### Issue: Users Cannot Log In
**Diagnosis:**
- Verify authentication service is running
- Check user credentials
- Review authentication logs
- Test with known good account

**Solutions:**
1. **Windows Auth Issues:**
   ```powershell
   # Verify Kerberos tickets
   klist
   
   # Reset if needed
   klist purge
   ```

2. **OAuth Issues:**
   - Verify OAuth provider is accessible
   - Check client ID and secret
   - Validate redirect URIs
   - Review token expiration settings

#### Issue: Session Expires Too Quickly
**Solution:**
Update `.env`:
```properties
SESSION_TIMEOUT=7200  # 2 hours in seconds
```

Restart application for changes to take effect.

### Data Display Issues

#### Issue: Widget Shows "No Data"
**Diagnosis:**
1. Check date range and filters
2. Verify data exists in database
3. Confirm user has permissions
4. Review API logs for errors

**Solutions:**
```sql
-- Verify data exists
SELECT COUNT(*) FROM [TableName]
WHERE DateColumn >= DATEADD(day, -7, GETDATE());

-- Check user permissions
SELECT * FROM sys.database_permissions
WHERE grantee_principal_id = USER_ID('dashboard_app');
```

#### Issue: Charts Not Rendering
**Diagnosis:**
- Check browser console for JavaScript errors
- Verify browser compatibility
- Test in different browser
- Clear browser cache

**Solutions:**
1. Clear cache: `Ctrl + Shift + Delete`
2. Disable browser extensions
3. Update to latest browser version
4. Check Content Security Policy headers

---

## 6. Database Management

### Routine Maintenance

#### Daily Tasks
```sql
-- Check database size
EXEC sp_spaceused;

-- Monitor active connections
SELECT 
    DB_NAME(dbid) as DatabaseName,
    COUNT(dbid) as NumberOfConnections
FROM sys.sysprocesses
WHERE dbid > 0
GROUP BY dbid;
```

#### Weekly Tasks
```sql
-- Update statistics
EXEC sp_updatestats;

-- Rebuild fragmented indexes
ALTER INDEX ALL ON [TableName] REBUILD;

-- Check for blocking
SELECT * FROM sys.dm_exec_requests
WHERE blocking_session_id <> 0;
```

#### Monthly Tasks
```sql
-- Review table sizes
SELECT 
    t.NAME AS TableName,
    p.rows AS RowCounts,
    SUM(a.total_pages) * 8 AS TotalSpaceKB
FROM sys.tables t
INNER JOIN sys.indexes i ON t.OBJECT_ID = i.object_id
INNER JOIN sys.partitions p ON i.object_id = p.OBJECT_ID AND i.index_id = p.index_id
INNER JOIN sys.allocation_units a ON p.partition_id = a.container_id
GROUP BY t.Name, p.Rows
ORDER BY TotalSpaceKB DESC;
```

### Data Integrity

#### Transaction Safety Template
```sql
-- Always use for UPDATE/DELETE operations
BEGIN TRANSACTION;

-- Your modification query
UPDATE [TableName]
SET [Column] = [NewValue]
WHERE [Condition];

-- Verify affected rows
SELECT @@ROWCOUNT as AffectedRows;

-- Review changes
SELECT * FROM [TableName] WHERE [Condition];

-- If correct, commit. Otherwise, rollback.
-- COMMIT;
-- ROLLBACK;
```

### Backup Verification
```sql
-- Check last backup
SELECT 
    database_name,
    backup_start_date,
    backup_finish_date,
    type,
    backup_size / 1024 / 1024 AS BackupSizeMB
FROM msdb.dbo.backupset
WHERE database_name = 'ITDashboard'
ORDER BY backup_start_date DESC;
```

---

## 7. Security & Access Control

### User Management

#### Reset User Password
```powershell
# Contact AD administrator for Windows Auth users
# For OAuth users, direct to OAuth provider reset process
```

#### Grant Dashboard Access
```sql
-- Grant database permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON SCHEMA::dbo TO [username];
```

### Security Audit

#### Check for Hardcoded Credentials
```powershell
# Search codebase for potential secrets
Get-ChildItem -Path . -Recurse -Include *.java, *.properties, *.xml |
    Select-String -Pattern "password|secret|key" -CaseSensitive:$false
```

#### Review Access Logs
```powershell
# Check for suspicious activity
Get-Content logs/access.log |
    Select-String -Pattern "401|403|500" |
    Select-Object -Last 100
```

### SSL/TLS Configuration
For production deployments, always use HTTPS:
```properties
# application.properties
server.ssl.enabled=true
server.ssl.key-store=classpath:keystore.p12
server.ssl.key-store-password=${KEYSTORE_PASSWORD}
server.ssl.key-store-type=PKCS12
```

---

## 8. Performance Tuning

### JVM Optimization
```powershell
# Recommended JVM flags
java -Xms1024m -Xmx4096m `
     -XX:+UseG1GC `
     -XX:MaxGCPauseMillis=200 `
     -XX:+HeapDumpOnOutOfMemoryError `
     -XX:HeapDumpPath=logs/heapdump.hprof `
     -jar it-dashboard.jar
```

### Database Optimization

#### Connection Pooling
```properties
spring.datasource.hikari.maximum-pool-size=50
spring.datasource.hikari.minimum-idle=10
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.idle-timeout=600000
spring.datasource.hikari.max-lifetime=1800000
```

#### Caching Strategy
```properties
spring.cache.type=caffeine
spring.cache.caffeine.spec=maximumSize=1000,expireAfterAccess=600s
```

---

## 9. Monitoring & Logs

### Log Levels
- **ERROR:** Critical issues requiring immediate attention
- **WARN:** Potential problems that don't stop functionality
- **INFO:** General informational messages
- **DEBUG:** Detailed debugging information (development only)

### Log Rotation
Configure in `logback-spring.xml`:
```xml
<rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
    <fileNamePattern>logs/application-%d{yyyy-MM-dd}.%i.log</fileNamePattern>
    <maxFileSize>100MB</maxFileSize>
    <maxHistory>30</maxHistory>
    <totalSizeCap>3GB</totalSizeCap>
</rollingPolicy>
```

### Health Monitoring
```powershell
# Automated health check script
$url = "http://localhost:8080/api/health"
$response = Invoke-WebRequest -Uri $url -UseBasicParsing

if ($response.StatusCode -eq 200) {
    Write-Host "Application is healthy"
} else {
    Write-Host "Application health check failed"
    # Send alert notification
}
```

---

## 10. Backup & Recovery

### Backup Schedule
- **Database:** Daily full backup, hourly transaction log backup
- **Configuration:** Weekly backup of `.env` and config files
- **Logs:** Monthly archive

### Backup Commands
```sql
-- Full database backup
BACKUP DATABASE ITDashboard
TO DISK = 'C:\Backups\ITDashboard_Full.bak'
WITH FORMAT, COMPRESSION, STATS = 10;

-- Transaction log backup
BACKUP LOG ITDashboard
TO DISK = 'C:\Backups\ITDashboard_Log.trn'
WITH COMPRESSION, STATS = 10;
```

### Recovery Procedures

#### Database Restore
```sql
-- Restore full backup
RESTORE DATABASE ITDashboard
FROM DISK = 'C:\Backups\ITDashboard_Full.bak'
WITH REPLACE, RECOVERY;

-- Restore with point-in-time recovery
RESTORE DATABASE ITDashboard
FROM DISK = 'C:\Backups\ITDashboard_Full.bak'
WITH NORECOVERY;

RESTORE LOG ITDashboard
FROM DISK = 'C:\Backups\ITDashboard_Log.trn'
WITH RECOVERY, STOPAT = '2025-11-19 14:00:00';
```

---

## 11. Support Escalation

### Level 1 Support (Help Desk)
**Handles:**
- Password resets
- Access requests
- Basic navigation questions
- Known issues with documented solutions

**Escalate to Level 2 if:**
- Issue not resolved within 30 minutes
- Requires database access
- Application error messages appear
- Performance degradation reported

### Level 2 Support (System Administrators)
**Handles:**
- Application configuration changes
- Database troubleshooting
- Performance tuning
- Security issues
- Integration problems

**Escalate to Level 3 if:**
- Code changes required
- Architecture decisions needed
- Critical security vulnerability
- Data corruption suspected

### Level 3 Support (Development Team)
**Handles:**
- Bug fixes
- Feature enhancements
- Critical system failures
- Complex database issues
- Security patches

### Emergency Contact
**Critical Issues (P1):**
- Application completely down
- Data breach or security incident
- Data loss or corruption

**Contact:** [emergency-contact@yourorg.com]  
**Phone:** [xxx-xxx-xxxx] (24/7 on-call)

---

## Appendix A: Error Code Reference

| Code | Description | Severity | Action |
|------|-------------|----------|--------|
| 1001 | Database connection failed | Critical | Check DB connectivity |
| 1002 | Authentication service unavailable | Critical | Restart auth service |
| 2001 | Invalid user credentials | Low | Verify credentials |
| 2002 | Session expired | Low | Re-authenticate |
| 3001 | Query timeout | Medium | Optimize query |
| 3002 | Connection pool exhausted | High | Increase pool size |
| 4001 | API rate limit exceeded | Low | Throttle requests |
| 5001 | File upload failed | Medium | Check disk space |

---

## Appendix B: Useful SQL Queries

### Find Active Sessions
```sql
SELECT 
    session_id,
    login_name,
    host_name,
    program_name,
    status,
    last_request_start_time
FROM sys.dm_exec_sessions
WHERE database_id = DB_ID('ITDashboard')
    AND is_user_process = 1;
```

### Check Index Fragmentation
```sql
SELECT 
    object_name(ips.object_id) AS TableName,
    ips.index_id,
    i.name AS IndexName,
    ips.avg_fragmentation_in_percent
FROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'DETAILED') ips
INNER JOIN sys.indexes i ON ips.object_id = i.object_id AND ips.index_id = i.index_id
WHERE ips.avg_fragmentation_in_percent > 30
ORDER BY ips.avg_fragmentation_in_percent DESC;
```

---

**Document Version:** 1.0  
**Last Reviewed:** 2025-11-19  
**Next Review Date:** 2025-12-19  
**Maintained By:** IT Support Team
