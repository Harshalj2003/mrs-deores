import { useEffect, useRef } from 'react';
import api from '../services/api';
import AuthService from '../services/auth.service';

/**
 * Sends a silent heartbeat to the backend every 30s while the user is logged in.
 * Pauses when the tab is hidden (saves bandwidth), resumes on focus.
 * Admins are excluded — they're staff, not "active users".
 */
export default function useHeartbeat() {
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        const user = AuthService.getCurrentUser();

        // Skip for guests and admins
        if (!user || user.roles?.includes('ROLE_ADMIN')) return;

        const sendHeartbeat = () => {
            api.post('/activity/heartbeat').catch(() => {
                // Silently ignore errors — heartbeat is non-critical
            });
        };

        const startHeartbeat = () => {
            if (intervalRef.current) return; // already running
            sendHeartbeat(); // immediate first ping
            intervalRef.current = setInterval(sendHeartbeat, 30_000);
        };

        const stopHeartbeat = () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                stopHeartbeat();
            } else {
                startHeartbeat();
            }
        };

        startHeartbeat();
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            stopHeartbeat();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);
}
