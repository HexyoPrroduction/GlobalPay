// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {

    // --- Get DOM Elements ---
    const buyButton = document.getElementById('login-btn'); // ID is login-btn in HTML
    const sellButton = document.getElementById('register-btn'); // ID is register-btn in HTML
    const overlay = document.getElementById('popup-overlay');
    const popup = document.getElementById('verification-popup');
    const acceptButton = document.getElementById('accept-btn');
    const declineButton = document.getElementById('decline-btn');
    const popupMessage = document.getElementById('popup-message');
    const popupActionSpan = popup.querySelector('.popup-action');
    const popupAmountSpan = popup.querySelector('.popup-amount');
  
    // --- Get Data (Potentially dynamic) ---
    // Find the info card elements - be specific if structure might change
    const amountElement = document.querySelector('.info-card:nth-child(1) .info-card__content'); // First card's content
    const currencyElement = document.querySelector('.info-card:nth-child(1) .info-card__meta'); // First card's meta
  
    let currentAction = null; // To store 'Buy' or 'Sell'
    let redirectUrl = null; // To store the target URL
  
    // --- Functions ---
    function openPopup(action) {
      currentAction = action;
      const amount = amountElement ? amountElement.textContent.trim() : 'N/A';
      const currency = currencyElement ? currencyElement.textContent.trim() : '';
  
      // Update popup content
      popupActionSpan.textContent = action; // Set 'Buy' or 'Sell'
      popupAmountSpan.textContent = `${amount} ${currency}`; // Set amount and currency
  
      // Define redirect URLs based on action (MODIFY THESE URLs)
      if (action === 'Buy') {
        redirectUrl = '/buy-confirmation-page'; // Replace with your actual Buy confirmation URL
      } else if (action === 'Sell') {
        redirectUrl = '/sell-confirmation-page'; // Replace with your actual Sell confirmation URL
      } else {
         redirectUrl = '/error-page'; // Fallback
      }
  
      // Show the popup and overlay
      overlay.classList.add('active');
      popup.classList.add('active');
      popup.setAttribute('aria-hidden', 'false'); // Make accessible
      overlay.setAttribute('aria-hidden', 'false'); // Make accessible (though less critical)
      document.body.classList.add('popup-open'); // Prevent body scroll
  
       // Focus the first interactive element in the popup (optional but good for accessibility)
      acceptButton.focus();
    }
  
    function closePopup() {
      overlay.classList.remove('active');
      popup.classList.remove('active');
      popup.setAttribute('aria-hidden', 'true'); // Hide from accessibility tree
      overlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('popup-open'); // Allow body scroll again
      currentAction = null; // Reset action
      redirectUrl = null; // Reset URL
    }
  
    // --- Event Listeners ---
    if (buyButton) {
      buyButton.addEventListener('click', () => {
        openPopup('Buy');
      });
    } else {
       console.error("Buy button (#login-btn) not found.");
    }
  
    if (sellButton) {
      sellButton.addEventListener('click', () => {
        openPopup('Sell');
      });
    } else {
        console.error("Sell button (#register-btn) not found.");
    }
  
  
    if (acceptButton) {
      acceptButton.addEventListener('click', () => {
        if (redirectUrl) {
          // Redirect the user
          window.location.href = redirectUrl;
          // Optionally show a loading indicator before redirecting
        } else {
          console.error("No redirect URL defined for action:", currentAction);
          closePopup(); // Close popup even if URL is missing
        }
      });
    } else {
        console.error("Accept button (#accept-btn) not found.");
    }
  
    if (declineButton) {
      declineButton.addEventListener('click', closePopup);
    } else {
        console.error("Decline button (#decline-btn) not found.");
    }
  
    // Optional: Close popup if overlay is clicked
    if (overlay) {
      overlay.addEventListener('click', closePopup);
    }
  
    // Optional: Close popup with Escape key
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && popup.classList.contains('active')) {
        closePopup();
      }
    });
  
  }); // End DOMContentLoaded
  
  
  
  
  
  document.addEventListener('DOMContentLoaded', () => {
      const editableElements = document.querySelectorAll('.info-card__content[data-field]');
      let originalValue = ''; // Store the original value before editing
  
      // --- WebSocket Connection ---
      // Change 'ws://localhost:8080' if your server runs elsewhere
      const socketUrl = `ws://${window.location.hostname}:8080`; // Assumes server is on same host, port 8080
      let ws;
  
      function connectWebSocket() {
          console.log('Attempting to connect WebSocket...');
          ws = new WebSocket(socketUrl);
  
          ws.onopen = () => {
              console.log('WebSocket connection established.');
          };
  
          ws.onmessage = (event) => {
              try {
                  const message = JSON.parse(event.data);
                  console.log('Message received:', message);
  
                  if (message.type === 'update' && message.payload) {
                      const { field, value } = message.payload;
                      const elementToUpdate = document.querySelector(`.info-card__content[data-field="${field}"]`);
                      if (elementToUpdate) {
                          if (elementToUpdate.textContent !== value && elementToUpdate.getAttribute('contenteditable') !== 'true') {
                             elementToUpdate.textContent = value;
                             console.log(`Updated field "${field}" to "${value}"`);
                          }
                      }
                  }
                   else if (message.type === 'initial_state' && message.payload) {
                       Object.entries(message.payload).forEach(([field, value]) => {
                           const elementToUpdate = document.querySelector(`.info-card__content[data-field="${field}"]`);
                           if (elementToUpdate) {
                              elementToUpdate.textContent = value;
                           }
                       });
                       console.log('Initial state received and applied.');
                   }
  
              } catch (error) {
                  console.error('Failed to parse message or update UI:', error);
              }
          };
  
          ws.onerror = (error) => {
              console.error('WebSocket error:', error);
          };
  
          ws.onclose = (event) => {
              console.log(`WebSocket connection closed: ${event.code} ${event.reason}. Reconnecting in 5 seconds...`);
              setTimeout(connectWebSocket, 5000);
          };
      }
  
      connectWebSocket();
  
      // --- Editing Logic ---
      editableElements.forEach(element => {
          element.addEventListener('dblclick', () => {
              if (element.getAttribute('contenteditable') === 'true' || !ws || ws.readyState !== WebSocket.OPEN) {
                  return;
              }
              originalValue = element.textContent;
              element.setAttribute('contenteditable', 'true');
              element.focus();
          });
  
          const finishEditing = (el) => {
              if (el.getAttribute('contenteditable') !== 'true') return;
  
              el.setAttribute('contenteditable', 'false');
              const newValue = el.textContent.trim();
              const field = el.dataset.field;
  
              if (newValue === '' || newValue === originalValue) {
                  el.textContent = originalValue;
                  console.log(`Edit cancelled or no change for field "${field}"`);
                  return;
              }
  
              if (ws && ws.readyState === WebSocket.OPEN && newValue !== originalValue) {
                   const updateMessage = {
                      type: 'update',
                      payload: {
                          field: field,
                          value: newValue
                      }
                   };
                  ws.send(JSON.stringify(updateMessage));
                  console.log(`Sent update for field "${field}": ${newValue}`);
              } else if (!ws || ws.readyState !== WebSocket.OPEN) {
                  console.warn('WebSocket not open. Update not sent.');
                  el.textContent = originalValue;
              }
          };
  
          element.addEventListener('blur', () => {
              finishEditing(element);
          });
  
          element.addEventListener('keydown', (event) => {
              if (event.key === 'Enter') {
                  event.preventDefault();
                  finishEditing(element);
              }
              else if (event.key === 'Escape') {
                  element.textContent = originalValue;
                  element.setAttribute('contenteditable', 'false');
                  console.log(`Edit cancelled by Escape for field "${element.dataset.field}"`);
              }
          });
      });
  
      // --- Popup Logic (Remains the same) ---
      const loginBtn = document.getElementById('login-btn');
      const registerBtn = document.getElementById('register-btn');
      const popupOverlay = document.getElementById('popup-overlay');
      const verificationPopup = document.getElementById('verification-popup');
      const popupMessage = document.getElementById('popup-message');
      const acceptBtn = document.getElementById('accept-btn');
      const declineBtn = document.getElementById('decline-btn');
      const amountElement = document.querySelector('.info-card__content[data-field="amount"]'); // Use data-field selector
  
      function showPopup(action) {
          let amount = "N/A";
          if (amountElement) {
              amount = amountElement.textContent; // Get current amount text
          } else {
               console.error("Amount element with data-field='amount' not found");
          }
  
          popupMessage.innerHTML = `Verify it's you by accepting the <span class="popup-action">${action}</span> transaction for <span class="popup-amount">${amount} NGN</span>.`;
          popupOverlay.style.display = 'block';
          verificationPopup.style.display = 'block';
          popupOverlay.setAttribute('aria-hidden', 'false');
          verificationPopup.setAttribute('aria-hidden', 'false');
          acceptBtn.focus();
      }
  
      function hidePopup() {
          popupOverlay.style.display = 'none';
          verificationPopup.style.display = 'none';
          popupOverlay.setAttribute('aria-hidden', 'true');
          verificationPopup.setAttribute('aria-hidden', 'true');
      }
  
      loginBtn?.addEventListener('click', () => showPopup('Buy'));
      registerBtn?.addEventListener('click', () => showPopup('Sell'));
      acceptBtn?.addEventListener('click', () => { console.log('Accepted'); hidePopup(); });
      declineBtn?.addEventListener('click', () => { console.log('Declined'); hidePopup(); });
      popupOverlay?.addEventListener('click', hidePopup);
      document.addEventListener('keydown', (event) => {
          if (event.key === 'Escape' && verificationPopup.getAttribute('aria-hidden') === 'false') {
              hidePopup();
          }
      });
  });