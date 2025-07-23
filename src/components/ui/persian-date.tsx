import { formatJalaliDate } from '@/lib/utils';

interface PersianDateProps {
  date: string | Date;
  includeTime?: boolean;
  className?: string;
}

export default function PersianDate({ date, includeTime = false, className = '' }: PersianDateProps) {
  const formattedDate = formatJalaliDate(date, includeTime);
  
  if (!formattedDate) {
    return <span className={className}>-</span>;
  }
  
  return <span className={className}>{formattedDate}</span>;
} 