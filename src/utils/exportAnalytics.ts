import { supabase } from '../lib/supabaseClient';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { UserOptions } from 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: UserOptions) => jsPDF;
  }
}

interface AnalyticsData {
  link_url: string;
  event_type: string;
  device_type: string;
  browser: string;
  country_code: string | null;
  region: string | null;
  referrer: string;
  created_at: string;
}


export const exportAnalyticsData = async (userId: string, options: { format: 'csv' | 'pdf' }): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('link_analytics')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      throw new Error('No data available for export');
    }

    const headers = ['Link URL', 'Event Type', 'Device Type', 'Browser', 'Country', 'Region', 'Referrer', 'Timestamp'];
    const rows = data.map((row: AnalyticsData) => [
      row.link_url,
      row.event_type,
      row.device_type,
      row.browser,
      row.country_code || 'Unknown',
      row.region || 'Unknown',
      row.referrer,
      new Date(row.created_at).toLocaleString()
    ]);

    if (options.format === 'csv') {
      const csvRows = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
      return URL.createObjectURL(blob);
    } else if (options.format === 'pdf') {
      const doc = new jsPDF();
      doc.text('Analytics Data', 14, 16);
      doc.autoTable({
        head: [headers],
        body: rows,
      });
      const pdfBlob = doc.output('blob');
      return URL.createObjectURL(pdfBlob);
    }

    throw new Error('Unsupported format');
  } catch (error) {
    // Export failed
    throw error;
  }
};