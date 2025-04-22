
/**
 * Formats a phone number for display
 * @param phoneNumber The raw phone number to format
 * @returns Formatted phone number string
 */
export const formatPhoneNumber = (phoneNumber?: string): string => {
  if (!phoneNumber) return '';
  
  // Handle international format
  if (phoneNumber.startsWith('+')) {
    // For France (+33)
    if (phoneNumber.startsWith('+33')) {
      const digits = phoneNumber.substring(3); // Remove the +33
      return `+33 ${digits.substring(0, 1)} ${digits.substring(1, 3)} ${digits.substring(3, 5)} ${digits.substring(5, 7)} ${digits.substring(7, 9)}`;
    }
    // For other international numbers, just add spaces every 3 digits
    return phoneNumber.replace(/(\d{3})(?=\d)/g, '$1 ');
  }
  
  // For French numbers starting with 0
  if (phoneNumber.startsWith('0') && phoneNumber.length === 10) {
    return `${phoneNumber.substring(0, 2)} ${phoneNumber.substring(2, 4)} ${phoneNumber.substring(4, 6)} ${phoneNumber.substring(6, 8)} ${phoneNumber.substring(8, 10)}`;
  }
  
  // Default formatting with spaces
  return phoneNumber.replace(/(\d{2})(?=\d)/g, '$1 ');
};
