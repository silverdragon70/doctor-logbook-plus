import React, { useState, useMemo } from 'react';
import { Upload, CalendarIcon } from 'lucide-react';
import { format, subMonths, subYears, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription,
} from '@/components/ui/drawer';
import jsPDF from 'jspdf';
// @ts-ignore
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

type TimePeriod = 'All' | 'Last Month' | 'Last 3 Months' | 'Last 6 Months' | 'Last Year' | 'Custom';
type ExportFormat = 'PDF' | 'Excel' | 'Word' | 'CSV';

interface ExportColumn {
  header: string;
  key: string;
}

interface ExportSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string; // e.g. "Procedures"
  data: Record<string, any>[];
  columns: ExportColumn[];
  dateKey: string; // which field holds the date string
}

const periodOptions: TimePeriod[] = ['All', 'Last Month', 'Last 3 Months', 'Last 6 Months', 'Last Year', 'Custom'];
const formatOptions: ExportFormat[] = ['PDF', 'Excel', 'Word', 'CSV'];

function getDateRange(period: TimePeriod, customFrom?: Date, customTo?: Date): { from: Date | null; to: Date | null } {
  const now = new Date();
  switch (period) {
    case 'All': return { from: null, to: null };
    case 'Last Month': return { from: subMonths(now, 1), to: now };
    case 'Last 3 Months': return { from: subMonths(now, 3), to: now };
    case 'Last 6 Months': return { from: subMonths(now, 6), to: now };
    case 'Last Year': return { from: subYears(now, 1), to: now };
    case 'Custom': return { from: customFrom || null, to: customTo || null };
  }
}

function filterByDate<T extends Record<string, any>>(data: T[], dateKey: string, from: Date | null, to: Date | null): T[] {
  if (!from && !to) return data;
  return data.filter(item => {
    const d = new Date(item[dateKey]);
    if (from && isBefore(d, startOfDay(from))) return false;
    if (to && isAfter(d, endOfDay(to))) return false;
    return true;
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const ExportSheet: React.FC<ExportSheetProps> = ({ open, onOpenChange, title, data, columns, dateKey }) => {
  const [period, setPeriod] = useState<TimePeriod>('All');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('PDF');
  const [customFrom, setCustomFrom] = useState<Date>(subMonths(new Date(), 1));
  const [customTo, setCustomTo] = useState<Date>(new Date());

  const { from, to } = getDateRange(period, customFrom, customTo);
  const filtered = useMemo(() => filterByDate(data, dateKey, from, to), [data, dateKey, from, to]);

  const handleExport = () => {
    const headers = columns.map(c => c.header);
    const rows = filtered.map(item => columns.map(c => item[c.key] ?? ''));
    const filename = `${title}_${format(new Date(), 'yyyy-MM-dd')}`;

    switch (exportFormat) {
      case 'CSV': {
        const csvContent = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
        downloadBlob(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }), `${filename}.csv`);
        break;
      }
      case 'PDF': {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text(`${title} Report`, 14, 20);
        doc.setFontSize(10);
        doc.text(`Generated: ${format(new Date(), 'PPP')}`, 14, 28);
        autoTable(doc, {
          head: [headers],
          body: rows,
          startY: 34,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [37, 99, 235] },
        });
        doc.save(`${filename}.pdf`);
        break;
      }
      case 'Excel': {
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, title);
        XLSX.writeFile(wb, `${filename}.xlsx`);
        break;
      }
      case 'Word': {
        const tableRows = rows.map(r => `<tr>${r.map(v => `<td style="border:1px solid #ccc;padding:6px;font-size:12px;">${v}</td>`).join('')}</tr>`).join('');
        const html = `
          <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
          <head><meta charset="utf-8"><title>${title}</title></head>
          <body>
            <h2>${title} Report</h2>
            <p style="color:#666;font-size:12px;">Generated: ${format(new Date(), 'PPP')}</p>
            <table style="border-collapse:collapse;width:100%;margin-top:12px;">
              <tr>${headers.map(h => `<th style="border:1px solid #999;padding:8px;background:#2563EB;color:white;font-size:12px;">${h}</th>`).join('')}</tr>
              ${tableRows}
            </table>
          </body></html>`;
        downloadBlob(new Blob([html], { type: 'application/msword' }), `${filename}.doc`);
        break;
      }
    }
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>Export {title}</DrawerTitle>
          <DrawerDescription>Choose a time period and format</DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-6 space-y-5 overflow-y-auto">
          {/* Time Period */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Filter by Period</label>
            <div className="flex flex-wrap gap-2">
              {periodOptions.map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    period === p
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-card text-muted-foreground border border-border hover:bg-muted/50"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Custom date pickers */}
          {period === 'Custom' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">From</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left text-xs bg-card border-border h-9">
                      <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                      {format(customFrom, 'dd MMM yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={customFrom} onSelect={(d) => d && setCustomFrom(d)} initialFocus className={cn("p-3 pointer-events-auto")} />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">To</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left text-xs bg-card border-border h-9">
                      <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                      {format(customTo, 'dd MMM yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={customTo} onSelect={(d) => d && setCustomTo(d)} initialFocus className={cn("p-3 pointer-events-auto")} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Format */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Export Format</label>
            <div className="flex flex-wrap gap-2">
              {formatOptions.map(f => (
                <button
                  key={f}
                  onClick={() => setExportFormat(f)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    exportFormat === f
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-card text-muted-foreground border border-border hover:bg-muted/50"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* No data message */}
          {filtered.length === 0 && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">No records found for this period</p>
            </div>
          )}

          {/* Export Button */}
          <Button
            onClick={handleExport}
            disabled={filtered.length === 0}
            className="w-full h-11 rounded-xl text-sm font-semibold gap-2"
          >
            <Upload size={16} /> Export
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ExportSheet;
