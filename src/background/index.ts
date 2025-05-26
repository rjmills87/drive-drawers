/// <reference types="chrome" />

import { MessageType } from "../constants";
import googleDriveAuth from "../services/googleDriveAuth";

// Background script for Drive Drawers extension
console.log("Background script loaded");

const initializeAuth = async () => {
  try {
    await googleDriveAuth.initialize();
    console.log("Google Drive auth initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Google Drive auth", error);
  }
};

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  initializeAuth();
  console.log("Drive Drawers extension installed");
});

// Initialize on Browser startup
chrome.runtime.onStartup.addListener(() => {
  initializeAuth();
  console.log("Drive Drawers extension started");
});

// Message Handling
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === MessageType.AUTHENTICATE) {
    googleDriveAuth
      .authenticate()
      .then((success) => {
        sendResponse({ success });
      })
      .catch((error) => {
        console.error("Authentication error", error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
  if (message.type === MessageType.CHECK_AUTH) {
    const isAuthenticated = googleDriveAuth.isAuthenticated();
    sendResponse({ isAuthenticated });
    return true;
  }
  if (message.type === MessageType.SIGN_OUT) {
    googleDriveAuth
      .signOut()
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error("Sign out error:", error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});

// Export an empty object to make TypeScript happy with the module system
export {};
