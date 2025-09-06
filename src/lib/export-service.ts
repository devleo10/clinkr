import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';

interface ExportData {
  overview: {
    totalViews: number;
    change: string;
  };
  geography: {
    country: string;
    visits: number;
  }[];
  devices: {
    type: string;
    percentage: number;
  }[];
  trends: {
    date: string;
    views: number;
  }[];
}

export const exportToPDF = async (data: ExportData) => {
  const doc = new jsPDF();
  let yOffset = 20;

  // Title
  doc.setFontSize(20);
  doc.text('Clinkr Analytics Report', 20, yOffset);
  yOffset += 20;

  // Overview Section
  doc.setFontSize(16);
  doc.text('Overview', 20, yOffset);
  yOffset += 10;
  doc.setFontSize(12);
  doc.text(`Total Views: ${data.overview.totalViews}`, 30, yOffset);
  doc.text(`Change: ${data.overview.change}`, 30, yOffset + 10);
  yOffset += 30;

  // Geography Section
  doc.setFontSize(16);
  doc.text('Geography', 20, yOffset);
  yOffset += 10;
  doc.setFontSize(12);
  data.geography.forEach((item) => {
    doc.text(`${item.country}: ${item.visits} visits`, 30, yOffset);
    yOffset += 10;
  });
  yOffset += 10;

  // Devices Section
  doc.setFontSize(16);
  doc.text('Devices', 20, yOffset);
  yOffset += 10;
  doc.setFontSize(12);
  data.devices.forEach((item) => {
    doc.text(`${item.type}: ${item.percentage}%`, 30, yOffset);
    yOffset += 10;
  });
  yOffset += 10;

  // Trends Section
  doc.setFontSize(16);
  doc.text('Trends', 20, yOffset);
  yOffset += 10;
  doc.setFontSize(12);
  data.trends.forEach((item) => {
    doc.text(`${item.date}: ${item.views} views`, 30, yOffset);
    yOffset += 10;
  });

  doc.save('clinkr-report.pdf');
};

export const exportToCSV = async (data: ExportData) => {
  let csvContent = 'data:text/csv;charset=utf-8,';

  // Overview
  csvContent += 'Overview\n';
  csvContent += `Total Views,${data.overview.totalViews}\n`;
  csvContent += `Change,${data.overview.change}\n\n`;

  // Geography
  csvContent += 'Geography\n';
  csvContent += 'Country,Visits\n';
  data.geography.forEach((item) => {
    csvContent += `${item.country},${item.visits}\n`;
  });
  csvContent += '\n';

  // Devices
  csvContent += 'Devices\n';
  csvContent += 'Type,Percentage\n';
  data.devices.forEach((item) => {
    csvContent += `${item.type},${item.percentage}\n`;
  });
  csvContent += '\n';

  // Trends
  csvContent += 'Trends\n';
  csvContent += 'Date,Views\n';
  data.trends.forEach((item) => {
    csvContent += `${item.date},${item.views}\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, 'clinkr-report.csv');
};