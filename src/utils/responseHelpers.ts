// Auth service response utilities using shared types
import { 
  SuccessResponse, 
  ErrorResponse, 
  LoginResponse, 
  User as SharedUser,
  AuthTokens,
  HealthCheckResponse 
} from '@sfl/shared-types';
import User from '../dbModels/UserModel';

/**
 * Create a standardized success response
 */
export const createSuccessResponse = <T>(data: T, message?: string): SuccessResponse<T> => ({
  success: true,
  data,
  message
});

/**
 * Create a standardized error response
 */
export const createErrorResponse = (error: string, message: string): ErrorResponse => ({
  success: false,
  error,
  message
});

/**
 * Convert database User model to shared User type
 */
export const convertUserToSharedType = (user: User): SharedUser => ({
  id: user.id, // Now compatible with string UUID
  email: user.email,
  isEmailVerified: user.isActive, // Map isActive to isEmailVerified
  firstName: undefined, // Not available in current model
  lastName: undefined, // Not available in current model
  profilePicture: undefined, // Not available in current model
  createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
  updatedAt: user.updatedAt?.toISOString() || new Date().toISOString()
});

/**
 * Create auth tokens object
 */
export const createAuthTokens = (accessToken: string, expiresIn: number = 3600): AuthTokens => ({
  accessToken,
  expiresIn
});

/**
 * Create login response with user and tokens
 */
export const createLoginResponse = (user: User, accessToken: string): LoginResponse => {
  const sharedUser = convertUserToSharedType(user);
  const tokens = createAuthTokens(accessToken);
  
  return {
    user: sharedUser,
    tokens
  };
};

/**
 * Create health check response
 */
export const createHealthResponse = (status: 'ok' | 'error' = 'ok'): HealthCheckResponse => ({
  status,
  timestamp: new Date().toISOString(),
  service: 'sfl-auth-service',
  version: '1.0.0',
  uptime: process.uptime()
});
