import { StorageKeys } from "../constants";

interface AuthToken {
  token: string;
  expiresAt: number; //Timestamp for token expiry
}

class GoogleDriveAuthService {
  // Store token in memory
  private token: AuthToken | null = null;

  //   Initialize auth service by loading any saved token
  public async initialize(): Promise<void> {
    console.log("Initializing Google Drive auth service");
    await this.loadTokenFromStorage();
    console.log("Token loaded from storage:", !!this.token);
  }

  //   Load token from Chrome storage
  private async loadTokenFromStorage(): Promise<void> {
    console.log("Loading token from Chrome storage");
    return new Promise((resolve) => {
      chrome.storage.local.get([StorageKeys.AUTH_TOKEN], (result) => {
        console.log("Storage result:", result);
        if (result && result[StorageKeys.AUTH_TOKEN]) {
          this.token = result[StorageKeys.AUTH_TOKEN];
          console.log(
            "Token loaded successfully, expires at:",
            this.token && this.token.expiresAt
              ? new Date(this.token.expiresAt).toISOString()
              : "unknown"
          );
        } else {
          console.log("No token found in storage");
        }
        resolve();
      });
    });
  }

  //   Check if user is authenticated
  public async isAuthenticated(): Promise<boolean> {
    // Make sure token is loaded from storage first
    await this.loadTokenFromStorage();

    const authenticated = !!this.token && this.token.expiresAt > Date.now();
    console.log("Checking if authenticated:", authenticated);
    if (this.token) {
      console.log(
        "Token expires at:",
        this.token && this.token.expiresAt
          ? new Date(this.token.expiresAt).toISOString()
          : "unknown"
      );
      console.log("Current time:", new Date().toISOString());
    }
    return authenticated;
  }

  //   Get the current auth token
  public async getToken(): Promise<string | null> {
    console.log("getToken: Starting token retrieval");
    // Make sure token is loaded from storage first
    await this.loadTokenFromStorage();
    console.log(
      "getToken: Finished loading from storage, token exists:",
      !!this.token
    );

    // Check if token exists or if token has expired.
    if (!this.token) {
      console.log("getToken: No token exists");
      return null;
    }

    console.log(
      "getToken: Token expiry check - Current time:",
      new Date(Date.now()).toISOString(),
      "Expires at:",
      new Date(this.token.expiresAt).toISOString()
    );
    if (this.token.expiresAt <= Date.now()) {
      console.log("getToken: Token has expired");
      return null;
    }

    console.log(
      "getToken: Valid token returned, token type:",
      typeof this.token.token
    );
    if (typeof this.token.token === "string") {
      console.log("getToken: Token length:", this.token.token.length);
      console.log(
        "getToken: Token first 10 chars:",
        this.token.token.substring(0, 10) + "..."
      );
    } else {
      console.log(
        "getToken: WARNING - Token is not a string:",
        typeof this.token.token
      );
    }
    return this.token.token;
  }

  //   Authenticate with Google Drive
  public async authenticate(): Promise<boolean> {
    console.log("Authenticating with Google Drive");
    return new Promise((resolve) => {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        console.log("Authentication result:", token);
        if (chrome.runtime.lastError || !token) {
          console.error("Authentication error:", chrome.runtime.lastError);
          resolve(false);
          return;
        }

        // Type assertion to tell TypeScript this is a string
        const tokenString = token as unknown as string;

        // Token valid for 1 hour (3600 Seconds)
        const expiresAt = Date.now() + 3600 * 1000;

        this.token = {
          token: tokenString,
          expiresAt,
        };

        console.log(
          "Token obtained, expires at:",
          new Date(this.token.expiresAt).toISOString()
        );
        this.saveTokenToStorage()
          .then(() => resolve(true))
          .catch((error) => {
            console.error("Error saving token:", error);
            resolve(false);
          });
      });
    });
  }

  //   Save token to Chrome Storage
  private async saveTokenToStorage(): Promise<void> {
    console.log("Saving token to Chrome storage");
    return new Promise((resolve) => {
      chrome.storage.local.set({ [StorageKeys.AUTH_TOKEN]: this.token }, () => {
        console.log("Token saved to storage");
        resolve();
      });
    });
  }

  //   Sign out from Google Drive
  public async signOut(): Promise<boolean> {
    console.log("Signing out from Google Drive");

    if (!this.token) {
      console.log("No token to sign out");
      return true;
    }

    const token = this.token.token;
    this.token = null;

    try {
      // Clear token from storage
      await this.clearTokenFromStorage();

      // Clear token from Chrome's cache
      await new Promise<void>((resolve) => {
        chrome.identity.removeCachedAuthToken({ token }, () => {
          console.log("Token removed from Chrome's cache");
          resolve();
        });
      });

      // Revoke the token with Google
      try {
        const response = await fetch(
          `https://accounts.google.com/o/oauth2/revoke?token=${token}`
        );
        if (response.ok) {
          console.log("Token revoked successfully");
        } else {
          console.warn(
            "Token revocation may have failed:",
            response.status,
            response.statusText
          );
        }
      } catch (revokeError) {
        console.error("Error revoking token:", revokeError);
        // Continue with sign out even if revocation fails
      }

      return true;
    } catch (error) {
      console.error("Error signing out:", error);
      return false;
    }
  }

  //  Clear token from Chrome Storage
  private async clearTokenFromStorage(): Promise<void> {
    console.log("Clearing token from Chrome storage");
    return new Promise((resolve) => {
      chrome.storage.local.remove([StorageKeys.AUTH_TOKEN], () => {
        console.log("Token cleared from storage");
        resolve();
      });
    });
  }
}

const googleDriveAuth = new GoogleDriveAuthService();
export default googleDriveAuth;
