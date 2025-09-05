// Function to format a date to "MMM YYYY" format, e.g., "Jan 2020". Used in CV templates.
export function formatDate(
  date: Date | undefined,
  currentPrefix: string = 'Present',
): string {
  if (!date) return currentPrefix
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}
