const usd = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
const usdCompact = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 });
const dateTime = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
const date = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
const dayMonth = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' });
const percent = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay: 'exceptZero' });

export const formatUsd = (value: number | null | undefined): string => (value == null ? '—' : usd.format(value));
export const formatUsdCompact = (value: number): string => usdCompact.format(value);
export const formatDateTime = (iso: string | null | undefined): string => (iso ? dateTime.format(new Date(iso)) : '—');
export const formatDate = (iso: string | number): string => date.format(new Date(iso));
export const formatDayMonth = (iso: string | number): string => dayMonth.format(new Date(iso));
export const formatPercent = (value: number | null | undefined): string => (value == null ? '—' : `${percent.format(value)}%`);
