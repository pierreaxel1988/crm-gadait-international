
/**
 * Format minutes into human-readable time
 * @param minutes Time in minutes to format
 * @returns Formatted time string
 */
export const formatResponseTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${Math.round(minutes)}min`;
  } else if (minutes < 1440) { // Less than 24 hours
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}min`;
  } else { // Days
    const days = Math.floor(minutes / 1440);
    const hours = Math.round((minutes % 1440) / 60);
    return `${days}j ${hours}h`;
  }
};
