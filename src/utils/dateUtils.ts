// Utility functions for rugby club event dates and weekend calculations

export interface WeekendRange {
  friday: Date;
  saturday: Date;
  sunday: Date;
  fridayStr: string;
  saturdayStr: string;
  sundayStr: string;
  label: string;
  fullLabel: string;
  isDateInWeekend: (dateStr: string) => boolean;
}

export function getCurrentWeekendDates(referenceDate: Date = new Date()): WeekendRange {
  const d = new Date(referenceDate);
  const day = d.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday

  // Calculate offset to Monday (1) of the current week (ISO-like Monday to Sunday week)
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() + diffToMonday);

  // Friday = Monday + 4 days, Saturday = Monday + 5 days, Sunday = Monday + 6 days
  const friday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 4);
  const saturday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 5);
  const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);

  const pad = (n: number) => String(n).padStart(2, '0');
  const toYMD = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

  const fridayStr = toYMD(friday);
  const saturdayStr = toYMD(saturday);
  const sundayStr = toYMD(sunday);

  const formatShort = (date: Date) => `${date.getDate()} ${date.toLocaleDateString('es-ES', { month: 'short' })}`;
  const label = `${formatShort(saturday)} - ${formatShort(sunday)}`;
  const fullLabel = `Viernes ${formatShort(friday)} a Domingo ${formatShort(sunday)}`;

  return {
    friday,
    saturday,
    sunday,
    fridayStr,
    saturdayStr,
    sundayStr,
    label,
    fullLabel,
    isDateInWeekend: (dateStr: string) => {
      if (!dateStr) return false;
      return dateStr === fridayStr || dateStr === saturdayStr || dateStr === sundayStr;
    }
  };
}
