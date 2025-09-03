'use client';

import React from 'react';
import { useConfig } from '@/services/config.service';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/Badge';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Database,
  Shield,
  Globe,
} from 'lucide-react';

export function ConfigStatus() {
  const { config, loading, error, isFeatureEnabled } = useConfig();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration Status
          </CardTitle>
          <CardDescription>Loading configuration...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            Configuration Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!config) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No configuration available</p>
        </CardContent>
      </Card>
    );
  }

  const { app, supabase, azure, features, validation } = config;

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration Status
            <Badge variant={validation.isValid ? 'default' : 'destructive'}>
              {validation.isValid ? 'Valid' : 'Invalid'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Environment: {app.environment} | Debug:{' '}
            {app.debugMode ? 'Enabled' : 'Disabled'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {validation.errors.length > 0 && (
            <Alert variant="destructive" className="mb-4">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">Configuration Errors:</p>
                  <ul className="list-disc list-inside text-sm">
                    {validation.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {validation.warnings.length > 0 && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">Configuration Warnings:</p>
                  <ul className="list-disc list-inside text-sm">
                    {validation.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Feature Flags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Feature Flags
          </CardTitle>
          <CardDescription>
            Available authentication and system features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(features).map(([feature, enabled]) => (
              <div key={feature} className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize">
                  {feature.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <Badge variant={enabled ? 'default' : 'secondary'}>
                  {enabled ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <XCircle className="h-3 w-3 mr-1" />
                  )}
                  {enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Supabase Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Supabase Configuration
            <Badge variant={supabase.enabled ? 'default' : 'secondary'}>
              {supabase.enabled ? 'Configured' : 'Not Configured'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">URL</span>
              <span className="text-sm font-mono text-gray-600">
                {supabase.url ? 'Set' : 'Missing'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Anonymous Key</span>
              <span className="text-sm font-mono text-gray-600">
                {supabase.anonKey ? 'Set' : 'Missing'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Service Role Key</span>
              <span className="text-sm font-mono text-gray-600">
                {supabase.serviceRoleKey ? 'Set' : 'Missing'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Azure AD Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Azure AD Configuration
            <Badge variant={azure.enabled ? 'default' : 'secondary'}>
              {azure.enabled ? 'Configured' : 'Not Configured'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Client ID</span>
              <span className="text-sm font-mono text-gray-600">
                {azure.clientId ? 'Set' : 'Missing'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Tenant ID</span>
              <span className="text-sm font-mono text-gray-600">
                {azure.tenantId ? 'Set' : 'Missing'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Authority</span>
              <span className="text-sm font-mono text-gray-600">
                {azure.authority ? 'Set' : 'Missing'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Redirect URI</span>
              <span className="text-sm font-mono text-gray-600">
                {azure.redirectUri ? 'Set' : 'Missing'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Application Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Environment</span>
              <Badge variant="outline">{app.environment}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Base URL</span>
              <span className="text-sm font-mono text-gray-600">
                {app.baseUrl || 'Not set'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">API URL</span>
              <span className="text-sm font-mono text-gray-600">
                {app.apiUrl}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Log Level</span>
              <Badge variant="outline">{app.logLevel}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
