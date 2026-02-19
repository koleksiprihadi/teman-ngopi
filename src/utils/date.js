// src/utils/date.js
import { format, parseISO, isToday, isAfter, startOfDay, endOfDay } from 'date-fns';
import { id } from 'date-fns/locale';

export function formatDate(date, fmt = 'dd MMMM yyyy') {
  if (!date) return '-';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, fmt, { locale: id });
}

export function formatDateTime(date) {
  if (!date) return '-';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd/MM/yyyy HH:mm', { locale: id });
}

export function formatTime(date) {
  if (!date) return '-';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'HH:mm', { locale: id });
}

export function getTodayString() {
  return format(new Date(), 'yyyy-MM-dd');
}

export function isAfterCutOff(cutOffTime = '22:00') {
  const now = new Date();
  const [hours, minutes] = cutOffTime.split(':').map(Number);
  const cutOff = new Date();
  cutOff.setHours(hours, minutes, 0, 0);
  return isAfter(now, cutOff);
}

export function getDateRange(type) {
  const now = new Date();
  if (type === 'today') {
    return { start: startOfDay(now), end: endOfDay(now) };
  }
  if (type === 'month') {
    return {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
    };
  }
  return { start: startOfDay(now), end: endOfDay(now) };
}
