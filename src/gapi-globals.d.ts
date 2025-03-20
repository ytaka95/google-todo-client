// Define types for Google API
interface GapiClient {
  init(options: {
    apiKey?: string;
    clientId?: string;
    discoveryDocs?: string[];
    scope?: string;
  }): Promise<void>;
  setToken(token: { access_token: string }): void;
  load(api: string, version: string): Promise<void>;
  tasks?: {
    tasks: {
      list(params: any): Promise<any>;
      get(params: any): Promise<any>;
      insert(params: any): Promise<any>;
      update(params: any): Promise<any>;
      delete(params: any): Promise<any>;
    };
    tasklists: {
      list(): Promise<any>;
    };
  };
}

interface Gapi {
  load(api: string, callback: () => void): void;
  client: GapiClient;
}

interface GoogleOAuth2 {
  initTokenClient(config: any): {
    requestAccessToken(options?: any): void;
  };
  revoke(token: string, callback?: () => void): void;
}

interface GoogleAccounts {
  oauth2: GoogleOAuth2;
  id: any;
}

interface Google {
  accounts: GoogleAccounts;
}

// Declare globals
declare global {
  interface Window {
    gapi: Gapi;
    google: Google;
  }
}

export {};
