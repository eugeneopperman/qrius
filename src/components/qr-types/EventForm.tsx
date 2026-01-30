import { useState } from 'react';
import { useQRStore } from '../../stores/qrStore';
import { Input } from '../ui/Input';
import { Calendar } from 'lucide-react';
import { validateEventTitle, validateEventDate } from '../../utils/validators';

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
      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
        <Calendar className="w-5 h-5" />
        <h3 className="font-medium">Calendar Event</h3>
      </div>

      <Input
        label="Event Title"
        type="text"
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

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Start Date"
          type="date"
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

      <div className="grid grid-cols-2 gap-3">
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

      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          value={eventData.description || ''}
          onChange={(e) => setEventData({ description: e.target.value })}
          placeholder="Event details..."
          rows={2}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 resize-none"
        />
      </div>
    </div>
  );
}
