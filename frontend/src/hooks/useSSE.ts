import { useEffect, useState } from 'react';
import { API_BASE } from '../config';

/**
 * Custom React Hook to subscribe to Server-Sent Events (SSE).
 * 
 * @param eventNames An array of event names to listen to (e.g., ['PRODUCT_UPDATED', 'NEW_NOTIFICATION'])
 * @returns An object containing the latest event data for each requested event name, and connection status.
 */
export function useSSE(eventNames: string[]) {
    // Store the latest data payload for each event name
    const [events, setEvents] = useState<Record<string, any>>({});
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Initialize the EventSource connecting to the Spring Boot endpoint
        const eventSource = new EventSource(`${API_BASE}/api/v1/stream`);

        eventSource.onopen = () => {
            console.log('SSE Connection Opened');
            setIsConnected(true);
        };

        eventSource.onerror = (error) => {
            console.error('SSE Connection Error:', error);
            setIsConnected(false);
            // Browser's EventSource will automatically attempt to reconnect
        };

        // Dynamically add an EventListener for every event name requested
        eventNames.forEach((eventName) => {
            eventSource.addEventListener(eventName, (event) => {
                try {
                    const parsedData = JSON.parse(event.data);

                    // Update state with the newest payload for this specific event type
                    setEvents((prev) => ({
                        ...prev,
                        [eventName]: parsedData
                    }));
                } catch (e) {
                    console.error(`Failed to parse SSE data for ${eventName}:`, e);
                }
            });
        });

        // Cleanup function: Close the connection when the component unmounts
        return () => {
            eventSource.close();
            console.log('SSE Connection Closed');
        };
    }, [eventNames.join(',')]); // Re-run if the requested list of events changes

    return { events, isConnected };
}
