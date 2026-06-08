import { Event, Venue } from '../types';

/** YYYY-MM-DD for `monthsAgo` months before today, clamped day */
function sampleDate(monthsAgo: number, day: number): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - monthsAgo);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, last));
  return d.toISOString().split('T')[0];
}

/**
 * Rich sample events for Reports UI preview (multiple months, cities, plans, statuses).
 */
export function getSampleReportEvents(): Event[] {
  const now = new Date().toISOString();
  const rows: Partial<Event>[] = [
    { title: 'Holi Festival 2026', city: 'Mumbai', planType: 'Plan C', status: 'completed', attendees: 4200, maxCapacity: 5000, totalRevenue: 1850000, satisfactionScore: 4.6, roiPercent: 142 },
    { title: 'Tech Startup Expo', city: 'Bengaluru', planType: 'Plan B', status: 'completed', attendees: 3100, maxCapacity: 3500, totalRevenue: 1280000, satisfactionScore: 4.4, roiPercent: 118 },
    { title: 'Wedding Expo North', city: 'Delhi', planType: 'Plan A', status: 'ongoing', attendees: 2800, maxCapacity: 3000, totalRevenue: 980000, satisfactionScore: 4.2, roiPercent: 95 },
    { title: 'Food & Lifestyle Fair', city: 'Pune', planType: 'Custom', status: 'published', attendees: 0, maxCapacity: 2000, totalRevenue: 0, satisfactionScore: undefined, roiPercent: undefined },
    { title: 'Auto Parts Summit', city: 'Chennai', planType: 'Plan B', status: 'completed', attendees: 1650, maxCapacity: 1800, totalRevenue: 720000, satisfactionScore: 4.1, roiPercent: 88 },
    { title: 'Handicrafts Mela', city: 'Jaipur', planType: 'Plan A', status: 'completed', attendees: 890, maxCapacity: 1200, totalRevenue: 340000, satisfactionScore: 4.7, roiPercent: 156 },
    { title: 'Real Estate Showcase', city: 'Hyderabad', planType: 'Plan C', status: 'draft', attendees: 0, maxCapacity: 4000, totalRevenue: 0, satisfactionScore: undefined, roiPercent: undefined },
    { title: 'Monsoon Music Fest', city: 'Mumbai', planType: 'Plan B', status: 'completed', attendees: 5500, maxCapacity: 6000, totalRevenue: 2100000, satisfactionScore: 4.5, roiPercent: 131 },
    { title: 'Education Fair 2026', city: 'Delhi', planType: 'Plan A', status: 'completed', attendees: 1200, maxCapacity: 1500, totalRevenue: 410000, satisfactionScore: 4.0, roiPercent: 72 },
    { title: 'Fitness & Wellness Expo', city: 'Bengaluru', planType: 'Custom', status: 'completed', attendees: 2200, maxCapacity: 2500, totalRevenue: 950000, satisfactionScore: 4.3, roiPercent: 105 },
    { title: 'Diwali Shopping Fest', city: 'Mumbai', planType: 'Plan C', status: 'published', attendees: 0, maxCapacity: 8000, totalRevenue: 450000, satisfactionScore: undefined, roiPercent: 45 },
    { title: 'Agri Innovation Day', city: 'Indore', planType: 'Plan A', status: 'completed', attendees: 640, maxCapacity: 800, totalRevenue: 220000, satisfactionScore: 3.9, roiPercent: 68 },
    { title: 'Coastal Trade Meet', city: 'Kochi', planType: 'Plan B', status: 'completed', attendees: 980, maxCapacity: 1100, totalRevenue: 380000, satisfactionScore: 4.2, roiPercent: 91 },
    { title: 'Winter Carnival', city: 'Chandigarh', planType: 'Plan B', status: 'cancelled', attendees: 0, maxCapacity: 3000, totalRevenue: 120000, satisfactionScore: undefined, roiPercent: -12 },
    { title: 'SME Growth Summit', city: 'Ahmedabad', planType: 'Plan A', status: 'completed', attendees: 1450, maxCapacity: 1600, totalRevenue: 560000, satisfactionScore: 4.4, roiPercent: 102 },
    { title: 'Artisan Market Week', city: 'Jaipur', planType: 'Custom', status: 'completed', attendees: 2100, maxCapacity: 2200, totalRevenue: 780000, satisfactionScore: 4.8, roiPercent: 124 },
    { title: 'Corporate Sports League', city: 'Pune', planType: 'Plan C', status: 'ongoing', attendees: 1900, maxCapacity: 2400, totalRevenue: 890000, satisfactionScore: 4.1, roiPercent: 98 },
    { title: 'Green Energy Forum', city: 'Bengaluru', planType: 'Plan B', status: 'completed', attendees: 1750, maxCapacity: 2000, totalRevenue: 1020000, satisfactionScore: 4.6, roiPercent: 115 },
  ];

  const dates = [
    sampleDate(0, 8),
    sampleDate(0, 18),
    sampleDate(1, 5),
    sampleDate(1, 14),
    sampleDate(1, 22),
    sampleDate(2, 3),
    sampleDate(2, 12),
    sampleDate(2, 25),
    sampleDate(3, 6),
    sampleDate(3, 16),
    sampleDate(4, 2),
    sampleDate(4, 20),
    sampleDate(5, 4),
    sampleDate(5, 11),
    sampleDate(5, 28),
    sampleDate(0, 25),
    sampleDate(1, 28),
    sampleDate(3, 24),
  ];

  return rows.map((r, i) => {
    const id = `sample-event-${i + 1}`;
    const date = dates[i] ?? sampleDate(2, 15);
    return {
      id,
      title: r.title!,
      description: `Sample event for reports preview: ${r.title}`,
      date,
      eventEndDate: date,
      time: '10:00',
      eventEndTime: '18:00',
      venue: `Sample Venue ${(i % 5) + 1}`,
      city: r.city ?? 'Mumbai',
      status: r.status as Event['status'],
      attendees: r.attendees ?? 0,
      maxCapacity: r.maxCapacity ?? 1000,
      planType: r.planType as Event['planType'],
      vendors: [],
      venueId: `sample-venue-${(i % 8) + 1}`,
      totalRevenue: r.totalRevenue ?? 0,
      satisfactionScore: r.satisfactionScore,
      roiPercent: r.roiPercent,
      organizationId: null,
      created_at: now,
      updated_at: now,
    } as Event;
  });
}

export function getSampleReportVenues(): Venue[] {
  const now = new Date().toISOString();
  const rows = [
    { name: 'Grand Convention Centre — Mumbai', city: 'Mumbai', activeEvents: 8, totalRevenue: 4200000, location: 'Bandra' },
    { name: 'Tech Park Arena Bengaluru', city: 'Bengaluru', activeEvents: 6, totalRevenue: 3100000, location: 'Whitefield' },
    { name: 'Capital Expo Halls Delhi', city: 'Delhi', activeEvents: 5, totalRevenue: 2650000, location: 'Dwarka' },
    { name: 'Riverfront Pavilion Pune', city: 'Pune', activeEvents: 4, totalRevenue: 1420000, location: 'Kharadi' },
    { name: 'Heritage Grounds Jaipur', city: 'Jaipur', activeEvents: 3, totalRevenue: 980000, location: 'C-Scheme' },
    { name: 'Marina Bay Convention Kochi', city: 'Kochi', activeEvents: 2, totalRevenue: 620000, location: 'Marine Drive' },
    { name: 'Trident Hall Hyderabad', city: 'Hyderabad', activeEvents: 2, totalRevenue: 540000, location: 'HITEC City' },
    { name: 'Lakeside Expo Chandigarh', city: 'Chandigarh', activeEvents: 1, totalRevenue: 280000, location: 'Sector 34' },
  ];

  return rows.map((v, i) => ({
    id: `sample-venue-${i + 1}`,
    name: v.name,
    location: v.location,
    city: v.city,
    memberCount: 2000 + i * 200,
    facilities: ['Parking', 'AC', 'WiFi'],
    amenities: ['Catering', 'Security'],
    activeEvents: v.activeEvents,
    totalRevenue: v.totalRevenue,
    status: 'active' as const,
    organizationId: null,
    created_at: now,
    updated_at: now,
  }));
}

/** Sample revenue streams for Financial tab (amounts in ₹) */
export function getSampleRevenueStreams(totalEventRevenue: number) {
  const stall = Math.round(totalEventRevenue * 0.48);
  const sponsorship = Math.round(totalEventRevenue * 0.22);
  const tickets = Math.round(totalEventRevenue * 0.18);
  const vendor = Math.round(totalEventRevenue * 0.08);
  const other = Math.max(0, totalEventRevenue - stall - sponsorship - tickets - vendor);
  return [
    { label: 'Stall & booth fees', amount: stall, color: 'bg-blue-500' },
    { label: 'Sponsorships', amount: sponsorship, color: 'bg-emerald-500' },
    { label: 'Tickets & registrations', amount: tickets, color: 'bg-violet-500' },
    { label: 'Vendor commissions', amount: vendor, color: 'bg-amber-500' },
    { label: 'Other (F&B, parking, misc.)', amount: other, color: 'bg-gray-500' },
  ];
}

export function getSampleExpenseLines() {
  return [
    { label: 'Venue rental & logistics', amount: 980000, color: 'bg-red-400' },
    { label: 'Marketing & promotions', amount: 420000, color: 'bg-orange-400' },
    { label: 'Staff & operations', amount: 310000, color: 'bg-rose-400' },
    { label: 'Technology & AV', amount: 185000, color: 'bg-pink-400' },
    { label: 'Insurance & compliance', amount: 95000, color: 'bg-fuchsia-400' },
  ];
}

export interface SampleSavedReport {
  name: string;
  type: string;
  description: string;
  lastGenerated: string;
  format: string;
  rows: number;
  schedule: string;
}

export function getSampleSavedReports(): SampleSavedReport[] {
  return [
    {
      name: 'Executive revenue dashboard',
      type: 'Revenue',
      description: 'MoM revenue, top events, plan mix — board-ready summary',
      lastGenerated: '2026-03-28',
      format: 'PDF',
      rows: 24,
      schedule: 'Monthly · 1st',
    },
    {
      name: 'Event performance scorecard',
      type: 'Performance',
      description: 'Attendance vs capacity, satisfaction, ROI by event',
      lastGenerated: '2026-03-27',
      format: 'Excel',
      rows: 156,
      schedule: 'Weekly · Monday',
    },
    {
      name: 'City & region deep dive',
      type: 'Attendance',
      description: 'Events, revenue, venue count and share by city',
      lastGenerated: '2026-03-25',
      format: 'Dashboard',
      rows: 42,
      schedule: 'On demand',
    },
    {
      name: 'Venue utilization report',
      type: 'Venue',
      description: 'Active events, revenue ranking, capacity trends',
      lastGenerated: '2026-03-24',
      format: 'PDF',
      rows: 18,
      schedule: 'Monthly · 15th',
    },
    {
      name: 'Vendor spend & commission',
      type: 'Vendor',
      description: 'Linked vendors, estimated commission, category split',
      lastGenerated: '2026-03-22',
      format: 'CSV',
      rows: 89,
      schedule: 'Quarterly',
    },
    {
      name: 'Custom KPI pack (FY)',
      type: 'Custom',
      description: 'Configurable metrics: NPS proxy, cost per attendee, repeat hosts',
      lastGenerated: '2026-03-20',
      format: 'Excel',
      rows: 320,
      schedule: 'Yearly · Apr 5',
    },
  ];
}
