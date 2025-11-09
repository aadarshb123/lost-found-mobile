// src/services/emailService.js
// Email notification service - React Native compatible version

// EmailJS Configuration
const EMAILJS_CONFIG = {
    serviceId: 'service_j0egmmj',
    templateId: 'template_kfud1k7',
    publicKey: 'NJwgAX3w_u71O6p3I',
  };
  
  // For demo - we'll log emails to console
  // When your friend builds the backend, replace the sendEmail function
  const USE_REAL_EMAIL = false; // Set to false for now (EmailJS doesn't work in React Native)
  
  /**
   * Send email notification when someone reports a lost item
   */
  export const sendLostItemConfirmation = async ({
    userEmail,
    userName,
    itemName,
    itemDescription,
    category = 'Not specified',
    location = 'Not specified',
  }) => {
    const emailData = {
      to_email: userEmail,
      user_name: userName,
      item_name: itemName,
      description: itemDescription,
      category: category,
      location: location,
    };
  
    return sendEmail(emailData, 'Lost Item Confirmation');
  };
  
  /**
   * Send email notification when someone reports finding an item
   */
  export const sendFoundItemConfirmation = async ({
    userEmail,
    userName,
    itemName,
    itemDescription = 'Not specified',
    category = 'Not specified',
    location,
  }) => {
    const emailData = {
      to_email: userEmail,
      user_name: userName,
      item_name: itemName,
      description: itemDescription,
      category: category,
      location: location,
    };
  
    return sendEmail(emailData, 'Found Item Confirmation');
  };
  
  /**
   * Send notification to user when a matching item is found
   * This is a DEMO function for testing notifications
   */
  export const sendMatchNotification = async ({
    userEmail,
    userName,
    itemName,
    itemDescription,
    category,
    location,
  }) => {
    const emailData = {
      to_email: userEmail,
      user_name: userName,
      item_name: itemName,
      description: itemDescription,
      category: category,
      location: location,
    };
  
    return sendEmail(emailData, 'Match Notification');
  };
  
  /**
   * Core email sending function
   * For React Native demo - logs to console
   * Replace this with your backend API when ready
   */
  async function sendEmail(emailData, emailType) {
    // DEMO MODE: Log to console (EmailJS doesn't work in React Native)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 EMAIL NOTIFICATION (DEMO MODE)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Type:', emailType);
    console.log('To:', emailData.to_email);
    console.log('User:', emailData.user_name);
    console.log('Item:', emailData.item_name);
    console.log('Category:', emailData.category);
    console.log('Location:', emailData.location);
    console.log('Description:', emailData.description);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Email would be sent to:', emailData.to_email);
    console.log('NOTE: Real emails require backend API');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { 
      success: true, 
      message: 'Demo notification logged to console' 
    };
  }
  
  /**
   * TO INTEGRATE WITH BACKEND:
   * 
   * When there is a backend API, replace the sendEmail function with:
   * 
   * async function sendEmail(emailData, emailType) {
   *   try {
   *     const response = await fetch('YOUR_BACKEND_URL/api/send-email', {
   *       method: 'POST',
   *       headers: {
   *         'Content-Type': 'application/json',
   *       },
   *       body: JSON.stringify({
   *         ...emailData,
   *         emailType: emailType,
   *         emailJsConfig: {
   *           serviceId: 'service_j0egmmj',
   *           templateId: 'template_kfud1k7',
   *           publicKey: 'NJwgAX3w_u71O6p3I'
   *         }
   *       }),
   *     });
   *     
   *     const result = await response.json();
   *     return result;
   *   } catch (error) {
   *     console.error('Email error:', error);
   *     return { success: false, message: error.message };
   *   }
   * }
   */