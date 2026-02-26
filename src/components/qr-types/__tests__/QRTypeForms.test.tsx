import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { UrlForm } from '../UrlForm';
import { TextForm } from '../TextForm';
import { EmailForm } from '../EmailForm';
import { PhoneForm } from '../PhoneForm';
import { SmsForm } from '../SmsForm';
import { WifiForm } from '../WifiForm';
import { VCardForm } from '../VCardForm';
import { EventForm } from '../EventForm';
import { LocationForm } from '../LocationForm';

// ---------------------------------------------------------------------------
// Mock store state
// ---------------------------------------------------------------------------

const mockSetUrlData = vi.fn();
const mockSetTextData = vi.fn();
const mockSetEmailData = vi.fn();
const mockSetPhoneData = vi.fn();
const mockSetSmsData = vi.fn();
const mockSetWifiData = vi.fn();
const mockSetVcardData = vi.fn();
const mockSetEventData = vi.fn();
const mockSetLocationData = vi.fn();

const defaultStoreState = {
  urlData: { url: '' },
  setUrlData: mockSetUrlData,
  textData: { text: '' },
  setTextData: mockSetTextData,
  emailData: { email: '', subject: '', body: '' },
  setEmailData: mockSetEmailData,
  phoneData: { phone: '' },
  setPhoneData: mockSetPhoneData,
  smsData: { phone: '', message: '' },
  setSmsData: mockSetSmsData,
  wifiData: { ssid: '', encryption: 'WPA' as 'WPA' | 'WEP' | 'nopass', password: '', hidden: false },
  setWifiData: mockSetWifiData,
  vcardData: {
    firstName: '',
    lastName: '',
    organization: '',
    title: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    note: '',
  },
  setVcardData: mockSetVcardData,
  eventData: {
    title: '',
    location: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    description: '',
  },
  setEventData: mockSetEventData,
  locationData: { latitude: '', longitude: '' },
  setLocationData: mockSetLocationData,
};

// Allow per-test overrides by mutating this reference
let mockStoreState = { ...defaultStoreState };

vi.mock('@/stores/qrStore', () => ({
  useQRStore: (selector: (state: typeof mockStoreState) => unknown) =>
    selector(mockStoreState),
}));

// ---------------------------------------------------------------------------
// Mock hooks used by UrlForm
// ---------------------------------------------------------------------------

vi.mock('@/hooks/useUrlShortener', () => ({
  useUrlShortener: () => ({
    shorten: vi.fn(),
    isLoading: false,
    error: null,
    isBrandedConfigured: false,
    brandedDomain: null,
  }),
}));

vi.mock('@/hooks/useQRTracking', () => ({
  useQRTracking: () => ({
    createTracked: vi.fn(),
    isLoading: false,
    error: null,
  }),
}));

vi.mock('@/stores/settingsStore', () => ({
  useSettingsStore: () => ({ trackingSettings: {} }),
}));

// Mock useFormField to always return untouched/valid unless validator fails for empty
vi.mock('@/hooks/useFormField', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  useFormField: (_value: string, _validator?: unknown) => ({
    isValid: true,
    error: undefined,
    touched: false,
    handleBlur: vi.fn(),
    reset: vi.fn(),
  }),
}));

// Mock validators (used directly by TextForm, WifiForm, VCardForm, EventForm, LocationForm)
vi.mock('@/utils/validators', () => ({
  validateUrl: () => ({ isValid: true }),
  validateEmail: () => ({ isValid: true }),
  validatePhone: () => ({ isValid: true }),
  validateText: () => ({ isValid: true, error: undefined }),
  validateSsid: () => ({ isValid: true }),
  validateWifiPassword: () => ({ isValid: true }),
  validateName: () => ({ isValid: true }),
  validateEventTitle: () => ({ isValid: true }),
  validateEventDate: () => ({ isValid: true }),
  validateLatitude: () => ({ isValid: true }),
  validateLongitude: () => ({ isValid: true }),
}));

// ---------------------------------------------------------------------------
// Reset helpers
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
  mockStoreState = { ...defaultStoreState };
  // Re-bind the mock fns so each test has fresh references
  mockStoreState.setUrlData = mockSetUrlData;
  mockStoreState.setTextData = mockSetTextData;
  mockStoreState.setEmailData = mockSetEmailData;
  mockStoreState.setPhoneData = mockSetPhoneData;
  mockStoreState.setSmsData = mockSetSmsData;
  mockStoreState.setWifiData = mockSetWifiData;
  mockStoreState.setVcardData = mockSetVcardData;
  mockStoreState.setEventData = mockSetEventData;
  mockStoreState.setLocationData = mockSetLocationData;
});

// ===========================================================================
// 1. Shared behavior - all 9 forms render without crashing
// ===========================================================================

const allForms = [
  { name: 'UrlForm', Component: UrlForm },
  { name: 'TextForm', Component: TextForm },
  { name: 'EmailForm', Component: EmailForm },
  { name: 'PhoneForm', Component: PhoneForm },
  { name: 'SmsForm', Component: SmsForm },
  { name: 'WifiForm', Component: WifiForm },
  { name: 'VCardForm', Component: VCardForm },
  { name: 'EventForm', Component: EventForm },
  { name: 'LocationForm', Component: LocationForm },
];

describe('QR Type Forms - shared behavior', () => {
  describe.each(allForms)('$name', ({ Component }) => {
    it('renders without crashing', () => {
      const { container } = render(<Component />);
      expect(container.firstChild).toBeTruthy();
    });

    it('contains at least one input or textarea', () => {
      render(<Component />);
      const inputs = screen.queryAllByRole('textbox');
      const selects = screen.queryAllByRole('combobox');
      const tels = document.querySelectorAll('input[type="tel"]');
      const dates = document.querySelectorAll('input[type="date"]');
      const times = document.querySelectorAll('input[type="time"]');
      const urls = document.querySelectorAll('input[type="url"]');
      const passwords = document.querySelectorAll('input[type="password"]');
      const totalInputs =
        inputs.length + selects.length + tels.length + dates.length +
        times.length + urls.length + passwords.length;
      expect(totalInputs).toBeGreaterThanOrEqual(1);
    });
  });
});

// ===========================================================================
// 2. UrlForm
// ===========================================================================

describe('UrlForm', () => {
  it('renders URL input with correct label', () => {
    render(<UrlForm />);
    expect(screen.getByLabelText('Enter URL')).toBeInTheDocument();
  });

  it('renders URL input with placeholder', () => {
    render(<UrlForm />);
    expect(screen.getByPlaceholderText('https://example.com')).toBeInTheDocument();
  });

  it('calls setUrlData when user types', async () => {
    const user = userEvent.setup();
    render(<UrlForm />);
    const input = screen.getByLabelText('Enter URL');
    await user.type(input, 'h');
    expect(mockSetUrlData).toHaveBeenCalled();
    // The first call should include the typed character
    const firstCallArg = mockSetUrlData.mock.calls[0][0];
    expect(firstCallArg).toHaveProperty('url');
  });

  it('shows character count when URL has content', () => {
    mockStoreState.urlData = { url: 'https://example.com' };
    render(<UrlForm />);
    expect(screen.getByText(/Characters:/)).toBeInTheDocument();
    expect(screen.getByText(/19/)).toBeInTheDocument();
  });

  it('shows Shorten URL button for long URLs', () => {
    mockStoreState.urlData = { url: 'https://example.com/very/long/path/to/some/resource' };
    render(<UrlForm />);
    expect(screen.getByRole('button', { name: /Shorten URL/i })).toBeInTheDocument();
  });

  it('does not show Shorten button for short URLs', () => {
    mockStoreState.urlData = { url: 'https://ex.com' };
    render(<UrlForm />);
    expect(screen.queryByRole('button', { name: /Shorten/i })).not.toBeInTheDocument();
  });
});

// ===========================================================================
// 3. TextForm
// ===========================================================================

describe('TextForm', () => {
  it('renders textarea with correct label', () => {
    render(<TextForm />);
    expect(screen.getByLabelText('Text Content')).toBeInTheDocument();
  });

  it('renders textarea with placeholder', () => {
    render(<TextForm />);
    expect(screen.getByPlaceholderText('Enter your text here...')).toBeInTheDocument();
  });

  it('calls setTextData when user types', async () => {
    const user = userEvent.setup();
    render(<TextForm />);
    const textarea = screen.getByLabelText('Text Content');
    await user.type(textarea, 'a');
    expect(mockSetTextData).toHaveBeenCalledWith({ text: 'a' });
  });

  it('shows character count hint', () => {
    mockStoreState.textData = { text: 'Hello' };
    render(<TextForm />);
    expect(screen.getByText(/Characters: 5/)).toBeInTheDocument();
  });
});

// ===========================================================================
// 4. EmailForm
// ===========================================================================

describe('EmailForm', () => {
  it('renders email address input', () => {
    render(<EmailForm />);
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
  });

  it('renders subject field', () => {
    render(<EmailForm />);
    expect(screen.getByLabelText('Subject (Optional)')).toBeInTheDocument();
  });

  it('renders body textarea', () => {
    render(<EmailForm />);
    expect(screen.getByLabelText('Body (Optional)')).toBeInTheDocument();
  });

  it('calls setEmailData when typing in email field', async () => {
    const user = userEvent.setup();
    render(<EmailForm />);
    const emailInput = screen.getByLabelText('Email Address');
    await user.type(emailInput, 't');
    expect(mockSetEmailData).toHaveBeenCalledWith({ email: 't' });
  });

  it('calls setEmailData when typing in subject', async () => {
    const user = userEvent.setup();
    render(<EmailForm />);
    const subjectInput = screen.getByLabelText('Subject (Optional)');
    await user.type(subjectInput, 'Hi');
    expect(mockSetEmailData).toHaveBeenCalledWith({ subject: 'H' });
  });
});

// ===========================================================================
// 5. PhoneForm
// ===========================================================================

describe('PhoneForm', () => {
  it('renders phone input with correct label', () => {
    render(<PhoneForm />);
    expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
  });

  it('renders phone input with placeholder', () => {
    render(<PhoneForm />);
    expect(screen.getByPlaceholderText('+1 (555) 123-4567')).toBeInTheDocument();
  });

  it('calls setPhoneData when typing', async () => {
    const user = userEvent.setup();
    render(<PhoneForm />);
    const input = screen.getByLabelText('Phone Number');
    await user.type(input, '5');
    expect(mockSetPhoneData).toHaveBeenCalledWith({ phone: '5' });
  });
});

// ===========================================================================
// 6. SmsForm
// ===========================================================================

describe('SmsForm', () => {
  it('renders phone number input', () => {
    render(<SmsForm />);
    expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
  });

  it('renders message textarea', () => {
    render(<SmsForm />);
    expect(screen.getByLabelText('Message (Optional)')).toBeInTheDocument();
  });

  it('calls setSmsData when typing phone', async () => {
    const user = userEvent.setup();
    render(<SmsForm />);
    const input = screen.getByLabelText('Phone Number');
    await user.type(input, '1');
    expect(mockSetSmsData).toHaveBeenCalledWith({ phone: '1' });
  });

  it('shows SMS character count hint', () => {
    mockStoreState.smsData = { phone: '', message: 'Hello world' };
    render(<SmsForm />);
    expect(screen.getByText(/Characters: 11 \/ 160/)).toBeInTheDocument();
  });

  it('calls setSmsData when typing message', async () => {
    const user = userEvent.setup();
    render(<SmsForm />);
    const textarea = screen.getByLabelText('Message (Optional)');
    await user.type(textarea, 'H');
    expect(mockSetSmsData).toHaveBeenCalledWith({ message: 'H' });
  });
});

// ===========================================================================
// 7. WifiForm
// ===========================================================================

describe('WifiForm', () => {
  it('renders SSID input', () => {
    render(<WifiForm />);
    expect(screen.getByLabelText('Network Name (SSID)')).toBeInTheDocument();
  });

  it('renders security type select', () => {
    render(<WifiForm />);
    expect(screen.getByLabelText('Security Type')).toBeInTheDocument();
  });

  it('renders password field when encryption is WPA', () => {
    render(<WifiForm />);
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('hides password field when encryption is nopass', () => {
    mockStoreState.wifiData = { ssid: '', encryption: 'nopass' as const, password: '', hidden: false };
    render(<WifiForm />);
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
  });

  it('renders hidden network toggle', () => {
    render(<WifiForm />);
    expect(screen.getByRole('switch', { name: 'Hidden network' })).toBeInTheDocument();
  });

  it('calls setWifiData when typing SSID', async () => {
    const user = userEvent.setup();
    render(<WifiForm />);
    const input = screen.getByLabelText('Network Name (SSID)');
    await user.type(input, 'M');
    expect(mockSetWifiData).toHaveBeenCalledWith({ ssid: 'M' });
  });

  it('calls setWifiData when toggling hidden network', async () => {
    const user = userEvent.setup();
    render(<WifiForm />);
    const toggle = screen.getByRole('switch', { name: 'Hidden network' });
    await user.click(toggle);
    expect(mockSetWifiData).toHaveBeenCalledWith({ hidden: true });
  });

  it('shows WPA hint for password field', () => {
    render(<WifiForm />);
    expect(screen.getByText('WPA passwords must be 8-63 characters')).toBeInTheDocument();
  });

  it('renders encryption options', () => {
    render(<WifiForm />);
    const select = screen.getByLabelText('Security Type') as HTMLSelectElement;
    const options = Array.from(select.querySelectorAll('option'));
    expect(options.map((o) => o.textContent)).toEqual([
      'WPA/WPA2/WPA3',
      'WEP',
      'No Password',
    ]);
  });
});

// ===========================================================================
// 8. VCardForm
// ===========================================================================

describe('VCardForm', () => {
  it('renders first name and last name inputs', () => {
    render(<VCardForm />);
    expect(screen.getByLabelText(/First Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/)).toBeInTheDocument();
  });

  it('renders organization and job title inputs', () => {
    render(<VCardForm />);
    expect(screen.getByLabelText('Organization')).toBeInTheDocument();
    expect(screen.getByLabelText('Job Title')).toBeInTheDocument();
  });

  it('renders contact detail fields', () => {
    render(<VCardForm />);
    expect(screen.getByLabelText('Phone')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Website')).toBeInTheDocument();
    expect(screen.getByLabelText('Address')).toBeInTheDocument();
  });

  it('renders notes textarea', () => {
    render(<VCardForm />);
    expect(screen.getByLabelText('Notes')).toBeInTheDocument();
  });

  it('calls setVcardData when typing first name', async () => {
    const user = userEvent.setup();
    render(<VCardForm />);
    const input = screen.getByLabelText(/First Name/);
    await user.type(input, 'J');
    expect(mockSetVcardData).toHaveBeenCalledWith({ firstName: 'J' });
  });

  it('calls setVcardData when typing organization', async () => {
    const user = userEvent.setup();
    render(<VCardForm />);
    const input = screen.getByLabelText('Organization');
    await user.type(input, 'A');
    expect(mockSetVcardData).toHaveBeenCalledWith({ organization: 'A' });
  });

  it('renders fieldset legends for sections', () => {
    render(<VCardForm />);
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByText('Work Information')).toBeInTheDocument();
    expect(screen.getByText('Contact Details')).toBeInTheDocument();
  });
});

// ===========================================================================
// 9. EventForm
// ===========================================================================

describe('EventForm', () => {
  it('renders event title input', () => {
    render(<EventForm />);
    expect(screen.getByLabelText(/Event Title/)).toBeInTheDocument();
  });

  it('renders location input', () => {
    render(<EventForm />);
    expect(screen.getByLabelText('Location')).toBeInTheDocument();
  });

  it('renders start date and time fields', () => {
    render(<EventForm />);
    expect(screen.getByLabelText(/Start Date/)).toBeInTheDocument();
    expect(screen.getByLabelText('Start Time')).toBeInTheDocument();
  });

  it('renders end date and time fields', () => {
    render(<EventForm />);
    expect(screen.getByLabelText('End Date')).toBeInTheDocument();
    expect(screen.getByLabelText('End Time')).toBeInTheDocument();
  });

  it('renders description textarea', () => {
    render(<EventForm />);
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  it('calls setEventData when typing title', async () => {
    const user = userEvent.setup();
    render(<EventForm />);
    const input = screen.getByLabelText(/Event Title/);
    await user.type(input, 'T');
    expect(mockSetEventData).toHaveBeenCalledWith({ title: 'T' });
  });

  it('calls setEventData when typing location', async () => {
    const user = userEvent.setup();
    render(<EventForm />);
    const input = screen.getByLabelText('Location');
    await user.type(input, 'R');
    expect(mockSetEventData).toHaveBeenCalledWith({ location: 'R' });
  });
});

// ===========================================================================
// 10. LocationForm
// ===========================================================================

describe('LocationForm', () => {
  it('renders latitude input', () => {
    render(<LocationForm />);
    expect(screen.getByLabelText('Latitude')).toBeInTheDocument();
  });

  it('renders longitude input', () => {
    render(<LocationForm />);
    expect(screen.getByLabelText('Longitude')).toBeInTheDocument();
  });

  it('shows coordinate hint text', () => {
    render(<LocationForm />);
    expect(screen.getByText(/Tip: Finding coordinates/)).toBeInTheDocument();
  });

  it('calls setLocationData when typing latitude', async () => {
    const user = userEvent.setup();
    render(<LocationForm />);
    const input = screen.getByLabelText('Latitude');
    await user.type(input, '4');
    expect(mockSetLocationData).toHaveBeenCalledWith({ latitude: '4' });
  });

  it('calls setLocationData when typing longitude', async () => {
    const user = userEvent.setup();
    render(<LocationForm />);
    const input = screen.getByLabelText('Longitude');
    await user.type(input, '-');
    expect(mockSetLocationData).toHaveBeenCalledWith({ longitude: '-' });
  });

  it('renders placeholders for lat/lng', () => {
    render(<LocationForm />);
    expect(screen.getByPlaceholderText('40.7128')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('-74.0060')).toBeInTheDocument();
  });
});
