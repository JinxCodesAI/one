/**
 * Profile Service Client SDK
 * 
 * JavaScript SDK for interacting with the profile service from web applications.
 * Handles cross-domain identity management via cookies and iframe localStorage.
 */

import { v4 } from "@std/uuid";
import type {
  ProfileSDKConfig,
  UserInfoResponse,
  CreditsResponse,
  ProfileUpdateRequest,
  StorageMessage,
  StorageResponse
} from "../types.ts";

export class ProfileServiceClient {
  private config: ProfileSDKConfig;
  private anonId?: string;
  private iframeReady = false;
  private iframe?: HTMLIFrameElement;
  private pendingRequests = new Map<string, {
    resolve: (value: string | null) => void;
    reject: (error: Error) => void;
  }>();

  constructor(config: Partial<ProfileSDKConfig> = {}) {
    this.config = {
      profileServiceUrl: "https://profile.jinxcodes.ai",
      cookieName: "anon_id",
      cookieDomain: ".jinxcodes.ai",
      iframeTimeout: 5000,
      ...config
    };
  }

  /**
   * Initialize and get the stable anonymous ID
   */
  async getAnonId(): Promise<string> {
    if (this.anonId) {
      return this.anonId;
    }

    // Try to get from cookie first
    this.anonId = this.getCookie(this.config.cookieName);
    
    if (this.anonId) {
      return this.anonId;
    }

    // Fallback to iframe localStorage
    try {
      this.anonId = await this.getFromIframeStorage(this.config.cookieName);
      
      if (this.anonId) {
        // Backup to cookie
        this.setCookie(this.config.cookieName, this.anonId);
        return this.anonId;
      }
    } catch (error) {
      console.warn("Failed to get anon ID from iframe storage:", error);
    }

    // Generate new ID
    this.anonId = uuid.generate();
    
    // Store in both cookie and iframe
    this.setCookie(this.config.cookieName, this.anonId);
    
    try {
      await this.setInIframeStorage(this.config.cookieName, this.anonId);
    } catch (error) {
      console.warn("Failed to backup anon ID to iframe storage:", error);
    }

    return this.anonId;
  }

  /**
   * Get current user info
   */
  async getUserInfo(): Promise<UserInfoResponse> {
    return this.callApi<UserInfoResponse>("GET", "/userinfo");
  }

  /**
   * Get user profile (alias for getUserInfo)
   */
  async getProfile(): Promise<UserInfoResponse> {
    return this.callApi<UserInfoResponse>("GET", "/profile");
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: ProfileUpdateRequest): Promise<UserInfoResponse> {
    return this.callApi<UserInfoResponse>("POST", "/profile", updates);
  }

  /**
   * Get credits balance and ledger
   */
  async getCredits(): Promise<CreditsResponse> {
    return this.callApi<CreditsResponse>("GET", "/credits");
  }

  /**
   * Claim daily bonus
   */
  async claimDailyBonus(): Promise<CreditsResponse> {
    return this.callApi<CreditsResponse>("POST", "/credits/daily-award", {});
  }

  /**
   * Adjust credits (admin function)
   */
  async adjustCredits(amount: number, reason: string): Promise<CreditsResponse> {
    return this.callApi<CreditsResponse>("POST", "/credits/adjust", { amount, reason });
  }

  /**
   * Make an authenticated API call
   */
  async callApi<T>(
    method: "GET" | "POST",
    path: string,
    body?: unknown
  ): Promise<T> {
    const anonId = await this.getAnonId();
    const url = `${this.config.profileServiceUrl}/api${path}`;

    const headers: Record<string, string> = {
      "X-Anon-Id": anonId
    };

    if (body) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include" // Include cookies
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Private methods for cookie management

  private getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    
    if (parts.length === 2) {
      return parts.pop()?.split(";").shift() || null;
    }
    
    return null;
  }

  private setCookie(name: string, value: string): void {
    if (typeof document === "undefined") return;
    
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1); // 1 year
    
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; domain=${this.config.cookieDomain}; path=/; secure; samesite=lax`;
  }

  // Private methods for iframe storage

  private async getFromIframeStorage(key: string): Promise<string | null> {
    await this.ensureIframeReady();
    return this.sendStorageMessage("get", key);
  }

  private async setInIframeStorage(key: string, value: string): Promise<void> {
    await this.ensureIframeReady();
    await this.sendStorageMessage("set", key, value);
  }

  private async ensureIframeReady(): Promise<void> {
    if (this.iframeReady && this.iframe) {
      return;
    }

    if (typeof document === "undefined") {
      throw new Error("Document not available (not in browser environment)");
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Iframe storage timeout"));
      }, this.config.iframeTimeout);

      // Create iframe
      this.iframe = document.createElement("iframe");
      this.iframe.style.display = "none";
      this.iframe.src = `${this.config.profileServiceUrl}/storage.html`;

      // Listen for ready message
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== new URL(this.config.profileServiceUrl).origin) {
          return;
        }

        if (event.data.type === "storage-ready") {
          clearTimeout(timeout);
          window.removeEventListener("message", handleMessage);
          this.iframeReady = true;
          resolve();
        }
      };

      window.addEventListener("message", handleMessage);
      window.addEventListener("message", this.handleStorageMessage.bind(this));

      document.body.appendChild(this.iframe);
    });
  }

  private async sendStorageMessage(
    type: "get" | "set",
    key: string,
    value?: string
  ): Promise<string | null> {
    if (!this.iframe?.contentWindow) {
      throw new Error("Iframe not ready");
    }

    const requestId = uuid.generate();
    const message: StorageMessage = {
      type,
      key,
      value,
      requestId
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error("Storage operation timeout"));
      }, this.config.iframeTimeout);

      this.pendingRequests.set(requestId, {
        resolve: (value) => {
          clearTimeout(timeout);
          resolve(value);
        },
        reject: (error) => {
          clearTimeout(timeout);
          reject(error);
        }
      });

      this.iframe!.contentWindow.postMessage(
        message,
        new URL(this.config.profileServiceUrl).origin
      );
    });
  }

  private handleStorageMessage(event: MessageEvent): void {
    if (event.origin !== new URL(this.config.profileServiceUrl).origin) {
      return;
    }

    const response = event.data as StorageResponse;
    if (!response.requestId) {
      return;
    }

    const pending = this.pendingRequests.get(response.requestId);
    if (!pending) {
      return;
    }

    this.pendingRequests.delete(response.requestId);

    if (response.success) {
      pending.resolve(response.value || null);
    } else {
      pending.reject(new Error(response.error || "Storage operation failed"));
    }
  }
}

/**
 * Create a new profile service client
 */
export function createProfileClient(config?: Partial<ProfileSDKConfig>): ProfileServiceClient {
  return new ProfileServiceClient(config);
}

/**
 * Default client instance (singleton)
 */
let defaultClient: ProfileServiceClient | null = null;

/**
 * Get the default profile service client
 */
export function getProfileClient(): ProfileServiceClient {
  if (!defaultClient) {
    defaultClient = new ProfileServiceClient();
  }
  return defaultClient;
}

// Convenience functions using default client

export async function getAnonId(): Promise<string> {
  return getProfileClient().getAnonId();
}

export async function getUserInfo(): Promise<UserInfoResponse> {
  return getProfileClient().getUserInfo();
}

export async function updateProfile(updates: ProfileUpdateRequest): Promise<UserInfoResponse> {
  return getProfileClient().updateProfile(updates);
}

export async function getCredits(): Promise<CreditsResponse> {
  return getProfileClient().getCredits();
}

export async function claimDailyBonus(): Promise<CreditsResponse> {
  return getProfileClient().claimDailyBonus();
}
