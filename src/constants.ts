const StorageKeys = {
  AUTH_TOKEN: "auth_token",
  OPTIONS: "options",
  CURRENT_SERVICE: "current_service",
  CURRENT_PATH: "current_path",
};

const CloudService = {
  GOOGLE_DRIVE: "google-drive",
  MICROSOFT_ONEDRIVE: "microsoft-onedrive",
  DROPBOX: "dropbox",
};

const MessageType = {
  AUTHENTICATE: "authenticate",
  CHECK_AUTH: "check_auth",
  SIGN_OUT: "sign_out",
  GET_FILES: "get_files",
};

export { StorageKeys, CloudService, MessageType };
