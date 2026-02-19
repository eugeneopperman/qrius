import { useState } from 'react';
import { useQRStore } from '@/stores/qrStore';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';

import { validateEventTitle, validateEventDate } from '@/utils/validators';

export function EventForm() {
  const { eventData, setEventData } = useQRStore();
  const [touched, setTouched] = useState({ title: false, startDate: false, endDate: false });

  const titleValidation = touched.title ? validateEventTitle(eventData.title) : { isValid: true };
  const startDateValidation = touched.startDate ? validateEventDate(eventData.startDate) : { isValid: true };
  const endDateValidation = touched.endDate && eventData.endDate
    ? validateEventDate(eventData.startDate, eventData.endDate)
    : { isValid: true };

  return (
    <div className="space-y-4">
      <Input
        label="Event Title"
        type="text"
        required
        value={eventData.title}
        onChange={(e) => setEventData({ title: e.target.value })}
        onBlur={() => setTouched((t) => ({ ...t, title: true }))}
        placeholder="Meeting with Team"
        error={titleValidation.error}
      />

      <Input
        label="Location"
        type="text"
        value={eventData.location || ''}
        onChange={(e) => setEventData({ location: e.target.value })}
        placeholder="Conference Room A"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Start Date"
          type="date"
          required
          value={eventData.startDate}
          onChange={(e) => setEventData({ startDate: e.target.value })}
          onBlur={() => setTouched((t) => ({ ...t, startDate: true }))}
          error={startDateValidation.error}
        />
        <Input
          label="Start Time"
          type="time"
          value={eventData.startTime || ''}
          onChange={(e) => setEventData({ startTime: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="End Date"
          type="date"
          value={eventData.endDate || ''}
          onChange={(e) => setEventData({ endDate: e.target.value })}
          onBlur={() => setTouched((t) => ({ ...t, endDate: true }))}
          error={endDateValidation.error}
        />
        <Input
          label="End Time"
          type="time"
          value={eventData.endTime || ''}
          onChange={(e) => setEventData({ endTime: e.target.value })}
        />
      </div>

      <Textarea
        label="Description"
        value={eventData.description || ''}
        onChange={(e) => setEventData({ description: e.target.value })}
        placeholder="Event details..."
        rows={2}
      />
    </div>
  );
}
