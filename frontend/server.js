import express from 'express';
import { isbot } from 'isbot';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import dotenv from 'dotenv';
import https from 'https';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5173;

// Configure axios to ignore self-signed certs (useful if backend uses them for dev)
const axiosInstance = axios.create({
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    // Important for speed: Set a timeout so bots don't hang if backend is slow
    timeout: 3000,
});

// The backend API URL (fallback to localhost for dev, but use Render URL in prod)
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:8080/api';
// The frontend URL (for og:url)
const FRONTEND_URL = process.env.VITE_FRONTEND_URL || 'https://mrs-deores.onrender.com';

// ----------------------------------------------------------------------
// 1. Crawler / Bot Detection Middleware (The "Meta Proxy")
// ----------------------------------------------------------------------
app.use(async (req, res, next) => {
    // Check if the requester is a bot (WhatsApp, Facebook, Twitter, iMessage, LinkedIn, etc.)
    // `isbot` covers thousands of recognized crawlers automatically.
    const isBot = isbot(req.get('user-agent'));

    if (isBot) {
        // If it's a bot AND they are visiting a specific product page: /product/123
        const productMatch = req.url.match(/^\/product\/(\d+)$/);

        if (productMatch) {
            const productId = productMatch[1];
            try {
                // Fetch product details from the backend IMMEDIATELY
                const response = await axiosInstance.get(`${API_BASE_URL}/products/${productId}`);
                const product = response.data;

                // Get the primary image or a fallback
                const images = product.images || [];
                const primaryImage = images.find((i) => i.isPrimary) || images[0];
                const imageUrl = primaryImage ? primaryImage.imageUrl : `${FRONTEND_URL}/og-image.png`;

                // Build a super lightweight HTML wrapper JUST for the bot.
                // We don't load React scripts here, so it is lightning fast for WhatsApp.
                const html = `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8" />
                        <title>${product.name} - Mrs. Deore Premix</title>
                        <meta name="description" content="${product.description.substring(0, 160)}..." />
                        
                        <!-- Open Graph / Meta Tags for WhatsApp, Facebook, LinkedIn -->
                        <meta property="og:title" content="${product.name} - Mrs. Deore Premix" />
                        <meta property="og:description" content="${product.description.substring(0, 160)}..." />
                        <meta property="og:image" content="${imageUrl}" />
                        <meta property="og:url" content="${FRONTEND_URL}/product/${productId}" />
                        <meta property="og:type" content="product" />
                        <meta property="og:site_name" content="Mrs. Deore Premix" />
                        
                        <!-- Twitter Card -->
                        <meta name="twitter:card" content="summary_large_image" />
                        <meta name="twitter:title" content="${product.name}" />
                        <meta name="twitter:description" content="${product.description.substring(0, 160)}..." />
                        <meta name="twitter:image" content="${imageUrl}" />
                    </head>
                    <body>
                        <p>Loading ${product.name}...</p>
                    </body>
                    </html>
                `;
                console.log(`[Crawler Served] Product ${productId} to ${req.get('user-agent')}`);
                return res.send(html);
            } catch (error) {
                console.error(`[Crawler Error] Failed to fetch product ${productId}:`, error.message);
                // If the fetch fails or times out, hand it over to the standard index.html
                // It will just show the generic website fallback.
                return next();
            }
        }
    }

    // If it's a normal human (or not a product page), continue to serve the React App
    next();
});

// ----------------------------------------------------------------------
// 2. Serve Static Files (Vite Build)
// ----------------------------------------------------------------------
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// For any other route, send the React index.html (SPA Fallback)
app.get(/.*/, (req, res) => {
    // If the index.html doesn't exist (e.g. they haven't built the frontend), send a basic error
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Application not built. Please run `npm run build` first.');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Serving static files from ${distPath}`);
});
