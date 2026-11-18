export function formatWhatsAppDigits(rawNumber: string): string {
  const digits = rawNumber.replace(/[^\d]/g, '');
  if (!digits) return '9613105977';
  if (digits.startsWith('0')) {
    return `961${digits.slice(1)}`;
  }
  return digits;
}

export function buildWhatsAppUrl(rawNumber: string, message: string): string {
  const cleanDigits = formatWhatsAppDigits(rawNumber);
  return `https://wa.me/${cleanDigits}?text=${encodeURIComponent(message)}`;
}

export function openWhatsApp(rawNumber: string, message: string): void {
  const url = buildWhatsAppUrl(rawNumber, message);
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
