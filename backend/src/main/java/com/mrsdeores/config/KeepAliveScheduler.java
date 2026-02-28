package com.mrsdeores.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.net.HttpURLConnection;
import java.net.URL;

@Component
public class KeepAliveScheduler {

    private static final Logger logger = LoggerFactory.getLogger(KeepAliveScheduler.class);

    @Value("${app.self-ping-url:https://mrsdeore-premix.onrender.com/health}")
    private String selfPingUrl;

    // Pings every 10 minutes (600000 ms)
    @Scheduled(fixedRate = 600000)
    public void keepAlive() {
        try {
            logger.info("Keeping application alive. Pinging: {}", selfPingUrl);
            URL url = new URL(selfPingUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(10000); // 10 seconds timeout
            connection.setReadTimeout(10000);
            int responseCode = connection.getResponseCode();
            logger.info("Self-ping successful. Status: {}", responseCode);
            connection.disconnect();
        } catch (Exception e) {
            logger.error("Self-ping failed: {}", e.getMessage());
        }
    }
}
