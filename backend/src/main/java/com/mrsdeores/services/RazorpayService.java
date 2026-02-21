package com.mrsdeores.services;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;

@Service
public class RazorpayService {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    private RazorpayClient client;

    @PostConstruct
    public void init() throws RazorpayException {
        // Initialize Razorpay client with API keys
        this.client = new RazorpayClient(keyId, keySecret);
    }

    /**
     * Creates an order seamlessly via Razorpay.
     * 
     * @param amount  The total amount in rupees. The method automatically
     *                multiplies by 100 for paise.
     * @param receipt The local application's order id or receipt reference.
     * @return The Razorpay Order object which contains the `razorpay_order_id`
     *         string.
     */
    public Order createOrder(BigDecimal amount, String receipt) throws RazorpayException {
        JSONObject orderRequest = new JSONObject();
        // Convert to paise (multiplied by 100)
        long amountInPaise = amount.multiply(new BigDecimal("100")).longValue();

        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", receipt);

        // This makes the remote curl to api.razorpay.com/v1/orders
        return client.orders.create(orderRequest);
    }

    /**
     * Verifies the HMAC-SHA256 signature returned from Frontend callbacks or
     * Webhook payloads
     */
    public boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", orderId);
            options.put("razorpay_payment_id", paymentId);
            options.put("razorpay_signature", signature);

            return Utils.verifyPaymentSignature(options, keySecret);
        } catch (RazorpayException e) {
            e.printStackTrace();
            return false;
        }
    }
}
