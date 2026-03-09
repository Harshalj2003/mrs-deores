package com.mrsdeores.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class RealTimeUpdateService {

    private static final Logger logger = LoggerFactory.getLogger(RealTimeUpdateService.class);

    // Thread-safe list to hold all active frontend connections
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    /**
     * Subscribe a new client to the real-time event stream.
     */
    public SseEmitter subscribe() {
        // Set timeout to 30 minutes (1,800,000 ms)
        SseEmitter emitter = new SseEmitter(1800000L);
        emitters.add(emitter);

        logger.info("New SSE client subscribed. Total active: {}", emitters.size());

        // Callbacks to clean up dead connections
        emitter.onCompletion(() -> removeEmitter(emitter));
        emitter.onTimeout(() -> removeEmitter(emitter));
        emitter.onError((e) -> removeEmitter(emitter));

        return emitter;
    }

    private void removeEmitter(SseEmitter emitter) {
        emitters.remove(emitter);
        logger.debug("SSE client disconnected. Total active: {}", emitters.size());
    }

    /**
     * Broadcast an event to ALL connected clients.
     * 
     * @param eventName The type of event (e.g., "PRODUCT_UPDATE")
     * @param data      The JSON data payload
     */
    public void broadcast(String eventName, Object data) {
        List<SseEmitter> deadEmitters = new java.util.ArrayList<>();

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name(eventName).data(data));
            } catch (IOException e) {
                // If sending fails, the client disconnected. Mark for removal.
                deadEmitters.add(emitter);
            }
        }

        emitters.removeAll(deadEmitters);
    }

    /**
     * Prevent Render/Firewalls from dropping idle connections.
     * Sends a tiny heartbeat ping every 45 seconds to keep the pipe open.
     */
    @Scheduled(fixedRate = 45000)
    public void keepConnectionsAlive() {
        if (!emitters.isEmpty()) {
            broadcast("PING", "keep-alive");
        }
    }
}
