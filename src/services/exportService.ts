/**
 * Export Service — exports data as PDF, Excel, JSON, or DOCX.
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import * as caseService from './caseService';
import * as procedureService from './procedureService';
import * as lectureService from './lectureService';
import * as courseService from './courseService';
import * as fileSystemService from './fileSystemService';
import { Capacitor } from '@capacitor/core';

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function downloadBlob(data: Uint8Array | string, fileName: string, mimeType: string) {
  const blob = data instanceof Uint8Array
    ? new Blob([data.buffer as ArrayBuffer], { type: mimeType })
    : new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

function applyDateFilter<T extends { date?: string }>(items: T[], timePeriod: string, fromDate?: string, toDate?: string): T[] {
  if (timePeriod === 'all' || !timePeriod) return items;
  const now = new Date();
  let cutoff: Date | null = null;

  switch (timePeriod) {
    case 'month': cutoff = new Date(now.getTime() - 30 * 86400000); break;
    case '3months': cutoff = new Date(now.getTime() - 90 * 86400000); break;
    case '6months': cutoff = new Date(now.getTime() - 180 * 86400000); break;
    case 'year': cutoff = new Date(now.getTime() - 365 * 86400000); break;
    case 'custom':
      if (fromDate && toDate) {
        return items.filter(i => i.date && i.date >= fromDate && i.date <= toDate);
      }
      return items;
  }

  if (cutoff) {
    const cutoffStr = cutoff.toISOString().split('T')[0];
    return items.filter(i => i.date && i.date >= cutoffStr);
  }
  return items;
}

export async function exportData(options: {
  categories: ('cases' | 'procedures' | 'lectures' | 'courses')[];
  caseIds?: string[];
  hospitalId?: string;
  timePeriod: string;
  fromDate?: string;
  toDate?: string;
  format: 'PDF' | 'DOCX' | 'Excel' | 'JSON';
  onProgress: (percent: number, message: string) => void;
}): Promise<void> {
  const { categories, caseIds, hospitalId, timePeriod, fromDate, toDate, format, onProgress } = options;
  const dateStr = new Date().toISOString().split('T')[0];
  const isNative = Capacitor.getPlatform() !== 'web';

  // 1. Fetch data
  onProgress(10, 'Querying records...');
  const exportPayload: Record<string, any[]> = {};

  if (categories.includes('cases')) {
    let cases = await caseService.getAll(hospitalId ? { hospitalId } : undefined);
    cases = applyDateFilter(cases.map(c => ({ ...c, date: c.admissionDate })), timePeriod, fromDate, toDate);
    if (caseIds && caseIds.length > 0) {
      cases = cases.filter(c => caseIds.includes(c.caseId));
    }
    exportPayload.cases = cases;
  }
  if (categories.includes('procedures')) {
    let procs = await procedureService.getAll();
    exportPayload.procedures = applyDateFilter(procs, timePeriod, fromDate, toDate);
  }
  if (categories.includes('lectures')) {
    let lecs = await lectureService.getAll();
    exportPayload.lectures = applyDateFilter(lecs, timePeriod, fromDate, toDate);
  }
  if (categories.includes('courses')) {
    let courses = await courseService.getAll();
    exportPayload.courses = applyDateFilter(courses, timePeriod, fromDate, toDate);
  }

  // 2. Generate file
  onProgress(40, 'Generating file...');

  if (format === 'JSON') {
    const json = JSON.stringify(exportPayload, null, 2);
    downloadBlob(json, `medora_export_${dateStr}.json`, 'application/json');
  } else if (format === 'Excel') {
    const wb = XLSX.utils.book_new();

    if (exportPayload.cases?.length) {
      const rows = exportPayload.cases.map((c: any) => ({
        'Patient': c.patientName, 'Age': c.patientAge, 'Gender': c.patientGender,
        'Hospital': c.hospital, 'Admission': c.admissionDate, 'Specialty': c.specialty,
        'Diagnosis': c.provisionalDiagnosis, 'Status': c.status,
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Cases');
    }
    if (exportPayload.procedures?.length) {
      const rows = exportPayload.procedures.map((p: any) => ({
        'Name': p.name, 'Date': p.date, 'Participation': p.participation,
        'Patient': p.patientName ?? '', 'Hospital': p.hospital ?? '',
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Procedures');
    }
    if (exportPayload.lectures?.length) {
      const rows = exportPayload.lectures.map((l: any) => ({
        'Topic': l.topic, 'Date': l.date, 'Speaker': l.speaker ?? '', 'Duration': l.duration ?? '',
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Lectures');
    }
    if (exportPayload.courses?.length) {
      const rows = exportPayload.courses.map((c: any) => ({
        'Name': c.name, 'Date': c.date, 'Provider': c.provider ?? '', 'Certificate': c.hasCertificate ? 'Yes' : 'No',
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Courses');
    }

    if (isNative) {
      const base64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      await fileSystemService.saveFile({ relativePath: `exports/medora_export_${dateStr}.xlsx`, base64Data: base64 });
    } else {
      XLSX.writeFile(wb, `medora_export_${dateStr}.xlsx`);
    }
  } else if (format === 'PDF') {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Medora Export', 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated: ${dateStr}`, 14, 22);
    let startY = 30;

    if (exportPayload.cases?.length) {
      autoTable(doc, {
        startY,
        head: [['Patient', 'Age', 'Gender', 'Hospital', 'Admission', 'Specialty', 'Diagnosis', 'Status']],
        body: exportPayload.cases.map((c: any) => [
          c.patientName, c.patientAge, c.patientGender, c.hospital,
          c.admissionDate, c.specialty, c.provisionalDiagnosis, c.status,
        ]),
        margin: { left: 14 },
        styles: { fontSize: 7 },
      });
      startY = (doc as any).lastAutoTable.finalY + 10;
    }

    if (exportPayload.procedures?.length) {
      autoTable(doc, {
        startY,
        head: [['Name', 'Date', 'Participation', 'Patient', 'Hospital']],
        body: exportPayload.procedures.map((p: any) => [
          p.name, p.date, p.participation, p.patientName ?? '', p.hospital ?? '',
        ]),
        margin: { left: 14 },
        styles: { fontSize: 7 },
      });
      startY = (doc as any).lastAutoTable.finalY + 10;
    }

    if (exportPayload.lectures?.length) {
      autoTable(doc, {
        startY,
        head: [['Topic', 'Date', 'Speaker', 'Duration']],
        body: exportPayload.lectures.map((l: any) => [
          l.topic, l.date, l.speaker ?? '', l.duration ?? '',
        ]),
        margin: { left: 14 },
        styles: { fontSize: 7 },
      });
      startY = (doc as any).lastAutoTable.finalY + 10;
    }

    if (exportPayload.courses?.length) {
      autoTable(doc, {
        startY,
        head: [['Name', 'Date', 'Provider', 'Certificate']],
        body: exportPayload.courses.map((c: any) => [
          c.name, c.date, c.provider ?? '', c.hasCertificate ? 'Yes' : 'No',
        ]),
        margin: { left: 14 },
        styles: { fontSize: 7 },
      });
    }

    if (isNative) {
      const dataUri = doc.output('datauristring');
      const base64 = dataUri.split(',')[1];
      await fileSystemService.saveFile({ relativePath: `exports/medora_export_${dateStr}.pdf`, base64Data: base64 });
    } else {
      doc.save(`medora_export_${dateStr}.pdf`);
    }
  } else if (format === 'DOCX') {
    const sections: any[] = [];

    const addCategorySection = (title: string, items: any[], headers: string[], rowMapper: (item: any) => string[]) => {
      sections.push(new Paragraph({ text: title, heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }));
      if (items.length > 0) {
        const noBorder = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
        const borders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
        const tableRows = [
          new TableRow({
            children: headers.map(h => new TableCell({
              children: [new Paragraph({ text: h, spacing: { after: 50 } })],
              width: { size: Math.floor(100 / headers.length), type: WidthType.PERCENTAGE },
              borders,
            })),
          }),
          ...items.map(item => new TableRow({
            children: rowMapper(item).map(val => new TableCell({
              children: [new Paragraph({ text: val, spacing: { after: 50 } })],
              width: { size: Math.floor(100 / headers.length), type: WidthType.PERCENTAGE },
              borders,
            })),
          })),
        ];
        sections.push(new Table({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
      }
    };

    if (exportPayload.cases?.length) {
      addCategorySection('Cases', exportPayload.cases,
        ['Patient', 'Age', 'Gender', 'Hospital', 'Admission', 'Diagnosis', 'Status'],
        (c) => [c.patientName, String(c.patientAge), c.patientGender, c.hospital, c.admissionDate, c.provisionalDiagnosis, c.status]
      );
    }
    if (exportPayload.procedures?.length) {
      addCategorySection('Procedures', exportPayload.procedures,
        ['Name', 'Date', 'Participation', 'Patient'],
        (p) => [p.name, p.date, p.participation, p.patientName ?? '']
      );
    }
    if (exportPayload.lectures?.length) {
      addCategorySection('Lectures', exportPayload.lectures,
        ['Topic', 'Date', 'Speaker', 'Duration'],
        (l) => [l.topic, l.date, l.speaker ?? '', l.duration ?? '']
      );
    }
    if (exportPayload.courses?.length) {
      addCategorySection('Courses', exportPayload.courses,
        ['Name', 'Date', 'Provider', 'Certificate'],
        (c) => [c.name, c.date, c.provider ?? '', c.hasCertificate ? 'Yes' : 'No']
      );
    }

    const docxDoc = new Document({
      sections: [{ children: [
        new Paragraph({ text: 'Medora Export', heading: HeadingLevel.TITLE }),
        new Paragraph({ text: `Generated: ${dateStr}`, spacing: { after: 400 } }),
        ...sections,
      ]}],
    });

    const base64 = await Packer.toBase64String(docxDoc);

    if (isNative) {
      await fileSystemService.saveFile({ relativePath: `exports/medora_export_${dateStr}.docx`, base64Data: base64 });
    } else {
      const bytes = base64ToUint8Array(base64);
      downloadBlob(bytes, `medora_export_${dateStr}.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    }
  }

  onProgress(100, 'Complete');
}
