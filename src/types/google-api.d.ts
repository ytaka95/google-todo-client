interface GapiClient {
  init: (options: {
    apiKey?: string;
    clientId?: string;
    discoveryDocs?: string[];
    scope?: string;
  }) => Promise<void>;
  setToken: (token: { access_token: string }) => void;
  tasks?: {
    tasks: {
      list: (params: {
        tasklist: string;
        maxResults?: number;
        showCompleted?: boolean;
        showHidden?: boolean;
        showDeleted?: boolean;
      }) => Promise<{
        result: {
          items?: Array<{
            id: string;
            title: string;
            notes?: string;
            status: 'needsAction' | 'completed';
            due?: string;
            updated: string;
          }>;
          nextPageToken?: string;
        }
      }>;
      get: (params: { tasklist: string; task: string }) => Promise<{
        result: {
          id: string;
          title: string;
          notes?: string;
          status: 'needsAction' | 'completed';
          due?: string;
          updated: string;
        }
      }>;
      insert: (params: {
        tasklist: string;
        resource: {
          title: string;
          notes?: string;
          status?: 'needsAction' | 'completed';
          due?: string;
        }
      }) => Promise<{
        result: {
          id: string;
          title: string;
          notes?: string;
          status: 'needsAction' | 'completed';
          due?: string;
          updated: string;
        }
      }>;
      update: (params: {
        tasklist: string;
        task: string;
        resource: {
          title?: string;
          notes?: string;
          status?: 'needsAction' | 'completed';
          due?: string;
        }
      }) => Promise<{
        result: {
          id: string;
          title: string;
          notes?: string;
          status: 'needsAction' | 'completed';
          due?: string;
          updated: string;
        }
      }>;
      delete: (params: { tasklist: string; task: string }) => Promise<void>;
    };
    tasklists: {
      list: () => Promise<{
        result: {
          items: Array<{
            id: string;
            title: string;
          }>;
        }
      }>;
    };
  };
}

interface GapiType {
  load: (api: string, callback: () => void) => void;
  client?: GapiClient;
  auth?: {
    getToken: () => { access_token: string };
  };
}

// Google Identity Services (GSI) types
interface GoogleAccountsType {
  id: {
    initialize: (config: any) => void;
    renderButton: (element: HTMLElement, options: any) => void;
    prompt: () => void;
  };
  oauth2: {
    initTokenClient: (config: {
      client_id: string;
      scope: string;
      prompt?: string;
      callback: (response: any) => void;
    }) => {
      requestAccessToken: (options?: { state?: string }) => void;
    };
    initCodeClient: (config: any) => any;
    hasGrantedAllScopes: (token: string, ...scopes: string[]) => boolean;
    revoke: (accessToken: string, callback?: () => void) => void;
  };
}

declare global {
  interface Window {
    gapi?: GapiType;
    google?: {
      accounts?: GoogleAccountsType;
    };
  }
}