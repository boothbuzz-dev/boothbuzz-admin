import React from 'react';
import { TrendingUp, TrendingDown, Users, Calendar, Building2, Truck, UserCheck, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../components/UI/Card';
import { useAuth } from '../contexts/AuthContext';
import { useUsers, useEvents, useVenues, useVendors, useExhibitors } from '../hooks/useSupabaseData';

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ComponentType<any>;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon: Icon, loading = false }) => {
  const isPositive = change >= 0;
  
  if (loading) {
    return (
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="animate-pulse">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{title}</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
            <div className="flex items-center mt-1 sm:mt-2">
              {isPositive ? (
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 mr-1" />
              )}
              <span className={`text-xs sm:text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(change)}%
              </span>
              <span className="text-xs sm:text-sm text-gray-500 ml-1 hidden sm:inline">vs last month</span>
            </div>
          </div>
          <div className="p-2 sm:p-3 bg-blue-50 rounded-full flex-shrink-0 ml-4">
            <Icon className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { users, loading: usersLoading } = useUsers();
  const { events, loading: eventsLoading } = useEvents();
  const { venues, loading: venuesLoading } = useVenues();
  const { vendors, loading: vendorsLoading } = useVendors();
  const { exhibitors, loading: exhibitorsLoading } = useExhibitors();

  const loading = usersLoading || eventsLoading || venuesLoading || vendorsLoading || exhibitorsLoading;

  const getWelcomeMessage = () => {
    const role = user?.role.replace('_', ' ');
    return `Welcome back, ${user?.name}!`;
  };

  // Calculate stats from real data
  const totalEvents = events.length;
  const activeEvents = events.filter(e => e.status === 'ongoing' || e.status === 'upcoming').length;
  const totalVenues = venues.length;
  const totalVendors = vendors.length;
  const totalExhibitors = exhibitors.length;
  const monthlyRevenue = events.reduce((sum, event) => sum + (event.totalRevenue || 0), 0);

  const getStatsForRole = () => {
    switch (user?.role) {
      case 'super_admin':
        return [
          { title: 'Total Events', value: totalEvents, change: 15.2, icon: Calendar },
          { title: 'Active Events', value: activeEvents, change: 8.1, icon: Calendar },
          { title: 'Venues', value: totalVenues, change: 12.5, icon: Building2 },
          { title: 'Vendors', value: totalVendors, change: 6.7, icon: Truck },
          { title: 'Exhibitors', value: totalExhibitors, change: 18.3, icon: UserCheck },
          { title: 'Monthly Revenue', value: `₹${(monthlyRevenue / 100000).toFixed(1)}L`, change: 12.5, icon: DollarSign },
        ];
      case 'admin':
        return [
          { title: 'City Events', value: events.filter(e => e.city === user.city).length, change: 12.5, icon: Calendar },
          { title: 'Active Events', value: activeEvents, change: 8.1, icon: Calendar },
          { title: 'City Venues', value: venues.filter(v => v.location?.includes(user.city || '')).length, change: 6.7, icon: Building2 },
          { title: 'City Revenue', value: `₹${(monthlyRevenue / 100000 * 0.3).toFixed(1)}L`, change: 15.2, icon: DollarSign },
        ];
      default:
        return [
          { title: 'My Events', value: events.filter(e => e.createdBy === user?.id).length, change: 10.0, icon: Calendar },
          { title: 'Active Tasks', value: 12, change: 5.5, icon: Users },
          { title: 'Completed', value: 28, change: 20.1, icon: UserCheck },
          { title: 'Revenue', value: '₹85K', change: 8.3, icon: DollarSign },
        ];
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{getWelcomeMessage()}</h1>
          <p className="text-sm sm:text-base text-gray-600 capitalize">
            {user?.role.replace('_', ' ')} Dashboard
            {user?.city && ` - ${user.city}`}
          </p>
        </div>
        <div className="text-xs sm:text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {getStatsForRole().map((stat, index) => (
          <StatCard key={index} {...stat} loading={loading} />
        ))}
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Events */}
        <Card>
          <CardHeader>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Events</h3>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3 sm:space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse p-3 bg-gray-50 rounded-lg">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {events.slice(0, 3).map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{event.title}</h4>
                      <p className="text-xs sm:text-sm text-gray-600">{event.date} • {event.venue}</p>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-900">{event.attendees} attendees</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        event.status === 'upcoming' ? 'bg-green-100 text-green-800' :
                        event.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {event.status}
                      </span>
                    </div>
                  </div>
                ))}
                {events.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No events found</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Performing Venues */}
        <Card>
          <CardHeader>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Top Performing Venues</h3>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3 sm:space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse p-3 bg-gray-50 rounded-lg">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {venues
                  .sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0))
                  .slice(0, 3)
                  .map((venue) => (
                    <div key={venue.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{venue.name}</h4>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">{venue.location}</p>
                      </div>
                      <div className="text-right ml-4 flex-shrink-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900">₹{((venue.totalRevenue || 0) / 1000).toFixed(0)}K</p>
                        <p className="text-xs text-gray-600">{venue.activeEvents} active events</p>
                      </div>
                    </div>
                  ))}
                {venues.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No venues found</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Quick Actions</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Link to="/events/create" className="block">
              <div className="p-3 sm:p-4 text-center bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 cursor-pointer group">
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-xs sm:text-sm font-medium text-blue-900">Create Event</span>
              </div>
            </Link>
            
            <Link to="/venues/add" className="block">
              <div className="p-3 sm:p-4 text-center bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 cursor-pointer group">
                <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-xs sm:text-sm font-medium text-green-900">Add Venue</span>
              </div>
            </Link>
            
            <Link to="/vendors" className="block">
              <div className="p-3 sm:p-4 text-center bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200 cursor-pointer group">
                <Truck className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-xs sm:text-sm font-medium text-purple-900">Manage Vendors</span>
              </div>
            </Link>
            
            <Link to="/reports" className="block">
              <div className="p-3 sm:p-4 text-center bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors duration-200 cursor-pointer group">
                <UserCheck className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 mx-auto mb-2 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-xs sm:text-sm font-medium text-orange-900">View Reports</span>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};