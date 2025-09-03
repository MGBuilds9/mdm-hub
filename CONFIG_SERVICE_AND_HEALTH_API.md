# Configuration Service and Health Check API

This document outlines the comprehensive configuration management system and health monitoring API that centralizes environment variable validation, provides typed configuration objects, implements feature flags, and offers production monitoring capabilities.

## 🎯 Overview

The configuration service and health check API provide:

1. **Centralized Configuration Management** - Single source of truth for all environment variables
2. **Type Safety** - Fully typed configuration objects with TypeScript
3. **Feature Flags** - Runtime feature toggling for Azure AD vs Supabase auth
4. **Runtime Validation** - Continuous validation of configuration state
5. **Production Monitoring** - Comprehensive health checks for all services
6. **Error Prevention** - Prevents runtime errors through early validation

## 📁 File Structure

```
src/
├── services/
│   └── config.service.ts          # Configuration service
├── app/api/health/
│   └── route.ts                   # Health check API
├── components/config/
│   └── config-status.tsx          # Configuration status component
└── components/auth/
    └── login-form.tsx             # Updated to use config service
```

## 🔧 Configuration Service

### Core Features

#### 1. Environment Variable Validation
- Validates all required environment variables on startup
- Provides detailed error messages for missing configuration
- Supports development vs production validation rules
- Telemetry integration for configuration issues

#### 2. Typed Configuration Objects
```typescript
interface Configuration {
  app: AppConfig;
  supabase: SupabaseConfig;
  azure: AzureConfig;
  database: DatabaseConfig;
  features: FeatureFlags;
  validation: ConfigValidationResult;
}
```

#### 3. Feature Flags
```typescript
interface FeatureFlags {
  azureAuth: boolean;
  supabaseAuth: boolean;
  emailAuth: boolean;
  socialAuth: boolean;
  analytics: boolean;
  telemetry: boolean;
  debugMode: boolean;
}
```

#### 4. Runtime Validation
- Continuous validation of configuration state
- Cached validation results for performance
- Error tracking and telemetry integration

### Usage Examples

#### Basic Configuration Access
```typescript
import { configService, getConfig, isFeatureEnabled } from '@/services/config.service';

// Get complete configuration
const config = await configService.validateAndGetConfig();

// Check if feature is enabled
if (isFeatureEnabled('azureAuth')) {
  // Azure authentication is available
}

// Get specific configuration
const supabaseConfig = config.supabase;
const azureConfig = config.azure;
```

#### React Hook Usage
```typescript
import { useConfig } from '@/services/config.service';

function MyComponent() {
  const { config, loading, error, isFeatureEnabled } = useConfig();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {isFeatureEnabled('azureAuth') && (
        <AzureSignInButton />
      )}
      {isFeatureEnabled('supabaseAuth') && (
        <SupabaseSignInButton />
      )}
    </div>
  );
}
```

#### Configuration Validation
```typescript
import { validateConfig, ConfigValidationError } from '@/services/config.service';

try {
  const config = await validateConfig();
  console.log('Configuration is valid:', config);
} catch (error) {
  if (error instanceof ConfigValidationError) {
    console.log('Validation errors:', error.errors);
    console.log('Warnings:', error.warnings);
  }
}
```

## 🏥 Health Check API

### Endpoint: `GET /api/health`

The health check API provides comprehensive monitoring for production environments.

#### Response Format
```typescript
interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  checks: {
    configuration: CheckResult;
    supabase: CheckResult;
    azure: CheckResult;
    database: CheckResult;
    overall: CheckResult;
  };
  metrics: {
    responseTime: number;
    uptime: number;
  };
}
```

#### Health Check Status Codes
- **200 (Healthy)**: All systems operational
- **200 (Degraded)**: System operational but with warnings
- **503 (Unhealthy)**: Service unavailable due to critical issues

### Health Checks Performed

#### 1. Configuration Check
- Validates all environment variables
- Checks configuration consistency
- Reports warnings for optional features

#### 2. Supabase Check
- Tests Supabase connection
- Validates authentication keys
- Checks database accessibility

#### 3. Azure AD Check
- Validates Azure AD configuration
- Tests authority endpoint connectivity
- Checks redirect URI configuration

#### 4. Database Check
- Tests database connectivity
- Validates service role permissions
- Checks query execution

### Usage Examples

#### Basic Health Check
```bash
curl https://your-app.com/api/health
```

#### Health Check Response (Healthy)
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "checks": {
    "configuration": {
      "status": "pass",
      "message": "Configuration is valid",
      "responseTime": 5
    },
    "supabase": {
      "status": "pass",
      "message": "Supabase connection healthy",
      "responseTime": 120
    },
    "azure": {
      "status": "pass",
      "message": "Azure AD configuration healthy",
      "responseTime": 80
    },
    "database": {
      "status": "pass",
      "message": "Database connection healthy",
      "responseTime": 45
    },
    "overall": {
      "status": "pass",
      "message": "All systems operational"
    }
  },
  "metrics": {
    "responseTime": 250,
    "uptime": 86400000
  }
}
```

#### Health Check Response (Unhealthy)
```json
{
  "status": "unhealthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "checks": {
    "configuration": {
      "status": "fail",
      "message": "Configuration validation failed",
      "details": {
        "errors": ["Missing NEXT_PUBLIC_SUPABASE_URL"]
      }
    },
    "supabase": {
      "status": "fail",
      "message": "Not checked - configuration invalid"
    },
    "azure": {
      "status": "fail",
      "message": "Not checked - configuration invalid"
    },
    "database": {
      "status": "fail",
      "message": "Not checked - configuration invalid"
    },
    "overall": {
      "status": "fail",
      "message": "Failed checks: configuration: Configuration validation failed"
    }
  },
  "metrics": {
    "responseTime": 15,
    "uptime": 86400000
  }
}
```

## 🎛️ Configuration Status Component

The `ConfigStatus` component provides a visual representation of the current configuration state.

### Features
- Real-time configuration status
- Feature flag visualization
- Environment variable status
- Error and warning display
- Responsive design

### Usage
```typescript
import { ConfigStatus } from '@/components/config/config-status';

function SetupPage() {
  return (
    <div>
      <h1>Environment Setup</h1>
      <ConfigStatus />
    </div>
  );
}
```

## 🔄 Integration Examples

### Updated Login Form
The login form now uses the configuration service to determine which authentication methods are available:

```typescript
import { useConfig } from '@/services/config.service';

function LoginForm() {
  const { isFeatureEnabled } = useConfig();

  return (
    <div>
      {isFeatureEnabled('azureAuth') && (
        <AzureSignInButton />
      )}
      {isFeatureEnabled('supabaseAuth') && (
        <EmailSignInForm />
      )}
    </div>
  );
}
```

### Environment Setup Page
The setup page now shows comprehensive configuration status:

```typescript
import { ConfigStatus } from '@/components/config/config-status';

function SetupPage() {
  return (
    <div>
      <ConfigStatus />
      {/* Environment variable configuration UI */}
    </div>
  );
}
```

## 🚀 Benefits

### 1. **Centralized Configuration**
- Single source of truth for all environment variables
- Consistent validation across the application
- Easy configuration management

### 2. **Type Safety**
- Fully typed configuration objects
- Compile-time error detection
- IntelliSense support

### 3. **Feature Flags**
- Runtime feature toggling
- Easy A/B testing
- Gradual feature rollouts

### 4. **Production Monitoring**
- Comprehensive health checks
- Real-time system status
- Quick issue diagnosis

### 5. **Error Prevention**
- Early validation prevents runtime errors
- Clear error messages for debugging
- Telemetry integration for monitoring

### 6. **Developer Experience**
- Easy-to-use React hooks
- Visual configuration status
- Comprehensive documentation

## 🛠️ Environment Variables

### Required Variables
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ[YOUR_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=eyJ[YOUR_SERVICE_ROLE_KEY]

# Azure AD Configuration (Optional)
NEXT_PUBLIC_AZURE_CLIENT_ID=your_client_id
NEXT_PUBLIC_AZURE_TENANT_ID=your_tenant_id
NEXT_PUBLIC_AZURE_AUTHORITY=https://login.microsoftonline.com/your_tenant_id
NEXT_PUBLIC_AZURE_REDIRECT_URI=http://localhost:3000/auth/callback

# Application Configuration (Optional)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=/api
LOG_LEVEL=debug
NEXT_PUBLIC_DEBUG=true
NEXT_PUBLIC_ANALYTICS_ENABLED=false
NEXT_PUBLIC_TELEMETRY_ENABLED=true
```

## 📊 Monitoring and Observability

### Telemetry Events
- `config_validation`: Configuration validation results
- `health_check`: Health check execution
- `config_validation_failed`: Configuration validation failures
- `health_check_critical_error`: Critical health check errors

### Health Check Metrics
- Response time for each check
- Overall system uptime
- Configuration validation status
- Service connectivity status

## 🔮 Future Enhancements

1. **Dynamic Configuration**: Runtime configuration updates without restarts
2. **Configuration Caching**: Redis-based configuration caching
3. **Multi-Environment Support**: Environment-specific configuration profiles
4. **Configuration Encryption**: Encrypted sensitive configuration values
5. **Health Check Extensions**: Custom health check plugins
6. **Configuration UI**: Web-based configuration management interface
7. **Audit Logging**: Configuration change tracking
8. **Rollback Support**: Configuration versioning and rollback

## 🛠️ Troubleshooting

### Common Issues

1. **Configuration Validation Failures**
   - Check all required environment variables are set
   - Verify environment variable names and values
   - Check for typos in configuration

2. **Health Check Failures**
   - Verify service connectivity
   - Check network access to external services
   - Validate authentication credentials

3. **Feature Flag Issues**
   - Ensure configuration service is properly initialized
   - Check feature flag configuration
   - Verify environment variable values

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` or `NEXT_PUBLIC_DEBUG=true` to see detailed configuration and health check logs.

### Health Check Debugging
Access the health check endpoint directly to see detailed status information:
```bash
curl -v https://your-app.com/api/health
```

This comprehensive configuration service and health check API provides a robust foundation for managing application configuration and monitoring system health in production environments.
