interface GapiClient {
  init: (options: {
    apiKey?: string;
    clientId?: string;
    discoveryDocs?: string[];
    scope?: string;
  }) => Promise<void>;
  tasks: {
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
  client: GapiClient;
  auth: {
    getToken: () => { access_token: string };
  };
}

declare global {
  interface Window {
    gapi: GapiType;
  }
}