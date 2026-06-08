import React, { useEffect, useMemo } from 'react';
import {
  X,
  FileText,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  MapPin,
  Building2,
  Package,
  PieChart,
  BarChart3,
  Activity,
} from 'lucide-react';
import { Badge } from '../UI/Badge';
import { Button } from '../UI/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../UI/Table';

export interface SavedReportForView {
  name: string;
  type: string;
  description?: string;
  lastGenerated: string;
  format: string;
  rows?: number;
  schedule?: string;
}

export interface CustomReportAnalytics {
  dateRangeLabel: string;
  orgLabel: string;
  totalRevenue: number;
  totalEvents: number;
  totalAttendees: number;
  avgRevenuePerEvent: number;
  eventSuccessRate: number;
  revenueGrowthPct: number;
  attendeeGrowthPct: number;
  hasMonthOverMonth: boolean;
  avgSatisfaction: number | null;
  avgRoi: number | null;
  capacityTotal: number;
  capacityFillPct: number | null;
  planDistribution: { type: string; count: number; percentage: number; color: string }[];
  topCities: { city: string; revenue: number; events: number; growth: number }[];
  topEvents: {
    name: string;
    date: string;
    revenue: number;
    attendees: number;
    satisfaction?: number;
    roi?: number;
  }[];
  topVenues: { name: string; revenue: number; events: number }[];
  revenueStreams: { label: string; amount: number; color: string }[];
  expenseLines: { label: string; amount: number; color: string }[];
  expensesAreIllustrative: boolean;
}

const VENDOR_PLACEHOLDER = [
  { vendor: 'Catering Partners Collective', category: 'F&B', linkedEvents: 14, estCommission: 212000, yoy: '+11%' },
  { vendor: 'Stage & AV Pro', category: 'Production', linkedEvents: 9, estCommission: 168000, yoy: '+4%' },
  { vendor: 'Booth Build Co.', category: 'Fabrication', linkedEvents: 11, estCommission: 94500, yoy: '—' },
  { vendor: 'Security & Access Ltd.', category: 'Operations', linkedEvents: 22, estCommission: 128000, yoy: '+7%' },
];

function formatINR(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString('en-IN')}`;
}

function InsightPill({ positive, children }: { positive: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        positive ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
      }`}
    >
      {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {children}
    </span>
  );
}

export const CustomReportViewModal: React.FC<{
  open: boolean;
  onClose: () => void;
  report: SavedReportForView | null;
  analytics: CustomReportAnalytics | null;
}> = ({ open, onClose, report, analytics }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const reportKind = useMemo(() => {
    const t = (report?.type || '').toLowerCase();
    if (t.includes('revenue')) return 'revenue';
    if (t.includes('performance')) return 'performance';
    if (t.includes('attendance')) return 'attendance';
    if (t.includes('venue')) return 'venue';
    if (t.includes('vendor')) return 'vendor';
    if (t.includes('custom')) return 'custom';
    return 'general';
  }, [report?.type]);

  if (!open || !report || !analytics) return null;

  const {
    dateRangeLabel,
    orgLabel,
    totalRevenue,
    totalEvents,
    totalAttendees,
    avgRevenuePerEvent,
    eventSuccessRate,
    revenueGrowthPct,
    attendeeGrowthPct,
    hasMonthOverMonth,
    avgSatisfaction,
    avgRoi,
    capacityFillPct,
    planDistribution,
    topCities,
    topEvents,
    topVenues,
    revenueStreams,
    expenseLines,
    expensesAreIllustrative,
  } = analytics;

  const streamTotal = revenueStreams.reduce((s, r) => s + r.amount, 0) || 1;
  const expenseTotal = expenseLines.reduce((s, r) => s + r.amount, 0) || 1;
  const netNarrative =
    expenseLines.length > 0 && totalRevenue > 0
      ? `Estimated net after sample costs: ${formatINR(Math.max(0, totalRevenue - expenseTotal))}`
      : null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-report-view-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="shrink-0 border-b border-gray-200 bg-gradient-to-r from-slate-900 to-slate-800 text-white px-5 py-4">
          <div className="flex justify-between items-start gap-4">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">Saved report</p>
              <h2 id="custom-report-view-title" className="text-xl font-bold leading-tight truncate">
                {report.name}
              </h2>
              <p className="text-sm text-slate-300 mt-1 line-clamp-2">{report.description || 'Generated analytics for the selected scope.'}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge className="bg-white/15 text-white border-0 hover:bg-white/20">{report.type}</Badge>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Generated {new Date(report.lastGenerated).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                </span>
                <span className="text-xs text-slate-400">· {report.format}</span>
                {report.rows != null && report.rows > 0 && (
                  <span className="text-xs text-slate-400">· {report.rows} data rows</span>
                )}
                {report.schedule ? <span className="text-xs text-slate-400">· {report.schedule}</span> : null}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-3 border-t border-white/10 pt-3">
            Scope: <span className="text-slate-200">{orgLabel}</span> · Period:{' '}
            <span className="text-slate-200">{dateRangeLabel}</span>
          </p>
        </header>

        <div className="overflow-y-auto flex-1 px-5 py-5 space-y-6 bg-slate-50/80">
          {/* Executive KPIs */}
          <section className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-gray-900">Executive summary</h3>
            </div>
            <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-lg border border-gray-100 p-3 bg-gradient-to-br from-emerald-50/80 to-white">
                <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" /> Total revenue
                </p>
                <p className="text-lg font-bold text-gray-900 mt-1">{formatINR(totalRevenue)}</p>
                {hasMonthOverMonth && Number.isFinite(revenueGrowthPct) && (
                  <p className="mt-2">
                    <InsightPill positive={revenueGrowthPct >= 0}>
                      {revenueGrowthPct >= 0 ? '+' : ''}
                      {revenueGrowthPct.toFixed(1)}% vs prior month
                    </InsightPill>
                  </p>
                )}
              </div>
              <div className="rounded-lg border border-gray-100 p-3 bg-gradient-to-br from-blue-50/80 to-white">
                <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Events
                </p>
                <p className="text-lg font-bold text-gray-900 mt-1">{totalEvents}</p>
                <p className="text-xs text-gray-500 mt-1">In selected period</p>
              </div>
              <div className="rounded-lg border border-gray-100 p-3 bg-gradient-to-br from-violet-50/80 to-white">
                <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> Attendees
                </p>
                <p className="text-lg font-bold text-gray-900 mt-1">{totalAttendees.toLocaleString('en-IN')}</p>
                {hasMonthOverMonth && Number.isFinite(attendeeGrowthPct) && (
                  <p className="mt-2">
                    <InsightPill positive={attendeeGrowthPct >= 0}>
                      {attendeeGrowthPct >= 0 ? '+' : ''}
                      {attendeeGrowthPct.toFixed(1)}% vs prior month
                    </InsightPill>
                  </p>
                )}
              </div>
              <div className="rounded-lg border border-gray-100 p-3 bg-gradient-to-br from-amber-50/80 to-white">
                <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
                  <Target className="h-3.5 w-3.5" /> Success & yield
                </p>
                <p className="text-lg font-bold text-gray-900 mt-1">{eventSuccessRate}%</p>
                <p className="text-xs text-gray-500 mt-1">
                  Avg {formatINR(avgRevenuePerEvent)} / event
                  {capacityFillPct != null && (
                    <> · ~{capacityFillPct}% capacity filled</>
                  )}
                </p>
              </div>
            </div>
          </section>

          {/* Type-specific analytics */}
          {(reportKind === 'revenue' || reportKind === 'custom' || reportKind === 'general') && revenueStreams.length > 0 && (
            <section className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <PieChart className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-semibold text-gray-900">Revenue composition</h3>
              </div>
              <div className="p-4 space-y-3">
                {revenueStreams.map((row) => {
                  const pct = Math.round((row.amount / streamTotal) * 100);
                  return (
                    <div key={row.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 font-medium">{row.label}</span>
                        <span className="text-gray-900 tabular-nums">{formatINR(row.amount)}</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                        <div className={`h-full rounded-full ${row.color}`} style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{pct}% of attributed revenue</p>
                    </div>
                  );
                })}
                {netNarrative && <p className="text-sm text-gray-600 pt-2 border-t border-gray-100">{netNarrative}</p>}
              </div>
            </section>
          )}

          {(reportKind === 'performance' || reportKind === 'custom') && (
            <section className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <Activity className="h-4 w-4 text-cyan-600" />
                <h3 className="text-sm font-semibold text-gray-900">Experience & ROI</h3>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg bg-slate-50 border border-slate-100 p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Avg satisfaction</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {avgSatisfaction != null ? `${avgSatisfaction.toFixed(1)} / 5` : '—'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Across events with scores</p>
                </div>
                <div className="rounded-lg bg-slate-50 border border-slate-100 p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Avg ROI</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {avgRoi != null ? `${avgRoi > 0 ? '+' : ''}${avgRoi.toFixed(0)}%` : '—'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Portfolio-level indicator</p>
                </div>
              </div>
            </section>
          )}

          {(reportKind === 'attendance' || reportKind === 'custom') && (
            <section className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <Users className="h-4 w-4 text-violet-600" />
                <h3 className="text-sm font-semibold text-gray-900">Attendance analytics</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-lg border border-gray-100">
                    <p className="text-2xl font-bold text-gray-900">{totalAttendees.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-gray-500">Total check-ins / RSVPs</p>
                  </div>
                  <div className="p-3 rounded-lg border border-gray-100">
                    <p className="text-2xl font-bold text-gray-900">
                      {totalEvents > 0 ? Math.round(totalAttendees / totalEvents) : 0}
                    </p>
                    <p className="text-xs text-gray-500">Avg per event</p>
                  </div>
                  <div className="p-3 rounded-lg border border-gray-100">
                    <p className="text-2xl font-bold text-gray-900">
                      {capacityFillPct != null ? `${capacityFillPct}%` : '—'}
                    </p>
                    <p className="text-xs text-gray-500">Est. capacity utilization</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {(reportKind === 'venue' || reportKind === 'custom') && topVenues.length > 0 && (
            <section className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-teal-600" />
                <h3 className="text-sm font-semibold text-gray-900">Venue leaderboard</h3>
              </div>
              <div className="p-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Venue</TableHead>
                      <TableHead className="text-right">Events</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topVenues.slice(0, 8).map((v, idx) => (
                      <TableRow key={`${v.name}-${idx}`}>
                        <TableCell className="font-medium text-gray-900 max-w-[200px] truncate">{v.name}</TableCell>
                        <TableCell className="text-right tabular-nums">{v.events}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatINR(v.revenue)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>
          )}

          {reportKind === 'vendor' && (
            <section className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <Package className="h-4 w-4 text-orange-600" />
                <h3 className="text-sm font-semibold text-gray-900">Vendor contribution (sample)</h3>
              </div>
              <div className="p-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Events</TableHead>
                      <TableHead className="text-right">Est. commission</TableHead>
                      <TableHead className="text-right">Trend</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {VENDOR_PLACEHOLDER.map((row) => (
                      <TableRow key={row.vendor}>
                        <TableCell className="font-medium text-gray-900">{row.vendor}</TableCell>
                        <TableCell className="text-gray-600">{row.category}</TableCell>
                        <TableCell className="text-right tabular-nums">{row.linkedEvents}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatINR(row.estCommission)}</TableCell>
                        <TableCell className="text-right text-gray-600">{row.yoy}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <p className="text-xs text-gray-500 px-3 py-2">Live vendor ledger will replace placeholder rows.</p>
              </div>
            </section>
          )}

          {/* Regional + events detail */}
          {(reportKind === 'revenue' ||
            reportKind === 'performance' ||
            reportKind === 'attendance' ||
            reportKind === 'vendor' ||
            reportKind === 'custom' ||
            reportKind === 'general') && (
            <>
              {topCities.length > 0 && (
                <section className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-red-500" />
                    <h3 className="text-sm font-semibold text-gray-900">City concentration</h3>
                  </div>
                  <div className="p-4">
                    <div className="grid gap-2">
                      {topCities.slice(0, 6).map((c, i) => {
                        const maxR = Math.max(...topCities.map((x) => x.revenue), 1);
                        const w = (c.revenue / maxR) * 100;
                        return (
                          <div key={c.city} className="flex items-center gap-3 text-sm">
                            <span className="w-6 text-gray-400 font-medium">{i + 1}</span>
                            <span className="w-28 font-medium text-gray-900 truncate">{c.city}</span>
                            <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${w}%` }} />
                            </div>
                            <span className="w-24 text-right text-gray-700 tabular-nums">{formatINR(c.revenue)}</span>
                            <span className="w-14 text-right text-xs text-gray-500">{c.events} ev.</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              )}

              {topEvents.length > 0 && (
                <section className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-700" />
                    <h3 className="text-sm font-semibold text-gray-900">Top events by revenue</h3>
                  </div>
                  <div className="p-2 overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Event</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Attendees</TableHead>
                          <TableHead className="text-right">Revenue</TableHead>
                          {(reportKind === 'performance' || reportKind === 'custom') && (
                            <>
                              <TableHead className="text-right">Sat.</TableHead>
                              <TableHead className="text-right">ROI</TableHead>
                            </>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topEvents.slice(0, 10).map((e) => (
                          <TableRow key={e.name + e.date}>
                            <TableCell className="font-medium text-gray-900 max-w-[180px]">
                              <span className="line-clamp-2">{e.name}</span>
                            </TableCell>
                            <TableCell className="text-gray-600 whitespace-nowrap">
                              {e.date ? new Date(e.date).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—'}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">{e.attendees.toLocaleString('en-IN')}</TableCell>
                            <TableCell className="text-right tabular-nums font-medium">{formatINR(e.revenue)}</TableCell>
                            {(reportKind === 'performance' || reportKind === 'custom') && (
                              <>
                                <TableCell className="text-right text-gray-600">
                                  {e.satisfaction != null ? `${e.satisfaction.toFixed(1)}` : '—'}
                                </TableCell>
                                <TableCell className="text-right text-gray-600">
                                  {e.roi != null ? `${e.roi > 0 ? '+' : ''}${e.roi}%` : '—'}
                                </TableCell>
                              </>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </section>
              )}
            </>
          )}

          {/* Plan mix + expenses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {planDistribution.length > 0 && (
              <section className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-gray-700" />
                  <h3 className="text-sm font-semibold text-gray-900">Plan mix</h3>
                </div>
                <div className="p-4 space-y-3">
                  {planDistribution.map((p) => (
                    <div key={p.type}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${p.color}`} />
                          {p.type}
                        </span>
                        <span className="text-gray-600">
                          {p.count} ({p.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div className={`h-full rounded-full ${p.color}`} style={{ width: `${p.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {expenseLines.length > 0 && (
              <section className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-rose-600" />
                  <h3 className="text-sm font-semibold text-gray-900">
                    {expensesAreIllustrative ? 'Cost structure (illustrative)' : 'Expense breakdown'}
                  </h3>
                </div>
                <div className="p-4 space-y-2">
                  {expenseLines.map((row) => {
                    const pct = Math.round((row.amount / expenseTotal) * 100);
                    return (
                      <div key={row.label} className="flex justify-between text-sm">
                        <span className="text-gray-700 truncate pr-2">{row.label}</span>
                        <span className="text-gray-900 tabular-nums shrink-0">
                          {formatINR(row.amount)} <span className="text-gray-400">({pct}%)</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </div>

        <footer className="shrink-0 border-t border-gray-200 bg-white px-5 py-3 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button className="gap-2" type="button" onClick={() => window.print()}>
            <FileText className="h-4 w-4" />
            Print / Save as PDF
          </Button>
        </footer>
      </div>
    </div>
  );
};
