export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// URL validation
export function validateUrl(url: string): ValidationResult {
  if (!url.trim()) {
    return { isValid: true }; // Empty is OK, just not filled yet
  }

  // Add protocol if missing for validation
  let testUrl = url;
  if (!testUrl.match(/^https?:\/\//i) && !testUrl.startsWith('//')) {
    testUrl = 'https://' + testUrl;
  }

  try {
    const parsed = new URL(testUrl);
    if (!parsed.hostname.includes('.')) {
      return { isValid: false, error: 'Please enter a valid URL with a domain' };
    }
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Please enter a valid URL' };
  }
}

// Email validation
export function validateEmail(email: string): ValidationResult {
  if (!email.trim()) {
    return { isValid: true }; // Empty is OK
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  return { isValid: true };
}

// Phone validation
export function validatePhone(phone: string): ValidationResult {
  if (!phone.trim()) {
    return { isValid: true }; // Empty is OK
  }

  // Remove common formatting characters for validation
  const cleaned = phone.replace(/[\s\-\(\)\.\+]/g, '');

  if (!/^\d{7,15}$/.test(cleaned)) {
    return { isValid: false, error: 'Please enter a valid phone number (7-15 digits)' };
  }
  return { isValid: true };
}

// WiFi SSID validation
export function validateSsid(ssid: string): ValidationResult {
  if (!ssid.trim()) {
    return { isValid: false, error: 'Network name is required' };
  }

  if (ssid.length > 32) {
    return { isValid: false, error: 'Network name must be 32 characters or less' };
  }
  return { isValid: true };
}

// WiFi password validation
export function validateWifiPassword(password: string, encryption: string): ValidationResult {
  if (encryption === 'nopass') {
    return { isValid: true }; // No password needed
  }

  if (!password) {
    return { isValid: false, error: 'Password is required for secured networks' };
  }

  if (encryption === 'WEP') {
    // WEP keys are typically 10 or 26 hex characters, or 5 or 13 ASCII characters
    if (password.length !== 5 && password.length !== 10 && password.length !== 13 && password.length !== 26) {
      return { isValid: false, error: 'WEP key must be 5, 10, 13, or 26 characters' };
    }
  } else if (encryption === 'WPA') {
    if (password.length < 8) {
      return { isValid: false, error: 'WPA password must be at least 8 characters' };
    }
    if (password.length > 63) {
      return { isValid: false, error: 'WPA password must be 63 characters or less' };
    }
  }

  return { isValid: true };
}

// vCard name validation
export function validateName(firstName: string, lastName: string): ValidationResult {
  if (!firstName.trim() && !lastName.trim()) {
    return { isValid: false, error: 'At least first or last name is required' };
  }
  return { isValid: true };
}

// Event title validation
export function validateEventTitle(title: string): ValidationResult {
  if (!title.trim()) {
    return { isValid: false, error: 'Event title is required' };
  }
  return { isValid: true };
}

// Event date validation
export function validateEventDate(startDate: string, endDate?: string): ValidationResult {
  if (!startDate) {
    return { isValid: false, error: 'Start date is required' };
  }

  if (endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      return { isValid: false, error: 'End date must be after start date' };
    }
  }

  return { isValid: true };
}

// Location validation
export function validateLatitude(lat: string): ValidationResult {
  if (!lat.trim()) {
    return { isValid: false, error: 'Latitude is required' };
  }

  const num = parseFloat(lat);
  if (isNaN(num) || num < -90 || num > 90) {
    return { isValid: false, error: 'Latitude must be between -90 and 90' };
  }
  return { isValid: true };
}

export function validateLongitude(lng: string): ValidationResult {
  if (!lng.trim()) {
    return { isValid: false, error: 'Longitude is required' };
  }

  const num = parseFloat(lng);
  if (isNaN(num) || num < -180 || num > 180) {
    return { isValid: false, error: 'Longitude must be between -180 and 180' };
  }
  return { isValid: true };
}

// Text content validation
export function validateText(text: string): ValidationResult {
  if (!text.trim()) {
    return { isValid: true }; // Empty is OK
  }

  if (text.length > 2953) {
    return { isValid: false, error: 'Text is too long for QR code (max ~2953 characters)' };
  }
  return { isValid: true };
}

// SMS message validation
export function validateSmsMessage(message: string): ValidationResult {
  if (!message) {
    return { isValid: true }; // Optional
  }

  if (message.length > 160) {
    return { isValid: false, error: 'SMS message should be 160 characters or less for best compatibility' };
  }
  return { isValid: true };
}
