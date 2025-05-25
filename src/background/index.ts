/// <reference types="chrome" />

// Background script for Drive Drawers extension

console.log("Background script loaded");

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("Drive Drawers extension installed");
});

// Export an empty object to make TypeScript happy with the module system
export {};
