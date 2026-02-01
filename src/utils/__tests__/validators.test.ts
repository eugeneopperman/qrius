import { describe, it, expect } from 'vitest';
import {
  validateUrl,
  validateEmail,
  validatePhone,
  validateSsid,
  validateWifiPassword,
  validateName,
  validateEventTitle,
  validateEventDate,
  validateLatitude,
  validateLongitude,
  validateText,
  validateSmsMessage,
} from '../validators';

describe('validators', () => {
  describe('validateUrl', () => {
    it('returns valid for empty string', () => {
      expect(validateUrl('')).toEqual({ isValid: true });
      expect(validateUrl('   ')).toEqual({ isValid: true });
    });

    it('validates proper URLs', () => {
      expect(validateUrl('https://example.com')).toEqual({ isValid: true });
      expect(validateUrl('http://example.com')).toEqual({ isValid: true });
      expect(validateUrl('example.com')).toEqual({ isValid: true });
      expect(validateUrl('www.example.com/path?query=1')).toEqual({ isValid: true });
    });

    it('rejects invalid URLs', () => {
      expect(validateUrl('not a url')).toEqual({
        isValid: false,
        error: 'Please enter a valid URL',
      });
      expect(validateUrl('localhost')).toEqual({
        isValid: false,
        error: 'Please enter a valid URL with a domain',
      });
    });
  });

  describe('validateEmail', () => {
    it('returns valid for empty string', () => {
      expect(validateEmail('')).toEqual({ isValid: true });
    });

    it('validates proper emails', () => {
      expect(validateEmail('test@example.com')).toEqual({ isValid: true });
      expect(validateEmail('name.surname@domain.co.uk')).toEqual({ isValid: true });
      expect(validateEmail('test+tag@example.org')).toEqual({ isValid: true });
    });

    it('rejects invalid emails', () => {
      expect(validateEmail('invalid')).toEqual({
        isValid: false,
        error: 'Please enter a valid email address',
      });
      expect(validateEmail('test@')).toEqual({
        isValid: false,
        error: 'Please enter a valid email address',
      });
      expect(validateEmail('@example.com')).toEqual({
        isValid: false,
        error: 'Please enter a valid email address',
      });
    });
  });

  describe('validatePhone', () => {
    it('returns valid for empty string', () => {
      expect(validatePhone('')).toEqual({ isValid: true });
    });

    it('validates proper phone numbers', () => {
      expect(validatePhone('1234567')).toEqual({ isValid: true });
      expect(validatePhone('+1 (555) 123-4567')).toEqual({ isValid: true });
      expect(validatePhone('555.123.4567')).toEqual({ isValid: true });
      expect(validatePhone('123456789012345')).toEqual({ isValid: true });
    });

    it('rejects invalid phone numbers', () => {
      expect(validatePhone('123')).toEqual({
        isValid: false,
        error: 'Please enter a valid phone number (7-15 digits)',
      });
      expect(validatePhone('1234567890123456')).toEqual({
        isValid: false,
        error: 'Please enter a valid phone number (7-15 digits)',
      });
      expect(validatePhone('abcdefgh')).toEqual({
        isValid: false,
        error: 'Please enter a valid phone number (7-15 digits)',
      });
    });
  });

  describe('validateSsid', () => {
    it('requires SSID to be present', () => {
      expect(validateSsid('')).toEqual({
        isValid: false,
        error: 'Network name is required',
      });
      expect(validateSsid('   ')).toEqual({
        isValid: false,
        error: 'Network name is required',
      });
    });

    it('validates proper SSIDs', () => {
      expect(validateSsid('MyNetwork')).toEqual({ isValid: true });
      expect(validateSsid('Network with spaces')).toEqual({ isValid: true });
      expect(validateSsid('12345678901234567890123456789012')).toEqual({ isValid: true }); // 32 chars
    });

    it('rejects too long SSIDs', () => {
      expect(validateSsid('123456789012345678901234567890123')).toEqual({
        isValid: false,
        error: 'Network name must be 32 characters or less',
      });
    });
  });

  describe('validateWifiPassword', () => {
    it('allows empty password for nopass encryption', () => {
      expect(validateWifiPassword('', 'nopass')).toEqual({ isValid: true });
    });

    it('requires password for secured networks', () => {
      expect(validateWifiPassword('', 'WPA')).toEqual({
        isValid: false,
        error: 'Password is required for secured networks',
      });
    });

    it('validates WEP key lengths', () => {
      expect(validateWifiPassword('12345', 'WEP')).toEqual({ isValid: true }); // 5 chars
      expect(validateWifiPassword('1234567890', 'WEP')).toEqual({ isValid: true }); // 10 chars
      expect(validateWifiPassword('1234567890123', 'WEP')).toEqual({ isValid: true }); // 13 chars
      expect(validateWifiPassword('12345678901234567890123456', 'WEP')).toEqual({ isValid: true }); // 26 chars
      expect(validateWifiPassword('1234', 'WEP')).toEqual({
        isValid: false,
        error: 'WEP key must be 5, 10, 13, or 26 characters',
      });
    });

    it('validates WPA password lengths', () => {
      expect(validateWifiPassword('12345678', 'WPA')).toEqual({ isValid: true });
      expect(validateWifiPassword('a'.repeat(63), 'WPA')).toEqual({ isValid: true });
      expect(validateWifiPassword('1234567', 'WPA')).toEqual({
        isValid: false,
        error: 'WPA password must be at least 8 characters',
      });
      expect(validateWifiPassword('a'.repeat(64), 'WPA')).toEqual({
        isValid: false,
        error: 'WPA password must be 63 characters or less',
      });
    });
  });

  describe('validateName', () => {
    it('requires at least one name', () => {
      expect(validateName('', '')).toEqual({
        isValid: false,
        error: 'At least first or last name is required',
      });
      expect(validateName('   ', '   ')).toEqual({
        isValid: false,
        error: 'At least first or last name is required',
      });
    });

    it('accepts first name only', () => {
      expect(validateName('John', '')).toEqual({ isValid: true });
    });

    it('accepts last name only', () => {
      expect(validateName('', 'Doe')).toEqual({ isValid: true });
    });

    it('accepts both names', () => {
      expect(validateName('John', 'Doe')).toEqual({ isValid: true });
    });
  });

  describe('validateEventTitle', () => {
    it('requires title', () => {
      expect(validateEventTitle('')).toEqual({
        isValid: false,
        error: 'Event title is required',
      });
    });

    it('accepts valid titles', () => {
      expect(validateEventTitle('Team Meeting')).toEqual({ isValid: true });
    });
  });

  describe('validateEventDate', () => {
    it('requires start date', () => {
      expect(validateEventDate('')).toEqual({
        isValid: false,
        error: 'Start date is required',
      });
    });

    it('accepts valid start date', () => {
      expect(validateEventDate('2024-01-15')).toEqual({ isValid: true });
    });

    it('validates end date is after start date', () => {
      expect(validateEventDate('2024-01-15', '2024-01-16')).toEqual({ isValid: true });
      expect(validateEventDate('2024-01-15', '2024-01-14')).toEqual({
        isValid: false,
        error: 'End date must be after start date',
      });
    });
  });

  describe('validateLatitude', () => {
    it('requires latitude', () => {
      expect(validateLatitude('')).toEqual({
        isValid: false,
        error: 'Latitude is required',
      });
    });

    it('validates latitude range', () => {
      expect(validateLatitude('0')).toEqual({ isValid: true });
      expect(validateLatitude('90')).toEqual({ isValid: true });
      expect(validateLatitude('-90')).toEqual({ isValid: true });
      expect(validateLatitude('45.5')).toEqual({ isValid: true });
      expect(validateLatitude('91')).toEqual({
        isValid: false,
        error: 'Latitude must be between -90 and 90',
      });
      expect(validateLatitude('-91')).toEqual({
        isValid: false,
        error: 'Latitude must be between -90 and 90',
      });
      expect(validateLatitude('abc')).toEqual({
        isValid: false,
        error: 'Latitude must be between -90 and 90',
      });
    });
  });

  describe('validateLongitude', () => {
    it('requires longitude', () => {
      expect(validateLongitude('')).toEqual({
        isValid: false,
        error: 'Longitude is required',
      });
    });

    it('validates longitude range', () => {
      expect(validateLongitude('0')).toEqual({ isValid: true });
      expect(validateLongitude('180')).toEqual({ isValid: true });
      expect(validateLongitude('-180')).toEqual({ isValid: true });
      expect(validateLongitude('122.5')).toEqual({ isValid: true });
      expect(validateLongitude('181')).toEqual({
        isValid: false,
        error: 'Longitude must be between -180 and 180',
      });
      expect(validateLongitude('-181')).toEqual({
        isValid: false,
        error: 'Longitude must be between -180 and 180',
      });
    });
  });

  describe('validateText', () => {
    it('returns valid for empty string', () => {
      expect(validateText('')).toEqual({ isValid: true });
    });

    it('accepts valid text', () => {
      expect(validateText('Hello world')).toEqual({ isValid: true });
    });

    it('rejects text that is too long', () => {
      const longText = 'a'.repeat(2954);
      expect(validateText(longText)).toEqual({
        isValid: false,
        error: 'Text is too long for QR code (max ~2953 characters)',
      });
    });
  });

  describe('validateSmsMessage', () => {
    it('allows empty message', () => {
      expect(validateSmsMessage('')).toEqual({ isValid: true });
    });

    it('accepts valid SMS messages', () => {
      expect(validateSmsMessage('Hello!')).toEqual({ isValid: true });
      expect(validateSmsMessage('a'.repeat(160))).toEqual({ isValid: true });
    });

    it('warns about long messages', () => {
      expect(validateSmsMessage('a'.repeat(161))).toEqual({
        isValid: false,
        error: 'SMS message should be 160 characters or less for best compatibility',
      });
    });
  });
});
