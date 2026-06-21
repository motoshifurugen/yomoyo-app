// Deterministic, app-language-driven date formatting.
//
// We intentionally avoid Date.prototype.toLocaleDateString(locale): React
// Native's Hermes engine ships without full ICU, so the locale argument is
// silently ignored and dates always render in the device locale. Formatting
// by hand keeps the displayed date tied to the in-app language (#103).

const EN_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

export function formatBookDate(date: Date, language: string): string {
  const year = date.getFullYear();
  const day = date.getDate();
  if (language === 'ja') {
    return `${year}年${date.getMonth() + 1}月${day}日`;
  }
  return `${EN_MONTHS[date.getMonth()]} ${day}, ${year}`;
}
