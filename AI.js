require("dotenv").config()
const express = require("express")
const cors = require("cors")
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

const app = express()

// Configure CORS properly
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json())

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Store conversation history in memory (clears on server restart)
const conversationHistory = new Map();

app.post("/chat", async(req, res) => {
    
    try {
        const { query, sessionId, history } = await req.body;
        
        if (!sessionId) {
            return res.status(400).json({ error: "Session ID is required" });
        }

        // Load restaurant data
        const filepath = path.join(process.cwd(), "data", "prime-nest.json");
        const jsonData = fs.readFileSync(filepath, "utf-8");
        const restaurantData = JSON.parse(jsonData);

        // Get or initialize conversation history for this session
        let conversationContext = "";
        if (history && history.length > 0) {
            // Use history from frontend
            conversationContext = history.map(msg => 
                `${msg.sender === 'user' ? 'Customer' : 'Assistant'}: ${msg.text}`
            ).join("\n");
        }

        // Process images for menu items to include URLs
        const baseUrl = req.get('origin'); // Change this to your actual domain in production
        
        // Process menu items with images
        const menuWithImages = restaurantData.menu.map(category => ({
            ...category,
            items: category.items.map(item => ({
                ...item,
                imageUrls: item.image ? [{
                    url: item.image,
                    fullUrl: `${baseUrl}${item.image}`
                }] : []
            }))
        }));

        // Process specials images if they have images
        const specialsWithImages = {
            ...restaurantData.specials,
            dailySpecials: restaurantData.specials.dailySpecials
        };

        const context = `
        You are a professional AI restaurant assistant for PrimeNest Bistro. Follow these rules strictly:

        1. Answer ONLY using the restaurant data provided below.
        2. If the information is not available, say politely that it is not listed.
        3. Be polite, professional, and friendly.
        4. When discussing menu items, ALWAYS include the image URLs from the menu data.
        5. Format your responses with clear sections and bullet points when appropriate.
        6. After answering, ask a relevant follow-up question to engage the customer (e.g., if they'd like to make a reservation, know about specials, etc.).
        7. For menu inquiries, provide:
           - Item name and category
           - Description
           - Price with currency
           - Dietary information if available
           - Whether it's popular or not
           - Include image links like: [View Image](image_url_here)
        8. For reservation inquiries, provide information about:
           - Available days and time slots
           - Booking notice required
           - Maximum party size
           - Any deposit requirements
        9. For specials, mention:
           - Happy hour details if applicable
           - Daily specials
        10. For restaurant information, provide:
            - Address and contact details
            - Working hours
            - Cuisine type
            - Chef information
        11. Only give info if the customer asked for it - for greetings only, greet back politely.
        12. Do not produces any tables.
        
        Conversation History (previous messages in this session):
        ${conversationContext || "No previous conversation."}
        
        Restaurant Data: ${JSON.stringify({
            company: restaurantData.company,
            menu: menuWithImages,
            specials: specialsWithImages,
            reviews: restaurantData.reviews
        }, null, 2)}
        
        Current Customer Question: ${query}
        
        Remember to maintain context from previous messages and don't repeat information already covered.
        `;

        const model = genAI.getGenerativeModel({model: "models/gemini-2.5-flash-lite-preview-09-2025"});
        const result = await model.generateContent(context);
        const response = result.response;
        const replyText = response.text();
        const cleanedReply = replyText.replace(/\[View Image\]\(.*?\)/g, '');

        // Parse the response to extract image URLs if present
        const imageUrls = extractImageUrls(replyText, menuWithImages);

        return res.json({
            reply: cleanedReply,
            images: imageUrls,
            sessionId: sessionId
        });
    } catch (error) {
        console.error(error);
        return res.json({
            reply: "Sorry, something went wrong. Please try again.",
            images: []
        });
    }
});

// Helper function to extract image URLs from the response
function extractImageUrls(text, menuData) {
    const urls = [];
    // Simple regex to find image URLs in markdown format [text](url)
    const markdownRegex = /\[.*?\]\((.*?)\)/g;
    let match;
    
    while ((match = markdownRegex.exec(text)) !== null) {
        const url = match[1];
        if (url.includes('/assets/menu/') && (url.endsWith('.jpg') || url.endsWith('.png'))) {
            urls.push(url);
        }
    }
    
    return urls;
}

// Optional: Add endpoint for reservations
app.post("/reservation", async(req, res) => {
    try {
        const { name, phone, email, date, time, partySize, specialRequests } = req.body;
        
        // Load restaurant data for validation
        const filepath = path.join(process.cwd(), "data", "prime-nest.json");
        const jsonData = fs.readFileSync(filepath, "utf-8");
        const restaurantData = JSON.parse(jsonData);
        
        // Validate against reservation policy
        const policy = restaurantData.company.reservationPolicy;
        
        // Check if time slot is available
        if (!policy.timeSlots.includes(time)) {
            return res.status(400).json({ 
                error: "Selected time slot is not available",
                availableSlots: policy.timeSlots 
            });
        }
        
        // Check party size
        if (partySize > policy.maxPartySize) {
            return res.status(400).json({ 
                error: `Party size exceeds maximum of ${policy.maxPartySize}` 
            });
        }
        
        // Here you would typically save to database
        // For now, just return success
        
        return res.json({
            success: true,
            message: "Reservation request received successfully",
            bookingDetails: {
                name,
                date,
                time,
                partySize,
                specialRequests
            }
        });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to process reservation" });
    }
});

app.listen(5000, () => {
    console.log('Server running in http://localhost:5000');
});