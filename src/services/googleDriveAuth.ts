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
    await this.loadTokenFromStorage();
  }
  //   Load token from Chrome storage
  private async loadTokenFromStorage(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.get([StorageKeys.AUTH_TOKEN], (result) => {
        if (result && result[StorageKeys.AUTH_TOKEN]) {
          this.token = result[StorageKeys.AUTH_TOKEN];
        }
        resolve();
      });
    });
  }

  //   Check if user is authenticated
  public isAuthenticated(): boolean {
    return !!this.token && this.token.expiresAt > Date.now();
  }

  //   Get the current auth token
  public async getToken(): Promise<string | null> {
    // Check if token exists or if token has expired.
    if (!this.token || this.token.expiresAt <= Date.now()) {
      return null;
    }
    return this.token.token;
  }

  //   Authenticate with Google Drive
  public async authenticate(): Promise<boolean> {
    return new Promise((resolve) => {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
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
    return new Promise((resolve) => {
      chrome.storage.local.set({ [StorageKeys.AUTH_TOKEN]: this.token }, () => {
        resolve();
      });
    });
  }

  //   Sign Out from Google Drive
  public async signOut(): Promise<void> {
    if (!this.token) {
      return;
    }

    const token = this.token.token;
    this.token = null;

    try {
      await this.clearTokenFromStorage();

      await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }

  //  Clear token from Chrome Storage
  private async clearTokenFromStorage(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.remove([StorageKeys.AUTH_TOKEN], () => {
        resolve();
      });
    });
  }
}

const googleDriveAuth = new GoogleDriveAuthService();
export default googleDriveAuth;
