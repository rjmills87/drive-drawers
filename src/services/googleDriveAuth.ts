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
    // Make sure token is loaded from storage first
    await this.loadTokenFromStorage();

    // Check if token exists or if token has expired.
    if (!this.token) {
      console.log("getToken: No token exists");
      return null;
    }

    if (this.token.expiresAt <= Date.now()) {
      console.log("getToken: Token has expired");
      return null;
    }

    console.log("getToken: Valid token returned");
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

  //   Sign Out from Google Drive
  public async signOut(): Promise<void> {
    console.log("Signing out from Google Drive");
    if (!this.token) {
      console.log("No token to sign out");
      return;
    }

    const token = this.token.token;
    this.token = null;

    try {
      await this.clearTokenFromStorage();

      await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`);
      console.log("Token revoked successfully");
    } catch (error) {
      console.error("Error signing out:", error);
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
