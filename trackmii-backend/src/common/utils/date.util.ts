import { BadRequestException } from '@nestjs/common';

export const getCurrentMonthYear = (): { month: number; year: number } => {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
};

export const getMonthDateRange = (
  month: number,
  year: number,
): { startDate: string; endDate: string } => {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);

  return {
    startDate: formatDate(firstDay),
    endDate: formatDate(lastDay),
  };
};

export const getNMonthsAgo = (months: number): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
};

export const getNWeeksAgo = (weeks: number): Date => {
  const now = new Date();
  return new Date(now.getTime() - weeks * 7 * 24 * 60 * 60 * 1000);
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const isPastMonth = (month: number, year: number): boolean => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  return year < currentYear || (year === currentYear && month < currentMonth);
};

export const validateNotPastMonth = (month: number, year: number): void => {
  if (isPastMonth(month, year)) {
    throw new BadRequestException('Cannot set budget for a past month');
  }
};

export const getDateInUserTimezone = (timezone: string): Date => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(now);
  const year = parseInt(parts.find((p) => p.type === 'year')!.value);
  const month = parseInt(parts.find((p) => p.type === 'month')!.value);
  const day = parseInt(parts.find((p) => p.type === 'day')!.value);
  return new Date(year, month - 1, day);
};

export const getTodayInUserTimezone = (timezone: string): string => {
  const date = getDateInUserTimezone(timezone);
  return formatDate(date);
};