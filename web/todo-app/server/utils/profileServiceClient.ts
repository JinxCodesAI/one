/**
 * Server-side Profile Service Client
 * 
 * This is a server-side adapter for the Profile Service API.
 * Unlike the client-side SDK, this uses direct HTTP calls and doesn't handle
 * browser-specific features like cookies or iframe communication.
 */

import type {
  UserInfoResponse,
  CreditsResponse,
  ProfileUpdateRequest
} from "../../../../internal/profile-service/types.ts";

export interface ServerProfileServiceConfig {
  baseUrl: string;
  timeout?: number;
}

export class ServerProfileServiceClient {
  private config: ServerProfileServiceConfig;

  constructor(config: ServerProfileServiceConfig) {
    this.config = {
      timeout: 5000,
      ...config
    };
  }

  /**
   * Get user information by anonId
   */
  async getUserInfo(anonId: string): Promise<UserInfoResponse> {
    const response = await this.makeRequest('GET', '/api/userinfo', anonId);
    return response as UserInfoResponse;
  }

  /**
   * Update user profile
   */
  async updateProfile(anonId: string, updates: ProfileUpdateRequest): Promise<UserInfoResponse> {
    const response = await this.makeRequest('POST', '/api/profile', anonId, updates);
    return response as UserInfoResponse;
  }

  /**
   * Get user credits
   */
  async getCredits(anonId: string): Promise<CreditsResponse> {
    const response = await this.makeRequest('GET', '/api/credits', anonId);
    return response as CreditsResponse;
  }

  /**
   * Claim daily bonus
   */
  async claimDailyBonus(anonId: string): Promise<CreditsResponse> {
    const response = await this.makeRequest('POST', '/api/credits/daily-award', anonId, {});
    return response as CreditsResponse;
  }

  /**
   * Make authenticated request to profile service
   */
  private async makeRequest(
    method: 'GET' | 'POST',
    path: string,
    anonId: string,
    body?: unknown
  ): Promise<unknown> {
    const url = `${this.config.baseUrl}${path}`;
    
    const headers: Record<string, string> = {
      'X-Anon-Id': anonId,
      'Content-Type': 'application/json'
    };

    const requestInit: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(this.config.timeout!)
    };

    if (body && method === 'POST') {
      requestInit.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, requestInit);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        
        throw new Error(`Profile Service API error (${response.status}): ${errorData.error || errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to call Profile Service: ${error.message}`);
      }
      throw new Error('Failed to call Profile Service: Unknown error');
    }
  }
}

/**
 * Create a server-side profile service client
 */
export function createServerProfileClient(config: ServerProfileServiceConfig): ServerProfileServiceClient {
  return new ServerProfileServiceClient(config);
}
