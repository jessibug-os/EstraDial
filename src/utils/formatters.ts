/**
 * Format a number to a specific decimal precision without trailing zeros
 * @param num - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns String representation without trailing zeros
 * 
 * @example
 * formatNumber(6.00) // "6"
 * formatNumber(6.50) // "6.5"
 * formatNumber(6.57) // "6.57"
 */
export function formatNumber(num: number, decimals: number = 2): string {
  return parseFloat(num.toFixed(decimals)).toString();
}

