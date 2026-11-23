import type { YearFilter } from '@/types/eyespy';

export const MONTH_LABELS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
] as const;

export const MONTH_OPTIONS = [
  { value: '00', label: 'Semua Bulan' },
  { value: '01', label: 'Januari' },
  { value: '02', label: 'Februari' },
  { value: '03', label: 'Maret' },
  { value: '04', label: 'April' },
  { value: '05', label: 'Mei' },
  { value: '06', label: 'Juni' },
  { value: '07', label: 'Juli' },
  { value: '08', label: 'Agustus' },
  { value: '09', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
] as const;

export const YEAR_OPTIONS: { value: YearFilter; label: string }[] = [
  { value: 'all', label: '2024–2026' },
  { value: '2026', label: '2026 YTD' },
  { value: '2025', label: '2025' },
  { value: '2024', label: '2024' },
];

export const REGION_OPTIONS = [
  'Semua Wilayah',
  'Yogyakarta',
  'Sleman',
  'Bantul',
  'Kulon Progo',
  'Gunung Kidul',
] as const;

export function parseYearFilter(value: string | null | undefined): YearFilter {
  if (value === '2024' || value === '2025' || value === '2026') {
    return value;
  }
  return 'all';
}

export function parseMonthFilter(value: string | null | undefined): number | null {
  if (!value || value === '00') return null;
  const num = Number(value);
  if (Number.isInteger(num) && num >= 1 && num <= 12) return num;
  return null;
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('id-ID').format(value);
}

export function formatDateTimeID(dateStr: string): string {
  if (!dateStr) return '—';
  const normalized = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return dateStr;

  const day = date.getDate().toString().padStart(2, '0');
  const month = MONTH_LABELS_SHORT[date.getMonth()] ?? '';
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const mins = date.getMinutes().toString().padStart(2, '0');
  return `${day} ${month} ${year}, ${hours}:${mins} WIB`;
}

export function formatDateShortID(dateStr: string): string {
  if (!dateStr) return '—';
  const normalized = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return dateStr;

  const day = date.getDate().toString().padStart(2, '0');
  const month = MONTH_LABELS_SHORT[date.getMonth()] ?? '';
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}
