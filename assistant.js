// Wait until DOM is fully loaded
if (typeof window !== 'undefined') {
  function typeMessage(element, text, speed=20) {
    let i = 0;
    element.textContent = "";
    
    function typing(){
      if(i < text.length){
        element.textContent += text.charAt(i);
        i++;
        setTimeout(typing, speed)
      }
    }

    typing()
  }

  function cleanTypography(text) {
    // First, replace **text** with bold HTML
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Replace menu labels with bold
      .replace(/Item Name:/g, '<strong>Item Name:</strong>')
      .replace(/Category:/g, '<strong>Category:</strong>')
      .replace(/Description:/g, '<strong>Description:</strong>')
      .replace(/Price:/g, '<strong>Price:</strong>')
      .replace(/Dietary Information:/g, '<strong>Dietary Information:</strong>')
      .replace(/Popular:/g, '<strong>Popular:</strong>')
      .replace(/Spice Level:/g, '<strong>Spice Level:</strong>')
      .replace(/Serves:/g, '<strong>Serves:</strong>')
      .replace(/Restaurant Information:/g, '<strong>Restaurant Information:</strong>')
      .replace(/Address:/g, '<strong>Address:</strong>')
      .replace(/Phone:/g, '<strong>Phone:</strong>')
      .replace(/Email:/g, '<strong>Email:</strong>')
      .replace(/Working Hours:/g, '<strong>Working Hours:</strong>')
      .replace(/Cuisine:/g, '<strong>Cuisine:</strong>')
      .replace(/Chef:/g, '<strong>Chef:</strong>')
      .replace(/Reservation Policy:/g, '<strong>Reservation Policy:</strong>')
      .replace(/Days Available:/g, '<strong>Days Available:</strong>')
      .replace(/Time Slots:/g, '<strong>Time Slots:</strong>')
      .replace(/Booking Notice:/g, '<strong>Booking Notice:</strong>')
      .replace(/Maximum Party Size:/g, '<strong>Maximum Party Size:</strong>')
      .replace(/Deposit Required:/g, '<strong>Deposit Required:</strong>')
      .replace(/Happy Hour:/g, '<strong>Happy Hour:</strong>')
      .replace(/Daily Specials:/g, '<strong>Daily Specials:</strong>')
      .replace(/Average Rating:/g, '<strong>Average Rating:</strong>')
      .replace(/Total Reviews:/g, '<strong>Total Reviews:</strong>')
      .replace(/### (.*?)(?:\n|$)/g, '<strong>$1</strong><br>');
    
    // Format bullet points - convert • to proper list items
    const lines = formatted.split('\n');
    let inList = false;
    let listItems = [];
    let result = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check if line starts with bullet point (• or *)
      if (line.startsWith('•') || line.startsWith('*') || line.startsWith('-')) {
        if (!inList) {
          inList = true;
          listItems = [];
        }
        // Remove the bullet and clean up
        const itemText = line.replace(/^[•*\-]\s*/, '').trim();
        if (itemText) {
          listItems.push(itemText);
        }
      } else {
        // If we were in a list, output it now
        if (inList) {
          if (listItems.length > 0) {
            result.push('<ul class="menu-list">');
            listItems.forEach(item => {
              result.push(`<li class="menu-list-item">${item}</li>`);
            });
            result.push('</ul>');
          }
          inList = false;
          listItems = [];
        }
        
        // Add non-list line
        if (line) {
          result.push(line);
        }
      }
    }
    
    // Handle list at end of text
    if (inList && listItems.length > 0) {
      result.push('<ul class="menu-list">');
      listItems.forEach(item => {
        result.push(`<li class="menu-list-item">${item}</li>`);
      });
      result.push('</ul>');
    }
    
    return result.join('\n');
  }

  // Use this for Next.js compatibility
  const initAssistant = function() {

    // ======================
    // CREATE STYLES
    // ======================
    const style = document.createElement("style");
    style.innerHTML = `
    #ai-container {
      position: fixed;
      bottom: 30px;
      right: 20px;
      background: rgba(0, 0, 0, 0.7);
      width: 243px;
      height: 72px;
      padding: 8px;
      border-radius: 20px;
      transition: all 0.4s ease;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      display: flex;
      flex-direction: column;
      align-items: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      z-index: 9999;
    }
  
    #ai-container.expanded {
      width: 380px;
      height: 600px;
      border-radius: 20px;
      flex-direction: column;
      padding: 6px;
    }
  
    #ai-open-btn {
      background: rgba(255, 255, 255, 0.8);
      color: #000;
      border: none;
      padding: 9px 18px;
      border-radius: 10px;
      cursor: pointer;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: normal; 
      transition: transform 0.2s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      width: 100%;
      justify-content: center;
    }
  
    #ai-open-btn:hover {
      transform: scale(1.01);
    }
  
    #ai-content {
      display: none;
      width: 100%;
      height: 100%;
      flex-direction: column;
    }
  
    #ai-container.expanded #ai-content {
      display: flex;
    }
  
    #ai-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 7px;
      color: #fff;
      border: none;
      font-weight: bold;
    }
  
    #ai-close {
      border: none;
      color: #fff;
      cursor: pointer;
      width: 22px;
      height: 22px;
    }
  
    #ai-messages {
      flex: 1;
      padding: 15px;
      overflow-y: scroll;
      color: white;
      font-size: 14px;
      max-height: 450px;
    }
    #ai-messages::-webkit-scrollbar{
        display: none;
    }
  
    #ai-input-area {
      position: absolute;
      bottom: 10px;
      width: 92%;
      display: flex;
      align-items: center;
      padding: 8px;
      border: none;
      background: rgba(255, 255, 255, 0.6);
      border-radius: 15px;
    }
  
    #ai-input {
      flex: 1;
      height: 40px;
      border-radius: 8px;
      border: none;
      color: black;
      outline: none;
      width: 150px;
      background: transparent;
      font-size: 14px;
    }
  
    #ai-send {
      color: black;
      border: transparent;
      padding: 8px 15px;
      border-radius: 20px;
      margin-left: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    #company {
        color:rgb(250, 250, 250);
        font-size: 10px;
        margin-bottom: 4px;
        margin-top: 2px;
    }
    #icons {
        width: 20px;
    }
    #header{
        display: flex;
        align-items: center;
        gap: 6px;
    }
    #header img{
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
    }
    #ai-open-btn img{
        width: 20px;
        height: 20px;
        border-radius: 50%;
        object-fit: cover;
    }
    #salutation {
      transition: transform 0.7s ease, opacity 0.5s ease;
    }
    #salutation.slide-out {
      transform: translateX(-100%);
      opacity: 0;
      height: 0;
    }
    #CTA {
        display: flex; 
        align-items: center; 
        gap: 13px; 
        color: #333; 
        background-color: rgba(255, 255, 255, 0.7); 
        padding: 10px; 
        border-radius: 10px; 
        cursor: pointer;
        transition: 0.3s ease;
    }
    #CTA:hover{
        transform: scale(1.02)
    }

    /* Menu item card styles */
    .menu-card {
      margin-bottom: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      padding-bottom: 15px;
    }
    
    .menu-card:last-child {
      border-bottom: none;
    }
    
    .menu-featured-image {
      width: 100%;
      height: 160px;
      border-top-left-radius: 10px;
      border-top-right-radius: 10px;
      object-fit: cover;
      margin-bottom: 12px;
      cursor: pointer;
      transition: opacity 0.5s ease-in;
      opacity: 0;
      animation: fadeIn 0.8s ease-in forwards;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    .menu-details {
      padding: 0 5px;
    }
    
    .menu-item-name {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 8px;
      color: #333;
    }
    
    .menu-detail-item {
      margin-bottom: 5px;
      font-size: 13px;
      color: #333;
    }
    
    .menu-detail-item strong {
      font-weight: 600;
      margin-right: 5px;
    }
    
    .menu-image-gallery {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      margin-top: 10px;
      justify-content: flex-start;
    }
    
    .menu-thumbnail {
      width: 50px;
      height: 50px;
      border-radius: 5px;
      object-fit: cover;
      cursor: pointer;
      border: 1px solid rgba(255, 255, 255, 0.3);
      transition: transform 0.2s ease;
    }
    
    .menu-thumbnail:hover {
      transform: scale(1.1);
      border-color: #007bff;
    }
    
    .image-viewer-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.9);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    }
    
    .image-viewer-content {
      position: relative;
      max-width: 90%;
      max-height: 90%;
    }
    
    .image-viewer-content img {
      width: 100%;
      height: auto;
      max-height: 80vh;
      object-fit: contain;
    }
    
    .close-viewer {
      position: absolute;
      top: -30px;
      right: 0;
      color: white;
      font-size: 30px;
      cursor: pointer;
      background: none;
      border: none;
    }
    
    /* Clean typography styles */
    .clean-typography {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.5;
    }
    
    .clean-typography strong {
      font-weight: 600;
      color: #333;
    }
    
    .clean-typography ul, .clean-typography ol {
      padding-left: 20px;
      margin: 5px 0;
    }
    
    .clean-typography li {
      color: #333;
      font-size: 13px;
      margin-bottom: 3px;
    }
    
    .menu-detail-item {
      margin-bottom: 5px;
      font-size: 13px;
      color: #333;
    }
    
    .menu-detail-item strong {
      font-weight: 600;
      margin-right: 5px;
    }

    /* List styles */
    .menu-list {
      margin: 8px 0;
      padding-left: 20px;
      list-style-type: disc;
    }
    
    .menu-list-item {
      font-size: 13px;
      color: #333;
      margin-bottom: 4px;
      line-height: 1.4;
    }

    /* ====================== */
    /* RESPONSIVE STYLES */
    /* ====================== */
    
    /* For tablets and small desktops */
    @media (max-width: 768px) {
      #ai-container.expanded {
        width: 340px;
        height: 550px;
        right: 15px;
        bottom: 25px;
      }
      
      #ai-messages {
        max-height: 400px;
        padding: 12px;
      }
      
      .menu-featured-image {
        height: 140px;
      }
      
      .menu-item-name {
        font-size: 15px;
      }
      
      .menu-detail-item {
        font-size: 12px;
      }
      
      .menu-list-item {
        font-size: 12px;
      }
      
      #CTA {
        padding: 8px;
        gap: 10px;
      }
      
      #CTA img {
        width: 30px;
        height: 30px;
      }
    }
    
    /* For mobile phones */
    @media (max-width: 480px) {
      #ai-container {
        width: 210px;
        height: 65px;
        bottom: 20px;
        right: 15px;
      }
      
      #ai-container.expanded {
        width: 300px;
        height: 500px;
        right: 10px;
        bottom: 20px;
        padding: 4px;
      }
      
      #ai-open-btn {
        padding: 7px 14px;
        font-size: 11px;
        gap: 6px;
      }
      
      #ai-open-btn img {
        width: 18px;
        height: 18px;
      }
      
      #ai-header {
        padding: 5px;
      }
      
      #header img {
        width: 35px;
        height: 35px;
      }
      
      #ai-header h3 {
        font-size: 14px;
      }
      
      #ai-close {
        width: 20px;
        height: 20px;
      }
      
      #ai-messages {
        max-height: 350px;
        padding: 10px;
        font-size: 13px;
      }
      
      #ai-input-area {
        padding: 6px;
        width: 94%;
      }
      
      #ai-input {
        height: 35px;
        font-size: 13px;
        padding: 0 10px;
      }
      
      #ai-send {
        padding: 6px 12px;
      }
      
      #ai-send img {
        width: 18px;
        height: 18px;
      }
      
      #salutation > div:first-child {
        font-size: 22px !important;
      }
      
      #salutation > div:last-child {
        margin-top: 30px !important;
        gap: 4px !important;
      }
      
      #CTA {
        padding: 6px;
        gap: 8px;
      }
      
      #CTA img {
        width: 25px;
        height: 25px;
      }
      
      #CTA div {
        font-size: 12px;
      }
      
      .menu-featured-image {
        height: 120px;
      }
      
      .menu-details {
        padding: 0 3px;
      }
      
      .menu-item-name {
        font-size: 14px;
        margin-bottom: 5px;
      }
      
      .menu-detail-item {
        font-size: 11px;
        margin-bottom: 3px;
      }
      
      .menu-list {
        padding-left: 15px;
        margin: 5px 0;
      }
      
      .menu-list-item {
        font-size: 11px;
        margin-bottom: 2px;
      }
      
      .menu-image-gallery {
        gap: 3px;
        margin-top: 8px;
      }
      
      .menu-thumbnail {
        width: 40px;
        height: 40px;
      }
      
      #company {
        font-size: 9px;
        margin-bottom: 2px;
      }
      
      .image-viewer-content {
        max-width: 95%;
      }
      
      .close-viewer {
        top: -25px;
        font-size: 25px;
      }
    }
    
    /* For very small phones */
    @media (max-width: 360px) {
      #ai-container.expanded {
        width: 270px;
        height: 480px;
        right: 8px;
        bottom: 15px;
      }
      
      #ai-messages {
        max-height: 320px;
      }
      
      #salutation > div:first-child {
        font-size: 20px !important;
      }
      
      .menu-featured-image {
        height: 100px;
      }
      
      .menu-thumbnail {
        width: 35px;
        height: 35px;
      }
      
      #CTA {
        padding: 5px;
      }
      
      #CTA img {
        width: 22px;
        height: 22px;
      }
      
      #CTA div {
        font-size: 11px;
      }
    }
    
    /* Landscape orientation for mobile */
    @media (max-width: 768px) and (orientation: landscape) {
      #ai-container.expanded {
        height: 400px;
        width: 360px;
      }
      
      #ai-messages {
        max-height: 280px;
      }
      
      .menu-featured-image {
        height: 100px;
      }
    }
    
    /* High-resolution tablets */
    @media (min-width: 769px) and (max-width: 1024px) {
      #ai-container.expanded {
        width: 360px;
        height: 580px;
      }
      
      .menu-featured-image {
        height: 150px;
      }
    }
    `;
    document.head.appendChild(style);
  
  
    // ======================
    // CREATE STRUCTURE
    // ======================
    const container = document.createElement("div");
    container.id = "ai-container";

    const company = document.createElement('small');
    company.id = 'company';
    company.innerHTML = "Powered By Prime Nest Bistro";
  
    const openBtn = document.createElement("button");
    openBtn.id = "ai-open-btn";
    openBtn.innerHTML = `
        <img src="./assets/houses/logo.jpg" onerror="this.src='data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%3E%3Ccircle%20cx%3D%2210%22%20cy%3D%2210%22%20r%3D%2210%22%20fill%3D%22%23333%22%2F%3E%3C%2Fsvg%3E'" />
        <div>Prime Nest Bistro Assistant</div>
    `;
  
    const content = document.createElement("div");
    content.id = "ai-content";
  
    content.innerHTML = `
      <div id="ai-header">
        <div id="header">
         <img src="./assets/houses/logo.jpg" onerror="this.src='data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%3E%3Ccircle%20cx%3D%2220%22%20cy%3D%2220%22%20r%3D%2220%22%20fill%3D%22%23333%22%2F%3E%3C%2Fsvg%3E'" />
         Bistro Assistant
        </div>
        <div>
          <img id="ai-close" src="./assets/icons/close.svg" onerror="this.src='data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2222%22%20height%3D%2222%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22black%22%20stroke-width%3D%222%22%3E%3Cline%20x1%3D%2218%22%20y1%3D%226%22%20x2%3D%226%22%20y2%3D%2218%22%3E%3C%2Fline%3E%3Cline%20x1%3D%226%22%20y1%3D%226%22%20x2%3D%2218%22%20y2%3D%2218%22%3E%3C%2Fline%3E%3C%2Fsvg%3E'" alt="close" />
        </div>
      </div>
      <div id="ai-messages">
        <div id="salutation">
            <div style="font-size: 26px; color: #fff;">How can I help you today?</div>
            <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 44px;">
                <div id="CTA" data-query="What are your most popular dishes?">
                    <img style="width: 35px; height: 35px; object-fit: cover; border-radius: 5px;" src="./assets/menu/mains/nyama-choma.jpg" onerror="this.src='data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2235%22%20height%3D%2235%22%20viewBox%3D%220%200%2035%2035%22%3E%3Crect%20width%3D%2235%22%20height%3D%2235%22%20fill%3D%22%23cccccc%22%2F%3E%3C%2Fsvg%3E'" alt=""/>
                    What are your most popular dishes?
                </div>
                <div id="CTA" data-query="Do you have vegetarian or vegan options?">
                    <img style="width: 35px; height: 35px; object-fit: cover; border-radius: 5px;" src="./assets/menu/starters/prawns.jpg" onerror="this.src='data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2235%22%20height%3D%2235%22%20viewBox%3D%220%200%2035%2035%22%3E%3Crect%20width%3D%2235%22%20height%3D%2235%22%20fill%3D%22%23cccccc%22%2F%3E%3C%2Fsvg%3E'" alt=""/>
                    Do you have vegetarian or vegan options?
                </div>
                <div id="CTA" data-query="What are your daily specials?">
                    <img style="width: 35px; height: 35px; object-fit: cover; border-radius: 5px;" src="./assets/menu/starters/samosas.jpg" onerror="this.src='data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2235%22%20height%3D%2235%22%20viewBox%3D%220%200%2035%2035%22%3E%3Crect%20width%3D%2235%22%20height%3D%2235%22%20fill%3D%22%23cccccc%22%2F%3E%3C%2Fsvg%3E'" alt=""/>
                    What are your daily specials?
                </div>
                <div id="CTA" data-query="I'd like to make a reservation for dinner">
                    <img style="width: 35px; height: 35px; object-fit: cover; border-radius: 5px;" src="./assets/menu/mains/vegetable-pilau.jpg" onerror="this.src='data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2235%22%20height%3D%2235%22%20viewBox%3D%220%200%2035%2035%22%3E%3Crect%20width%3D%2235%22%20height%3D%2235%22%20fill%3D%22%23cccccc%22%2F%3E%3C%2Fsvg%3E'" alt=""/>
                    I'd like to make a reservation for dinner
                </div>
            </div>
        </div>
      </div>
      <div id="ai-input-area">
        <input id="ai-input" placeholder="Ask about menu, reservations, specials..." />
        <div id="ai-send">
          <img src="./assets/icons/send.svg" onerror="this.src='data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2222%22%20height%3D%2222%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22black%22%20stroke-width%3D%222%22%3E%3Cline%20x1%3D%2222%22%20y1%3D%222%22%20x2%3D%2211%22%20y2%3D%2213%22%3E%3C%2Fline%3E%3Cpolygon%20points%3D%2222%202%2015%2022%2011%2013%202%209%2022%202%22%3E%3C%2Fpolygon%3E%3C%2Fsvg%3E'" alt="send" style="width: 22px; height: 22px;" />
        </div>
      </div>
    `;
    
    container.appendChild(company);
    container.appendChild(openBtn);
    container.appendChild(content);
    document.body.appendChild(container);
  
    // ======================
    // CHAT STATE
    // ======================
    let sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    let messageHistory = [];
    let isWaitingForResponse = false;

    // Load message history from sessionStorage (clears on page refresh)
    const savedHistory = sessionStorage.getItem('primeNestChatHistory');
    if (savedHistory) {
      messageHistory = JSON.parse(savedHistory);
    }

    // ======================
    // API FUNCTION
    // ======================
    async function sendToAI(query) {
      try {
        const response = await fetch('http://localhost:5000/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: query,
            sessionId: sessionId,
            history: messageHistory
          })
        });

        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error calling AI:', error);
        return {
          reply: "Sorry, I'm having trouble connecting to the server. Please try again.",
          images: []
        };
      }
    }

    // ======================
    // IMAGE VIEWER FUNCTION
    // ======================
    function showImageViewer(imageUrl) {
      const viewer = document.createElement('div');
      viewer.className = 'image-viewer-modal';
      viewer.innerHTML = `
        <div class="image-viewer-content">
          <button class="close-viewer">&times;</button>
          <img src="${imageUrl}" alt="Menu item image" />
        </div>
      `;
      
      viewer.querySelector('.close-viewer').addEventListener('click', () => {
        viewer.remove();
      });
      
      viewer.addEventListener('click', (e) => {
        if (e.target === viewer) {
          viewer.remove();
        }
      });
      
      document.body.appendChild(viewer);
    }

    // ======================
    // EXTRACT IMAGES FROM TEXT
    // ======================
    function extractImagesFromText(text) {
      const images = [];
      // Match markdown image links: [View Image](url)
      const markdownRegex = /\[.*?\]\((https?:\/\/[^\s)]+\.(jpg|jpeg|png|gif|webp))\)/gi;
      // Also match direct URLs
      const urlRegex = /(https?:\/\/[^\s)]+\.(jpg|jpeg|png|gif|webp))/gi;
      
      let match;
      while ((match = markdownRegex.exec(text)) !== null) {
        images.push(match[1]);
      }
      
      // If no markdown images found, try direct URLs
      if (images.length === 0) {
        while ((match = urlRegex.exec(text)) !== null) {
          images.push(match[1]);
        }
      }
      
      return images;
    }

    // ======================
    // PARSE MENU ITEM NAME FROM TEXT
    // ======================
    function extractMenuItemName(text) {
      const menuMatch = text.match(/(?:Grilled Peri-Peri Prawns|Samosas Trio|Mushroom Crostini|Nyama Choma Platter|Coconut Fish Curry|Beef Wellington|Vegetable Pilau|Chocolate Lava Cake|Malva Pudding|Fresh Fruit Platter|Fresh Passion Juice|Dawa Cocktail|Kenyan Coffee|Item Name:?\s*([^\n]+))/i);
      if (menuMatch) {
        return menuMatch[1] || menuMatch[0];
      }
      return "Menu Item Details";
    }

    // ======================
    // CLEAN TEXT BY REMOVING IMAGE LINKS
    // ======================
    function removeImageLinks(text) {
      return text.replace(/\[.*?\]\((https?:\/\/[^\s)]+\.(jpg|jpeg|png|gif|webp))\)/gi, '')
                 .replace(/Menu Images?:?\s*\n?/gi, '')
                 .replace(/\n{3,}/g, '\n\n');
    }

    // ======================
    // RENDER MESSAGE
    // ======================
    function renderMessage(text, sender, images = []) {
      const messages = document.getElementById('ai-messages');
      const messageDiv = document.createElement('div');
      messageDiv.style.marginBottom = "15px";
      
      if (sender === 'user') {
        messageDiv.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: right; gap: 7px;">
            <span style="border:2px solid rgba(255, 255, 255, 0.7);color:white;padding:8px 15px;border-radius:15px;max-width:70%;">${text}</span>
            <img src="./assets/menu/beverages/coffee.jpg" onerror="this.src='data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2230%22%20height%3D%2230%22%20viewBox%3D%220%200%2030%2030%22%3E%3Ccircle%20cx%3D%2215%22%20cy%3D%2215%22%20r%3D%2215%22%20fill%3D%22%23cccccc%22%2F%3E%3C%2Fsvg%3E'" alt="" style="width: 30px; height: 30px; border-radius: 50%;object-fit: cover;" />
          </div>
        `;
        messages.appendChild(messageDiv);
      } else {
        // Create message container
        const messageContainer = document.createElement('div');
        messageContainer.style.display = "flex";
        messageContainer.style.justifyContent = "flex-start";
        messageContainer.style.marginBottom = "10px";
        
        // Create bubble
        const bubble = document.createElement('div');
        bubble.style.backgroundColor = "rgba(255, 255, 255, 0.7)";
        bubble.style.color = "#333";
        bubble.style.padding = "0px";
        bubble.style.borderRadius = "15px";
        bubble.style.maxWidth = "100%";
        bubble.style.fontSize = "14px";
        bubble.style.lineHeight = "1.5";
        bubble.style.animation = "fadeIn 0.8s ease-in forwards";
        
        // Use provided images or extract from text
        let allImages = images;
        if (!allImages || allImages.length === 0) {
          allImages = extractImagesFromText(text);
        }
        
        // Clean text by removing image links and applying typography
        let cleanText = removeImageLinks(text);
        
        // Apply typography cleaning
        const formattedText = cleanTypography(cleanText);
        
        // Create menu card container
        const menuContainer = document.createElement('div');
        menuContainer.className = 'menu-container';
        
        // Add featured image if available
        if (allImages && allImages.length > 0) {
          const featuredImg = document.createElement('img');
          featuredImg.src = allImages[0];
          featuredImg.className = 'menu-featured-image';
          featuredImg.onerror = function() { this.style.display = 'none'; };
          featuredImg.addEventListener('click', () => showImageViewer(allImages[0]));
          menuContainer.appendChild(featuredImg);
        }
        
        // Add menu details with formatted text
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'menu-details';
        detailsDiv.style.padding = '9px';
        detailsDiv.innerHTML = formattedText;
        menuContainer.appendChild(detailsDiv);
        
        // Add image gallery for remaining images
        if (allImages && allImages.length > 1) {
          const gallery = document.createElement('div');
          gallery.className = 'menu-image-gallery';
          gallery.style.padding = '9px';
          
          for (let i = 1; i < allImages.length; i++) {
            const thumb = document.createElement('img');
            thumb.src = allImages[i];
            thumb.className = 'menu-thumbnail';
            thumb.onerror = function() { this.style.display = 'none'; };
            thumb.addEventListener('click', () => showImageViewer(allImages[i]));
            gallery.appendChild(thumb);
          }
          
          menuContainer.appendChild(gallery);
        }
        
        bubble.appendChild(menuContainer);
        messageContainer.appendChild(bubble);
        messages.appendChild(messageContainer);
      }
      
      messages.scrollTop = messages.scrollHeight;
    }

    // ======================
    // SEND MESSAGE FUNCTION
    // ======================
    async function sendMessage() {
      if (isWaitingForResponse) return;
      
      const hidden = document.getElementById("salutation");
      if (hidden && !hidden.classList.contains('slide-out')) {
        hidden.classList.add("slide-out");
      }
      
      const input = document.getElementById("ai-input");
      const messages = document.getElementById("ai-messages");
      
      if (!input || !messages) return;
      if (!input.value.trim()) return;
      
      const userQuery = input.value.trim();
      isWaitingForResponse = true;
      
      // Render user message
      renderMessage(userQuery, 'user');
      
      // Add user message to history with empty images array
      messageHistory.push({ sender: 'user', text: userQuery, images: [] });
      sessionStorage.setItem('primeNestChatHistory', JSON.stringify(messageHistory));
      
      // Clear input
      input.value = "";
      
      // Show typing indicator
      const typingIndicator = document.createElement('div');
      typingIndicator.id = 'typing-indicator';
      typingIndicator.style.marginBottom = "10px";
      typingIndicator.style.marginLeft = "-10px";
      
      const typingBubble = document.createElement('div');
      typingBubble.innerHTML = '<img src="./assets/icons/output-onlinegiftools (2).gif" onerror="this.src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2230%22%20height%3D%2230%22%20viewBox%3D%220%200%2030%2030%22%3E%3Ccircle%20cx%3D%2215%22%20cy%3D%2215%22%20r%3D%2215%22%20fill%3D%22%23cccccc%22%2F%3E%3C%2Fsvg%3E"" alt="" style="width: 120px;"></img>'
      
      typingIndicator.appendChild(typingBubble);
      messages.appendChild(typingIndicator);
      messages.scrollTop = messages.scrollHeight;
      
      // Call AI
      const response = await sendToAI(userQuery);
      
      // Remove typing indicator
      document.getElementById('typing-indicator')?.remove();
      
      // Render assistant response with images
      renderMessage(response.reply, 'assistant', response.images || []);
      
      // Add assistant message to history WITH IMAGES
      messageHistory.push({ 
        sender: 'assistant', 
        text: response.reply, 
        images: response.images || [] 
      });
      sessionStorage.setItem('primeNestChatHistory', JSON.stringify(messageHistory));
      
      isWaitingForResponse = false;
      messages.scrollTop = messages.scrollHeight;
    }
  
    // ======================
    // EVENTS
    // ======================
  
    // Open
    openBtn.addEventListener("click", function () {
      container.classList.add("expanded");
      openBtn.style.display = "none";
      
      // Restore message history if exists
      if (messageHistory.length > 0) {
        const messages = document.getElementById("ai-messages");
        const salutation = document.getElementById("salutation");
        if (salutation) salutation.style.display = 'none';
        
        // Clear default greeting
        messages.innerHTML = '';
        
        // Re-render all messages from history WITH IMAGES
        messageHistory.forEach(msg => {
          // Pass the stored images when rendering
          renderMessage(msg.text, msg.sender, msg.images || []);
        });
      }
    });
  
    // Close
    document.addEventListener("click", function (e) {
      if (e.target && e.target.id === "ai-close") {
        container.classList.remove("expanded");
        openBtn.style.display = "flex";
      }
    });
  
    // Send button click
    document.getElementById("ai-send").addEventListener("click", function (e) {
      e.stopPropagation();
      sendMessage();
    });
  
    // Enter key
    document.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && document.getElementById("ai-input") === document.activeElement) {
        e.preventDefault();
        sendMessage();
      }
    });
  
    // Add click handlers for CTA buttons
    setTimeout(() => {
      const ctaButtons = document.querySelectorAll('#CTA');
      ctaButtons.forEach((cta) => {
        cta.addEventListener('click', function() {
          const input = document.getElementById('ai-input');
          const query = this.getAttribute('data-query') || this.innerText.trim();
          
          if (input) {
            input.value = query;
            sendMessage();
          }
        });
      });
    }, 1000);
  };

  // Run the initialization when the DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAssistant);
  } else {
    initAssistant();
  }
}