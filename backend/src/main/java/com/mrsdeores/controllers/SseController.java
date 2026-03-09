package com.mrsdeores.controllers;

import com.mrsdeores.services.RealTimeUpdateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/v1/stream")
public class SseController {

    private final RealTimeUpdateService updateService;

    @Autowired
    public SseController(RealTimeUpdateService updateService) {
        this.updateService = updateService;
    }

    /**
     * React clients will connect to GET /api/v1/stream using EventSource.
     * The connection remains open natively and pushes text/event-stream data.
     */
    @GetMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamUpdates(HttpServletResponse response) {
        // Prevent proxy buffering (Ngrok, Render, Nginx) from swallowing events
        response.setHeader("X-Accel-Buffering", "no");
        response.setHeader("Cache-Control", "no-cache");
        response.setHeader("Connection", "keep-alive");

        return updateService.subscribe();
    }
}
