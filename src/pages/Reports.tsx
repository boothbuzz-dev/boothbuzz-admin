import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Calendar, 
  DollarSign, 
  Users, 
  Building2,
  Filter,
  RefreshCw,
  Eye,
  FileText,
  PieChart,
  Activity,
  Target,
  Clock,
  MapPin
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/UI/Card';
import { Badge } from '../components/UI/Badge';
import { Button } from '../components/UI/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/UI/Table';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/apiClient';
import { useReportData, getDateRangeBounds } from '../hooks/useReportData';
import { useMemo } from 'react';
import {
  getSampleReportEvents,
  getSampleReportVenues,
  getSampleRevenueStreams,
  getSampleExpenseLines,
  getSampleSavedReports,
} from '../data/reportsSampleData';
import {
  CustomReportViewModal,
  type SavedReportForView,
  type CustomReportAnalytics,
} from '../components/Reports/CustomReportViewModal';
import { csvFilename, downloadCsv } from '../lib/exportCsv';

interface ReportData {
  period: string;
  events: number;
  revenue: number;
  attendees: number;
  societies: number;
  growth: number;
}

interface EventPerformanceRow {
  id: string;
  name: string;
  date: string;
  attendees: number;
  revenue: number;
  satisfaction?: number;
  roi?: number;
}

interface CityPerformance {
  city: string;
  events: number;
  revenue: number;
  societies: number;
  growth: number;
}

interface OrgOption {
  id: string;
  name: string;
}

const PLAN_TYPE_COLORS: Record<string, string> = {
  'Plan A': 'bg-blue-500',
  'Plan B': 'bg-green-500',
  'Plan C': 'bg-yellow-500',
  Custom: 'bg-purple-500',
  Unset: 'bg-gray-500',
};

const DATE_RANGE_LABELS: Record<string, string> = {
  last_7_days: 'Last 7 days',
  last_30_days: 'Last 30 days',
  last_3_months: 'Last 3 months',
  last_6_months: 'Last 6 months',
  last_year: 'Last year',
};

type CustomReportTypeKey = 'revenue' | 'attendance' | 'venue' | 'vendor' | 'custom';
type CustomReportDateRangeKey = 'last_week' | 'last_month' | 'last_quarter' | 'last_year' | 'custom';
type CustomReportFormatKey = 'pdf' | 'excel' | 'csv' | 'dashboard';

const CUSTOM_REPORT_TYPE_LABELS: Record<CustomReportTypeKey, string> = {
  revenue: 'Revenue',
  attendance: 'Attendance',
  venue: 'Venue',
  vendor: 'Vendor',
  custom: 'Custom Metrics',
};

const CUSTOM_REPORT_FORMAT_LABELS: Record<CustomReportFormatKey, string> = {
  pdf: 'PDF',
  excel: 'Excel',
  csv: 'CSV',
  dashboard: 'Dashboard',
};

const CUSTOM_FORM_DATE_RANGE_LABELS: Record<CustomReportDateRangeKey, string> = {
  last_week: 'Last week',
  last_month: 'Last month',
  last_quarter: 'Last quarter',
  last_year: 'Last year',
  custom: 'Page date range',
};

const VENDOR_EXPORT_ROWS = [
  ['Catering Partners Collective', 'F&B', 14, 212000, '+11%'],
  ['Stage & AV Pro', 'Production', 9, 168000, '+4%'],
  ['Booth Build Co.', 'Fabrication', 11, 94500, '—'],
  ['Security & Access Ltd.', 'Operations', 22, 128000, '+7%'],
];

function mapCustomFormDateRange(range: CustomReportDateRangeKey, currentPageRange: string): string {
  switch (range) {
    case 'last_week':
      return 'last_7_days';
    case 'last_month':
      return 'last_30_days';
    case 'last_quarter':
      return 'last_3_months';
    case 'last_year':
      return 'last_year';
    case 'custom':
      return currentPageRange;
    default:
      return 'last_30_days';
  }
}

export const Reports: React.FC = () => {
  const { user, isSuperAdmin, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'financial' | 'performance' | 'custom'>('overview');
  const [dateRange, setDateRange] = useState('last_6_months');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedReportOrgId, setSelectedReportOrgId] = useState<string>('all');
  const [organizations, setOrganizations] = useState<OrgOption[]>([]);
  const [useSamplePreview, setUseSamplePreview] = useState(true);
  const [viewingCustomReport, setViewingCustomReport] = useState<SavedReportForView | null>(null);
  const [customReportType, setCustomReportType] = useState<CustomReportTypeKey>('revenue');
  const [customReportDateRange, setCustomReportDateRange] = useState<CustomReportDateRangeKey>('last_month');
  const [customReportFormat, setCustomReportFormat] = useState<CustomReportFormatKey>('excel');
  const [userGeneratedReports, setUserGeneratedReports] = useState<SavedReportForView[]>([]);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [pendingGeneratedReport, setPendingGeneratedReport] = useState<{
    report: SavedReportForView;
    format: CustomReportFormatKey;
    type: CustomReportTypeKey;
  } | null>(null);
  const [generateMessage, setGenerateMessage] = useState<string | null>(null);

  const { events, venues, loading, error, refetch } = useReportData(selectedReportOrgId, dateRange);
  const { start: rangeStart, end: rangeEnd } = getDateRangeBounds(dateRange);
  const allSampleEvents = useMemo(() => getSampleReportEvents(), []);
  const allSampleVenues = useMemo(() => getSampleReportVenues(), []);

  const reportEvents = useMemo(() => {
    if (useSamplePreview) {
      return allSampleEvents.filter((e) => {
        const d = e.date || '';
        return d >= rangeStart && d <= rangeEnd;
      });
    }
    return events;
  }, [useSamplePreview, allSampleEvents, events, rangeStart, rangeEnd]);

  const reportVenues = useSamplePreview ? allSampleVenues : venues;
  const showLiveLoading = loading && !useSamplePreview;

  useEffect(() => {
    if (isSuperAdmin) {
      apiClient
        .from('organizations')
        .select('id, name')
        .order('name')
        .then(({ data }) => setOrganizations((data as OrgOption[]) || []));
    }
  }, [isSuperAdmin]);

  const reportData = useMemo((): ReportData[] => {
    const byMonth: Record<string, { events: number; revenue: number; attendees: number }> = {};
    reportEvents.forEach((e) => {
      if (!e.date) return;
      const key = e.date.slice(0, 7);
      if (!byMonth[key]) byMonth[key] = { events: 0, revenue: 0, attendees: 0 };
      byMonth[key].events += 1;
      byMonth[key].revenue += e.totalRevenue || 0;
      byMonth[key].attendees += e.attendees || 0;
    });
    const sorted = Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b));
    const prev: Record<string, number> = {};
    return sorted.map(([ym, d], i) => {
      const prevRev = i > 0 ? sorted[i - 1][1].revenue : d.revenue;
      const growth = prevRev > 0 ? ((d.revenue - prevRev) / prevRev) * 100 : 0;
      const [y, m] = ym.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const period = `${monthNames[parseInt(m, 10) - 1]} ${y}`;
      return {
        period,
        events: d.events,
        revenue: d.revenue,
        attendees: d.attendees,
        societies: reportVenues.length,
        growth,
      };
    });
  }, [reportEvents, reportVenues.length]);

  const eventPerformanceRows = useMemo((): EventPerformanceRow[] => {
    return reportEvents
      .slice()
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
      .map((e) => ({
        id: e.id,
        name: e.title || 'Untitled',
        date: e.date || '',
        attendees: e.attendees || 0,
        revenue: e.totalRevenue || 0,
        satisfaction: e.satisfactionScore ?? undefined,
        roi: e.roiPercent ?? undefined,
      }));
  }, [reportEvents]);

  const cityPerformance = useMemo((): CityPerformance[] => {
    const byCity: Record<string, { events: number; revenue: number; venueIds: Set<string> }> = {};
    reportEvents.forEach((e) => {
      const city = (e.city || '').trim() || 'Unknown';
      if (!byCity[city]) byCity[city] = { events: 0, revenue: 0, venueIds: new Set() };
      byCity[city].events += 1;
      byCity[city].revenue += e.totalRevenue || 0;
      if (e.venueId) byCity[city].venueIds.add(e.venueId);
    });
    const venueCountByCity: Record<string, number> = {};
    reportVenues.forEach((v) => {
      const c = (v.city || '').trim() || 'Unknown';
      venueCountByCity[c] = (venueCountByCity[c] || 0) + 1;
    });
    const growthSeeds = [14.2, -2.1, 9.8, 6.3, -0.5, 11.0, 4.4, 7.1];
    const rows = Object.entries(byCity)
      .map(([city, d], i) => ({
        city,
        events: d.events,
        revenue: d.revenue,
        societies: venueCountByCity[city] ?? 0,
        growth: useSamplePreview ? growthSeeds[i % growthSeeds.length] : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
    return rows;
  }, [reportEvents, reportVenues, useSamplePreview]);

  const planDistribution = useMemo(() => {
    const count: Record<string, number> = {};
    reportEvents.forEach((e) => {
      const plan = (e.planType as string) || 'Unset';
      count[plan] = (count[plan] || 0) + 1;
    });
    const total = reportEvents.length;
    return Object.entries(count).map(([type, n]) => ({
      type,
      count: n,
      percentage: total > 0 ? Math.round((n / total) * 100) : 0,
      color: PLAN_TYPE_COLORS[type] || 'bg-gray-500',
    }));
  }, [reportEvents]);

  const topVenues = useMemo(() => {
    return reportVenues
      .slice()
      .sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0))
      .slice(0, 10)
      .map((v) => ({
        name: v.name,
        events: v.activeEvents || 0,
        revenue: v.totalRevenue || 0,
        growth: 0,
      }));
  }, [reportVenues]);

  const totalRevenue = reportData.reduce((sum, d) => sum + d.revenue, 0);
  const totalEvents = reportEvents.length;
  const totalAttendees = reportEvents.reduce((sum, e) => sum + (e.attendees || 0), 0);
  const avgGrowth = reportData.length > 0
    ? reportData.reduce((sum, d) => sum + d.growth, 0) / reportData.length
    : 0;
  const currentMonth = reportData[reportData.length - 1];
  const previousMonth = reportData[reportData.length - 2];
  const revenueGrowth = previousMonth && previousMonth.revenue > 0 && currentMonth
    ? ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100
    : 0;
  const eventGrowth = previousMonth && previousMonth.events > 0 && currentMonth
    ? ((currentMonth.events - previousMonth.events) / previousMonth.events) * 100
    : 0;
  const attendeeGrowth = previousMonth && previousMonth.attendees > 0 && currentMonth
    ? ((currentMonth.attendees - previousMonth.attendees) / previousMonth.attendees) * 100
    : 0;

  const avgEventSize = totalEvents > 0 ? Math.round(totalAttendees / totalEvents) : 0;
  const avgRevenuePerEvent = totalEvents > 0 ? Math.round(totalRevenue / totalEvents) : 0;
  const completedCount = reportEvents.filter((e) => e.status === 'completed' || e.status === 'ongoing').length;
  const eventSuccessRate = totalEvents > 0 ? Math.round((completedCount / totalEvents) * 1000) / 10 : 0;

  const revenueForStreams =
    totalRevenue > 0
      ? totalRevenue
      : useSamplePreview && reportEvents.length === 0
        ? 3200000
        : 0;
  const revenueStreams = useMemo(
    () =>
      useSamplePreview && revenueForStreams > 0 ? getSampleRevenueStreams(revenueForStreams) : null,
    [useSamplePreview, revenueForStreams]
  );
  const expenseLines = useSamplePreview ? getSampleExpenseLines() : [];
  const sampleSavedReports = useMemo(() => getSampleSavedReports(), []);

  const customReportAnalytics = useMemo((): CustomReportAnalytics => {
    const satVals = reportEvents
      .map((e) => e.satisfactionScore)
      .filter((x): x is number => typeof x === 'number');
    const roiVals = reportEvents
      .map((e) => e.roiPercent)
      .filter((x): x is number => typeof x === 'number');
    const avgSatisfaction = satVals.length ? satVals.reduce((a, b) => a + b, 0) / satVals.length : null;
    const avgRoi = roiVals.length ? roiVals.reduce((a, b) => a + b, 0) / roiVals.length : null;
    const capacityTotal = reportEvents.reduce((s, e) => s + (e.maxCapacity || 0), 0);
    const capacityFillPct =
      capacityTotal > 0 ? Math.min(100, Math.round((totalAttendees / capacityTotal) * 100)) : null;

    const streams =
      revenueStreams ??
      (totalRevenue > 0 ? [{ label: 'Event revenue', amount: totalRevenue, color: 'bg-blue-500' }] : []);

    const orgLabel = isSuperAdmin
      ? selectedReportOrgId === 'all'
        ? 'All organizations'
        : organizations.find((o) => o.id === selectedReportOrgId)?.name ?? 'Selected organization'
      : user?.organizationName ?? 'Your organization';

    const topEvents = [...eventPerformanceRows]
      .sort((a, b) => b.revenue - a.revenue)
      .map((e) => ({
        name: e.name,
        date: e.date,
        revenue: e.revenue,
        attendees: e.attendees,
        satisfaction: e.satisfaction,
        roi: e.roi,
      }));

    return {
      dateRangeLabel: DATE_RANGE_LABELS[dateRange] ?? dateRange,
      orgLabel,
      totalRevenue,
      totalEvents,
      totalAttendees,
      avgRevenuePerEvent,
      eventSuccessRate,
      revenueGrowthPct: revenueGrowth,
      attendeeGrowthPct: attendeeGrowth,
      hasMonthOverMonth: reportData.length >= 2,
      avgSatisfaction,
      avgRoi,
      capacityTotal,
      capacityFillPct,
      planDistribution,
      topCities: cityPerformance,
      topEvents,
      topVenues: topVenues.map((v) => ({ name: v.name, revenue: v.revenue, events: v.events })),
      revenueStreams: streams,
      expenseLines: expenseLines.length ? expenseLines : [],
      expensesAreIllustrative: useSamplePreview && expenseLines.length > 0,
    };
  }, [
    reportEvents,
    totalRevenue,
    totalEvents,
    totalAttendees,
    avgRevenuePerEvent,
    eventSuccessRate,
    revenueGrowth,
    attendeeGrowth,
    reportData.length,
    cityPerformance,
    eventPerformanceRows,
    topVenues,
    planDistribution,
    revenueStreams,
    expenseLines,
    dateRange,
    isSuperAdmin,
    selectedReportOrgId,
    organizations,
    user?.organizationName,
    useSamplePreview,
  ]);

  const savedReportsList: SavedReportForView[] = useMemo(() => {
    const base: SavedReportForView[] = useSamplePreview
      ? sampleSavedReports
      : [
          {
            name: 'Monthly Revenue Summary',
            type: 'Revenue',
            description: 'Rolling monthly revenue totals and event contribution.',
            lastGenerated: '2024-06-01',
            format: 'PDF',
            rows: 48,
            schedule: 'Monthly',
          },
          {
            name: 'Q2 Performance Report',
            type: 'Performance',
            description: 'Quarterly attendance, satisfaction, and ROI snapshot.',
            lastGenerated: '2024-05-30',
            format: 'Excel',
            rows: 120,
            schedule: 'Quarterly',
          },
          {
            name: 'Venue Engagement Analysis',
            type: 'Venue',
            description: 'Venue utilization and revenue ranking.',
            lastGenerated: '2024-05-28',
            format: 'Dashboard',
            rows: 36,
            schedule: 'On demand',
          },
          {
            name: 'Vendor Performance Review',
            type: 'Vendor',
            description: 'Vendor-linked events and estimated commissions.',
            lastGenerated: '2024-05-25',
            format: 'PDF',
            rows: 72,
            schedule: 'Monthly',
          },
        ];
    return [...userGeneratedReports, ...base];
  }, [useSamplePreview, sampleSavedReports, userGeneratedReports]);

  const countRowsForReportType = (typeKey: CustomReportTypeKey): number => {
    switch (typeKey) {
      case 'revenue':
        return reportData.length;
      case 'attendance':
        return cityPerformance.length;
      case 'venue':
        return topVenues.length;
      case 'vendor':
        return VENDOR_EXPORT_ROWS.length;
      default:
        return eventPerformanceRows.length;
    }
  };

  const exportReportByType = (typeKey: CustomReportTypeKey, slug?: string): boolean => {
    const fileSlug = slug || `custom-${typeKey}-report`;

    switch (typeKey) {
      case 'revenue':
        return downloadCsv(
          csvFilename(fileSlug),
          ['Period', 'Events', 'Revenue', 'Attendees', 'Venues', 'Growth %'],
          reportData.map((row) => [
            row.period,
            row.events,
            row.revenue,
            row.attendees,
            row.societies,
            row.growth.toFixed(1),
          ]),
        );
      case 'attendance':
        return downloadCsv(
          csvFilename(fileSlug),
          ['City', 'Events', 'Revenue', 'Venues', 'Growth %'],
          cityPerformance.map((city) => [
            city.city,
            city.events,
            city.revenue,
            city.societies,
            city.growth.toFixed(1),
          ]),
        );
      case 'venue':
        return downloadCsv(
          csvFilename(fileSlug),
          ['Venue', 'Events', 'Revenue', 'Growth %'],
          topVenues.map((venue) => [venue.name, venue.events, venue.revenue, venue.growth]),
        );
      case 'vendor':
        return downloadCsv(
          csvFilename(fileSlug),
          ['Vendor', 'Category', 'Linked Events', 'Est. Commission', 'YoY'],
          VENDOR_EXPORT_ROWS,
        );
      default:
        return downloadCsv(
          csvFilename(fileSlug),
          ['Event Name', 'Date', 'Attendees', 'Revenue', 'Satisfaction', 'ROI %'],
          eventPerformanceRows.map((event) => [
            event.name,
            event.date,
            event.attendees,
            event.revenue,
            event.satisfaction ?? '',
            event.roi ?? '',
          ]),
        );
    }
  };

  const handleGenerateCustomReport = () => {
    const rangeKey = mapCustomFormDateRange(customReportDateRange, dateRange);
    const rangeLabel =
      customReportDateRange === 'custom'
        ? DATE_RANGE_LABELS[dateRange] ?? dateRange
        : CUSTOM_FORM_DATE_RANGE_LABELS[customReportDateRange];
    const typeLabel = CUSTOM_REPORT_TYPE_LABELS[customReportType];
    const formatLabel = CUSTOM_REPORT_FORMAT_LABELS[customReportFormat];
    const today = new Date().toISOString().slice(0, 10);

    setIsGeneratingReport(true);
    setGenerateMessage(null);

    if (rangeKey !== dateRange) {
      setDateRange(rangeKey);
    }

    const report: SavedReportForView = {
      name: `${typeLabel} Report — ${rangeLabel}`,
      type: typeLabel,
      description: `${typeLabel} analysis for ${rangeLabel}. Generated on ${today}.`,
      lastGenerated: today,
      format: formatLabel,
      rows: countRowsForReportType(customReportType),
      schedule: 'On demand',
    };

    setUserGeneratedReports((prev) => [report, ...prev]);
    setPendingGeneratedReport({
      report,
      format: customReportFormat,
      type: customReportType,
    });
  };

  useEffect(() => {
    if (!pendingGeneratedReport) return;
    if (showLiveLoading) {
      if (error) {
        setPendingGeneratedReport(null);
        setIsGeneratingReport(false);
        window.alert('Failed to load report data. Please try again.');
      }
      return;
    }

    const { report, format, type } = pendingGeneratedReport;

    if (format === 'dashboard' || format === 'pdf') {
      setViewingCustomReport(report);
      setGenerateMessage(
        format === 'pdf'
          ? 'Report opened — use Print / Save as PDF in the viewer.'
          : 'Report generated — opened in the interactive dashboard.',
      );
    } else {
      const slug = report.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
      const ok = exportReportByType(type, slug);
      if (!ok) {
        window.alert('No data available to export for this report.');
      } else {
        setGenerateMessage(`Report downloaded as Excel (${report.rows ?? 0} rows).`);
      }
    }

    setPendingGeneratedReport(null);
    setIsGeneratingReport(false);
  }, [
    pendingGeneratedReport,
    showLiveLoading,
    reportData,
    eventPerformanceRows,
    cityPerformance,
    topVenues,
    error,
  ]);

  useEffect(() => {
    if (!generateMessage) return;
    const timer = window.setTimeout(() => setGenerateMessage(null), 6000);
    return () => window.clearTimeout(timer);
  }, [generateMessage]);

  const handleExportReport = () => {
    let ok = false;

    switch (activeTab) {
      case 'events':
        ok = downloadCsv(
          csvFilename('event-performance-export'),
          ['Event Name', 'Date', 'Attendees', 'Revenue', 'Satisfaction', 'ROI %'],
          eventPerformanceRows.map((event) => [
            event.name,
            event.date,
            event.attendees,
            event.revenue,
            event.satisfaction ?? '',
            event.roi ?? '',
          ]),
        );
        break;
      case 'financial': {
        const streamRows =
          revenueStreams ??
          (totalRevenue > 0 ? [{ label: 'Event revenue', amount: totalRevenue }] : []);
        const rows = [
          ...streamRows.map((row) => ['Revenue', row.label, row.amount]),
          ...expenseLines.map((row) => ['Expense', row.label, row.amount]),
        ];
        ok = downloadCsv(csvFilename('financial-report-export'), ['Type', 'Label', 'Amount'], rows);
        break;
      }
      case 'performance':
        ok = downloadCsv(
          csvFilename('city-performance-export'),
          ['City', 'Events', 'Revenue', 'Venues', 'Growth %'],
          cityPerformance.map((city) => [
            city.city,
            city.events,
            city.revenue,
            city.societies,
            city.growth.toFixed(1),
          ]),
        );
        break;
      case 'custom':
        ok = downloadCsv(
          csvFilename('saved-reports-export'),
          ['Name', 'Type', 'Description', 'Last Generated', 'Format', 'Rows', 'Schedule'],
          savedReportsList.map((report) => [
            report.name,
            report.type,
            report.description ?? '',
            report.lastGenerated,
            report.format,
            report.rows ?? '',
            report.schedule ?? '',
          ]),
        );
        break;
      default:
        ok = downloadCsv(
          csvFilename('reports-overview-export'),
          ['Period', 'Events', 'Revenue', 'Attendees', 'Venues', 'Growth %'],
          reportData.map((row) => [
            row.period,
            row.events,
            row.revenue,
            row.attendees,
            row.societies,
            row.growth.toFixed(1),
          ]),
        );
    }

    if (!ok) {
      window.alert('No data available to export for the current view.');
    }
  };

  const handleDownloadSavedReport = (report: SavedReportForView) => {
    const slug = report.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    const type = report.type.toLowerCase();
    let ok = false;

    if (type.includes('revenue')) {
      ok = exportReportByType('revenue', slug);
    } else if (type.includes('performance') || type.includes('custom')) {
      ok = exportReportByType('custom', slug);
    } else if (type.includes('attendance') || type.includes('city') || type.includes('region')) {
      ok = exportReportByType('attendance', slug);
    } else if (type.includes('venue')) {
      ok = exportReportByType('venue', slug);
    } else if (type.includes('vendor')) {
      ok = exportReportByType('vendor', slug);
    } else {
      ok = exportReportByType('custom', slug);
    }

    if (!ok) {
      window.alert('No data available to export for this report.');
    }
  };

  if (!hasRole(['super_admin', 'admin'])) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">You don&apos;t have access to reports. Only Admin (for your organization) and Super Admin can view reports.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 text-amber-800">{error}</CardContent>
        </Card>
      )}
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">
            {isSuperAdmin ? (
              selectedReportOrgId === 'all'
                ? 'Collective insights across all organizations'
                : `Reports for: ${organizations.find((o) => o.id === selectedReportOrgId)?.name ?? 'Selected organization'}`
            ) : (
              <>Organization: {user?.organizationName ?? 'Your organization'}</>
            )}
          </p>
          {useSamplePreview && (
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2 inline-block">
              Showing sample data — turn off &quot;Sample preview&quot; to use live data from your account.
            </p>
          )}
          {isSuperAdmin && (
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">View</label>
              <select
                value={selectedReportOrgId}
                onChange={(e) => setSelectedReportOrgId(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[200px]"
              >
                <option value="all">All organizations (collective)</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer whitespace-nowrap">
            <input
              type="checkbox"
              checked={useSamplePreview}
              onChange={(e) => setUseSamplePreview(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Sample preview
          </label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="last_7_days">Last 7 Days</option>
            <option value="last_30_days">Last 30 Days</option>
            <option value="last_3_months">Last 3 Months</option>
            <option value="last_6_months">Last 6 Months</option>
            <option value="last_year">Last Year</option>
          </select>
          <Button variant="outline" className="flex items-center space-x-2" onClick={() => refetch()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          <Button className="flex items-center space-x-2" onClick={handleExportReport}>
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {showLiveLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse h-16 bg-gray-200 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{(totalRevenue / 100000).toFixed(1)}L</p>
                <div className="flex items-center mt-1">
                  {reportData.length >= 2 && (
                    <>
                      {revenueGrowth >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(revenueGrowth).toFixed(1)}%
                      </span>
                      <span className="text-sm text-gray-500 ml-1">vs previous period</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{totalEvents}</p>
                <div className="flex items-center mt-1">
                  {reportData.length >= 2 && (
                    <>
                      {eventGrowth >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${eventGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(eventGrowth).toFixed(1)}%
                      </span>
                      <span className="text-sm text-gray-500 ml-1">vs previous period</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Attendees</p>
                <p className="text-2xl font-bold text-gray-900">{(totalAttendees / 1000).toFixed(1)}K</p>
                <div className="flex items-center mt-1">
                  {reportData.length >= 2 && (
                    <>
                      {attendeeGrowth >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${attendeeGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(attendeeGrowth).toFixed(1)}%
                      </span>
                      <span className="text-sm text-gray-500 ml-1">vs previous period</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Growth Rate</p>
                <p className="text-2xl font-bold text-gray-900">{avgGrowth.toFixed(1)}%</p>
                <div className="flex items-center mt-1">
                  <Activity className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-sm text-gray-500">Period average</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'events', label: 'Event Performance', icon: Calendar },
            { id: 'financial', label: 'Financial Reports', icon: DollarSign },
            { id: 'performance', label: 'City Performance', icon: MapPin },
            { id: 'custom', label: 'Custom Reports', icon: FileText }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend Chart */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
            </CardHeader>
            <CardContent>
              {reportData.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No event data for this period.</p>
              ) : (
                <>
                  <div className="h-64 flex items-end justify-between space-x-2">
                    {reportData.map((data, index) => {
                      const maxRev = Math.max(...reportData.map((d) => d.revenue), 1);
                      return (
                        <div key={data.period} className="flex flex-col items-center flex-1">
                          <div
                            className="w-full bg-blue-500 rounded-t-sm"
                            style={{
                              height: `${(data.revenue / maxRev) * 200}px`,
                              minHeight: data.revenue > 0 ? '20px' : '4px',
                            }}
                          />
                          <div className="text-xs text-gray-600 mt-2 text-center">
                            {data.period.split(' ')[0]}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 text-center text-sm text-gray-600">
                    Monthly Revenue (₹ Lakhs)
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Event Distribution by Plan Type */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Event Distribution (by Plan)</h3>
            </CardHeader>
            <CardContent>
              {planDistribution.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No events in this period.</p>
              ) : (
                <div className="space-y-4">
                  {planDistribution.map((item) => (
                    <div key={item.type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded ${item.color}`} />
                        <span className="text-sm font-medium text-gray-900">{item.type}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${item.color}`}
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-8">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Performing Venues */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Top Performing Venues</h3>
            </CardHeader>
            <CardContent>
              {topVenues.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No venue data.</p>
              ) : (
                <div className="space-y-4">
                  {topVenues.map((venue, index) => (
                    <div key={venue.name + index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{venue.name}</div>
                          <div className="text-sm text-gray-500">{venue.events} events</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">₹{(venue.revenue / 1000).toFixed(0)}K</div>
                        {venue.growth > 0 && (
                          <div className="text-sm text-green-600">+{venue.growth}%</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Quick Statistics</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-center mb-2">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{avgEventSize}</div>
                  <div className="text-sm text-gray-600">attendees</div>
                  <div className="text-xs text-gray-500 mt-1">Avg Event Size</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-center mb-2">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">₹{(avgRevenuePerEvent / 1000).toFixed(0)}K</div>
                  <div className="text-sm text-gray-600" />
                  <div className="text-xs text-gray-500 mt-1">Avg Revenue/Event</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-center mb-2">
                    <Target className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{eventSuccessRate}%</div>
                  <div className="text-sm text-gray-600" />
                  <div className="text-xs text-gray-500 mt-1">Event Success Rate</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-center mb-2">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {useSamplePreview ? '38' : '—'}
                  </div>
                  <div className="text-sm text-gray-600">days</div>
                  <div className="text-xs text-gray-500 mt-1">Avg Planning Time</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Event Performance Tab */}
      {activeTab === 'events' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Event Performance Analysis</h3>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={handleExportReport}>
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {eventPerformanceRows.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No events in this period.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Attendees</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Satisfaction</TableHead>
                    <TableHead>ROI</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eventPerformanceRows.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.name}</TableCell>
                      <TableCell>{event.date ? new Date(event.date).toLocaleDateString() : '—'}</TableCell>
                      <TableCell>{event.attendees}</TableCell>
                      <TableCell>₹{event.revenue.toLocaleString()}</TableCell>
                      <TableCell className="text-gray-600">
                        {event.satisfaction != null ? `${event.satisfaction.toFixed(1)}/5` : '—'}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {event.roi != null ? `${event.roi > 0 ? '+' : ''}${event.roi}%` : '—'}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Financial Reports Tab */}
      {activeTab === 'financial' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Revenue Breakdown</h3>
            </CardHeader>
            <CardContent>
              {revenueStreams ? (
                <div className="space-y-4">
                  {totalRevenue === 0 && useSamplePreview && (
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded px-2 py-1">
                      Illustrative revenue mix — no events fall in this date range.
                    </p>
                  )}
                  {revenueStreams.map((row) => {
                    const pct =
                      revenueForStreams > 0 ? Math.round((row.amount / revenueForStreams) * 100) : 0;
                    return (
                      <div key={row.label} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className={`w-4 h-4 rounded shrink-0 ${row.color}`} />
                          <span className="text-sm font-medium text-gray-900 truncate">{row.label}</span>
                        </div>
                        <div className="flex items-center space-x-3 shrink-0">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${row.color}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-24 text-right">
                            ₹{(row.amount / 100000).toFixed(1)}L
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <p className="text-xs text-gray-500 mt-2">
                    {useSamplePreview
                      ? 'Sample split — connect real ledger data to replace this view.'
                      : 'Other sources (vendor commissions, sponsorships, etc.) coming soon.'}
                  </p>
                </div>
              ) : totalRevenue === 0 ? (
                <p className="text-gray-500 text-center py-6">No revenue data for this period.</p>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded bg-blue-500" />
                      <span className="text-sm font-medium text-gray-900">Event revenue</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="h-2 rounded-full bg-blue-500" style={{ width: '100%' }} />
                      </div>
                      <span className="text-sm text-gray-600 w-20 text-right">
                        ₹{(totalRevenue / 100000).toFixed(1)}L
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Other sources (vendor commissions, sponsorships, etc.) coming soon.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Expense Analysis</h3>
            </CardHeader>
            <CardContent>
              {expenseLines.length > 0 ? (
                <div className="space-y-4">
                  {(() => {
                    const expTotal = expenseLines.reduce((s, x) => s + x.amount, 0);
                    return expenseLines.map((row) => {
                      const pct = expTotal > 0 ? Math.round((row.amount / expTotal) * 100) : 0;
                      return (
                        <div key={row.label} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 min-w-0">
                            <div className={`w-4 h-4 rounded shrink-0 ${row.color}`} />
                            <span className="text-sm font-medium text-gray-900 truncate">{row.label}</span>
                          </div>
                          <div className="flex items-center space-x-3 shrink-0">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${row.color}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 w-24 text-right">
                              ₹{(row.amount / 100000).toFixed(1)}L
                            </span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                  <p className="text-xs text-gray-500 mt-2">Sample expense categories — live data when finance module is connected.</p>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No expense data available. Coming soon.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* City Performance Tab */}
      {activeTab === 'performance' && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">City-wise Performance</h3>
          </CardHeader>
          <CardContent>
            {cityPerformance.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No event data by city for this period.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>City</TableHead>
                    <TableHead>Events</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Venues</TableHead>
                    <TableHead>Growth Rate</TableHead>
                    <TableHead>Market Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cityPerformance.map((city) => {
                    const maxCityRev = Math.max(...cityPerformance.map((c) => c.revenue), 1);
                    const share = (city.revenue / maxCityRev) * 100;
                    return (
                      <TableRow key={city.city}>
                        <TableCell className="font-medium">{city.city}</TableCell>
                        <TableCell>{city.events}</TableCell>
                        <TableCell>₹{(city.revenue / 100000).toFixed(1)}L</TableCell>
                        <TableCell>{city.societies}</TableCell>
                        <TableCell>
                          {city.growth !== 0 ? (
                            <span className={city.growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {city.growth > 0 ? '+' : ''}
                              {city.growth.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-gray-500">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${share}%` }}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Custom Reports Tab */}
      {activeTab === 'custom' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Create Custom Report</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                  <select
                    value={customReportType}
                    onChange={(e) => setCustomReportType(e.target.value as CustomReportTypeKey)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="revenue">Revenue Analysis</option>
                    <option value="attendance">Attendance Report</option>
                    <option value="venue">Venue Performance</option>
                    <option value="vendor">Vendor Analysis</option>
                    <option value="custom">Custom Metrics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <select
                    value={customReportDateRange}
                    onChange={(e) => setCustomReportDateRange(e.target.value as CustomReportDateRangeKey)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="last_week">Last Week</option>
                    <option value="last_month">Last Month</option>
                    <option value="last_quarter">Last Quarter</option>
                    <option value="last_year">Last Year</option>
                    <option value="custom">Use page date range ({DATE_RANGE_LABELS[dateRange] ?? dateRange})</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                  <select
                    value={customReportFormat}
                    onChange={(e) => setCustomReportFormat(e.target.value as CustomReportFormatKey)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pdf">PDF Report</option>
                    <option value="excel">Excel Spreadsheet</option>
                    <option value="csv">CSV Data</option>
                    <option value="dashboard">Interactive Dashboard</option>
                  </select>
                </div>
              </div>

              {generateMessage && (
                <p className="mt-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  {generateMessage}
                </p>
              )}

              <div className="mt-6">
                <Button
                  className="flex items-center space-x-2"
                  onClick={handleGenerateCustomReport}
                  disabled={isGeneratingReport}
                >
                  <FileText className={`h-4 w-4 ${isGeneratingReport ? 'animate-pulse' : ''}`} />
                  <span>{isGeneratingReport ? 'Generating…' : 'Generate Report'}</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Saved Reports</h3>
              <p className="text-sm text-gray-500 font-normal mt-1">
                {useSamplePreview
                  ? 'Rich sample metadata — persisted saved reports when the feature ships.'
                  : 'Sample list — saved reports will be available when the feature is enabled.'}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {savedReportsList.map((report, index) => (
                  <div key={`${report.name}-${report.lastGenerated}-${index}`} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="min-w-0">
                      <h4 className="font-medium text-gray-900">{report.name}</h4>
                      {report.description ? (
                        <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                      ) : null}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                        <Badge variant="default">{report.type}</Badge>
                        <span className="text-sm text-gray-500">Last: {report.lastGenerated}</span>
                        <span className="text-sm text-gray-500">Format: {report.format}</span>
                        {report.rows > 0 && (
                          <span className="text-sm text-gray-500">{report.rows} rows</span>
                        )}
                        {report.schedule ? (
                          <span className="text-sm text-gray-500">Schedule: {report.schedule}</span>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex space-x-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        type="button"
                        aria-label={`View ${report.name}`}
                        onClick={() => setViewingCustomReport(report)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        type="button"
                        aria-label={`Download ${report.name}`}
                        onClick={() => handleDownloadSavedReport(report)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <CustomReportViewModal
        open={viewingCustomReport != null}
        onClose={() => setViewingCustomReport(null)}
        report={viewingCustomReport}
        analytics={customReportAnalytics}
      />
    </div>
  );
};