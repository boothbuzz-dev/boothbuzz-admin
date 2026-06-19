import { useState, useEffect, useMemo } from 'react';
import { apiClient } from '../lib/apiClient';
import { useAuth } from '../contexts/AuthContext';
import { Event, Venue } from '../types';

export type DateRangeKey =
  | 'last_7_days'
  | 'last_30_days'
  | 'last_3_months'
  | 'last_6_months'
  | 'last_year';

/** Returns { start, end } as YYYY-MM-DD for the given range (end = today). */
export function getDateRangeBounds(dateRange: string): { start: string; end: string } {
  const end = new Date();
  const start = new Date(end);
  switch (dateRange) {
    case 'last_7_days':
      start.setDate(start.getDate() - 7);
      break;
    case 'last_30_days':
      start.setDate(start.getDate() - 30);
      break;
    case 'last_3_months':
      start.setMonth(start.getMonth() - 3);
      break;
    case 'last_6_months':
      start.setMonth(start.getMonth() - 6);
      break;
    case 'last_year':
      start.setFullYear(start.getFullYear() - 1);
      break;
    default:
      start.setMonth(start.getMonth() - 6);
  }
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

function mapEventRow(event: any): Event {
  return {
    id: event.id,
    organizationId: event.organization_id ?? null,
    title: event.title,
    description: event.description,
    date: event.event_date,
    eventEndDate: event.event_end_date,
    time: event.event_time,
    eventEndTime: event.event_end_time,
    venue: event.venue_name || event.venue?.name || '',
    city: event.city,
    status: event.status,
    attendees: event.attendees || 0,
    maxCapacity: event.max_capacity || 0,
    planType: event.plan_type,
    vendors: event.vendor_ids || [],
    venueId: event.venue_id,
    createdBy: event.created_by,
    totalRevenue: event.total_revenue || 0,
    satisfactionScore: event.satisfaction_score ?? event.satisfactionScore ?? null,
    roiPercent: event.roi_percent ?? event.roiPercent ?? null,
    eventImageUrl: event.event_image_url,
    layoutImageUrl: event.layout_image_url,
    pricePerHour: event.price_per_hour,
    availableHours: event.available_hours,
    parkingSpaces: event.parking_spaces,
    cateringAllowed: event.catering_allowed,
    alcoholAllowed: event.alcohol_allowed,
    smokingAllowed: event.smoking_allowed,
    exhibitors: event.exhibitor_ids || [],
    noOfStalls: event.no_of_stalls,
    inSiteStalls: event.in_site_stalls || [],
    outSiteStalls: event.out_site_stalls || [],
    allStalls: event.in_site_stalls || [],
    created_at: event.created_at,
    updated_at: event.updated_at,
  } as Event;
}

function mapVenueRow(venue: any): Venue {
  return {
    id: venue.id,
    organizationId: venue.organization_id ?? null,
    name: venue.name,
    location: venue.location,
    contactPerson: venue.contact_person,
    email: venue.email,
    phone: venue.phone,
    memberCount: venue.capacity || 0,
    facilities: venue.facilities || [],
    amenities: venue.amenities || [],
    activeEvents: venue.active_events || 0,
    totalRevenue: venue.total_revenue || 0,
    status: venue.status,
    joinedDate: venue.joined_date,
    addressLine1: venue.address_line1,
    addressLine2: venue.address_line2,
    city: venue.city,
    state: venue.state,
    pincode: venue.pincode,
    country: venue.country,
    addressLandmark: venue.address_landmark,
    addressStandard: venue.address_standard,
    areaSqFt: venue.area_sq_ft,
    kindOfSpace: venue.kind_of_space,
    isCovered: venue.is_covered,
    pricingPerDay: venue.pricing_per_day,
    facilityAreaSqFt: venue.facility_area_sq_ft,
    noOfStalls: venue.no_of_stalls,
    facilityCovered: venue.facility_covered,
    noOfFlats: venue.no_of_flats,
    availableHours: venue.available_hours,
    parkingSpaces: venue.parking_spaces,
    cateringAllowed: venue.catering_allowed,
    alcoholAllowed: venue.alcohol_allowed,
    smokingAllowed: venue.smoking_allowed,
    latitude: venue.latitude,
    longitude: venue.longitude,
    formattedAddress: venue.formatted_address,
    description: venue.description,
    photos: venue.photos || [],
    documents: venue.documents || [],
    customContacts: venue.custom_contacts || [],
    bankName: venue.bank_name,
    bankAccountNumber: venue.bank_account_number,
    bankHolderName: venue.bank_holder_name,
    bankIfsc: venue.bank_ifsc,
    bankMicr: venue.bank_micr,
    created_at: venue.created_at,
    updated_at: venue.updated_at,
  } as Venue;
}

/** Fetch events with a wide window (2 years) so client can filter by dateRange. */
const EVENTS_FETCH_DAYS = 730;

export function useReportData(selectedReportOrgId: string, dateRange: string) {
  const { user, isSuperAdmin } = useAuth();
  const [eventsRaw, setEventsRaw] = useState<any[]>([]);
  const [venuesRaw, setVenuesRaw] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const adminOrgId = !isSuperAdmin ? user?.organizationId ?? null : null;
      if (!isSuperAdmin && !adminOrgId) {
        setEventsRaw([]);
        setVenuesRaw([]);
        setLoading(false);
        return;
      }

      const end = new Date();
      const start = new Date(end);
      start.setDate(start.getDate() - EVENTS_FETCH_DAYS);
      const startStr = start.toISOString().split('T')[0];
      const endStr = end.toISOString().split('T')[0];

      const orgIdForEvents =
        isSuperAdmin && selectedReportOrgId !== 'all' ? selectedReportOrgId : adminOrgId;
      const orgIdForVenues =
        isSuperAdmin && selectedReportOrgId !== 'all' ? selectedReportOrgId : adminOrgId;

      let eventsQuery = apiClient
        .from('events')
        .select('*, venue:venues(name)')
        .gte('event_date', startStr)
        .lte('event_date', endStr)
        .order('event_date', { ascending: false });

      if (orgIdForEvents) {
        eventsQuery = eventsQuery.eq('organization_id', orgIdForEvents);
      }

      let venuesQuery = apiClient
        .from('venues')
        .select('*')
        .order('name', { ascending: true });

      if (orgIdForVenues) {
        venuesQuery = venuesQuery.eq('organization_id', orgIdForVenues);
      }

      const [eventsRes, venuesRes] = await Promise.all([
        eventsQuery,
        venuesQuery,
      ]);

      if (eventsRes.error) {
        setError(eventsRes.error.message);
        setEventsRaw([]);
      } else {
        setEventsRaw(eventsRes.data || []);
      }
      if (venuesRes.error) {
        if (!eventsRes.error) setError(venuesRes.error.message);
        setVenuesRaw([]);
      } else {
        setVenuesRaw(venuesRes.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setEventsRaw([]);
      setVenuesRaw([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedReportOrgId, dateRange, user?.organizationId, isSuperAdmin]);

  const { start, end } = getDateRangeBounds(dateRange);
  const allEvents = useMemo(
    () => eventsRaw.map(mapEventRow),
    [eventsRaw]
  );
  const events = useMemo(
    () =>
      allEvents.filter((e) => {
        const d = e.date;
        if (!d) return false;
        return d >= start && d <= end;
      }),
    [allEvents, start, end]
  );
  const venues = useMemo(() => venuesRaw.map(mapVenueRow), [venuesRaw]);

  return { events, venues, loading, error, refetch: fetchData };
}
