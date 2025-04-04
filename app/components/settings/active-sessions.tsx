import { Badge } from '@flarekit/ui/components/ui/badge'
import { Button } from '@flarekit/ui/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@flarekit/ui/components/ui/card'
import { useEffect, useReducer } from 'react'
import { authClient } from '~/features/auth/client/auth'
import { formatUserAgent } from '~/lib/user-agent'
import { Spinner } from '../spinner'
import { toast } from 'sonner'
import { Session } from 'better-auth'



interface SessionState {
  sessions: Session[];
  loading: boolean;
  error: string | null;
  revokingId: string | null; 
}

type SessionAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: Session[] }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'REVOKE_START'; payload: string }
  | { type: 'REVOKE_SUCCESS'; payload: string }
  | { type: 'REVOKE_ERROR' };

const initialState: SessionState = {
  sessions: [],
  loading: true,
  error: null,
  revokingId: null,
};

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, sessions: action.payload };
    case 'REVOKE_START':
      return { ...state, revokingId: action.payload };
    case 'REVOKE_SUCCESS':
      return { ...state, revokingId: null };
    case 'REVOKE_ERROR':
      return { ...state, revokingId: null };
    default:
      return state;
  }
}

export default function ActiveSessions() {
  const [state, dispatch] = useReducer(sessionReducer, initialState);

  const fetchSessions = async () => {
    try {
      const { data } = await authClient.listSessions();
      const sessionsWithCurrent = data!.map(session => ({
        ...session,
        current: session.token === localStorage.getItem('session_token')
      }));
      dispatch({ type: 'FETCH_SUCCESS', payload: sessionsWithCurrent });
    } catch (error) {
      toast.error(`Failed to load sessions: ${error}`);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevokeSession = async (session: Session) => {
    try {
      dispatch({ type: 'REVOKE_START', payload: session.id });
      await authClient.revokeSession({token:session.token});
      dispatch({ type: 'REVOKE_SUCCESS', payload: session.id });
      await fetchSessions();
      toast.success('Session revoked successfully');
    } catch (error) {
      dispatch({ type: 'REVOKE_ERROR' });
      toast.error(`Failed to revoke session: ${error}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Sessions</CardTitle>
        <CardDescription>
          Manage your active sessions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {state.loading ? (
          <div>Loading sessions...</div>
        ) : state.error ? (
          <div>Error: {state.error}</div>
        ) : (
          state.sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    {session.userAgent && formatUserAgent(session.userAgent)}
                  </p>
                  {false && (
                    <Badge variant="secondary">Current</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Last active: {new Date(session.updatedAt).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Expires: {new Date(session.expiresAt).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  IP: {session.ipAddress || 'Unknown'}
                </p>
              </div>
              {false ? (
                <Button variant="ghost" size="sm" disabled>
                  Current Session
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRevokeSession(session)}
                  disabled={state.revokingId === session.id}
                >
                  {state.revokingId === session.id ? (
                    <div className="flex items-center gap-2">
                      <Spinner className="size-4" />
                      <span>Revoking...</span>
                    </div>
                  ) : (
                    'Log Out'
                  )}
                </Button>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

