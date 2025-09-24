import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Users, BookOpen, DollarSign, TrendingUp, CheckCircle, XCircle, Clock, AlertCircle, Shield, Activity, Award, CreditCard } from 'lucide-react';
import apiService from '../../services/api';

// Mock API service (replace with actual API calls)
const api = {
  get: async (endpoint) => {
    // Use real API for pending courses
    if (endpoint.includes('/courses/admin/pending')) {
      try {
        const response = await apiService.get('/courses/admin/pending/');
        return { data: response.data };
      } catch (error) {
        console.error('Error fetching pending courses:', error);
        return { data: [] };
      }
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    if (endpoint.includes('/admin/dashboard')) {
      // Get pending count from real API
      let pending_approval = 0;
      try {
        const pendingResponse = await apiService.get('/courses/admin/pending/');
        pending_approval = pendingResponse.data.length;
      } catch (error) {
        console.error('Error fetching pending count:', error);
      }

      return {
        data: {
          stats: {
            total_users: 15234,
            total_students: 14500,
            total_instructors: 234,
            total_courses: 486,
            published_courses: 342,
            pending_approval: pending_approval,
            total_enrollments: 45678,
            coursera_plus_subscribers: 8934,
            monthly_revenue: 125000,
            platform_revenue_share: 37500
          },
          user_growth: [
            { month: 'Jan', students: 1200, instructors: 20 },
            { month: 'Feb', students: 1500, instructors: 25 },
            { month: 'Mar', students: 1800, instructors: 30 },
            { month: 'Apr', students: 2100, instructors: 35 },
            { month: 'May', students: 2400, instructors: 42 },
            { month: 'Jun', students: 2800, instructors: 48 }
          ],
          course_stats: [
            { status: 'Published', count: 342, color: '#10B981' },
            { status: 'Draft', count: 89, color: '#6B7280' },
            { status: 'Pending', count: 12, color: '#F59E0B' },
            { status: 'Rejected', count: 43, color: '#EF4444' }
          ],
          revenue_data: [
            { month: 'Jan', revenue: 85000, subscriptions: 7200 },
            { month: 'Feb', revenue: 92000, subscriptions: 7800 },
            { month: 'Mar', revenue: 105000, subscriptions: 8200 },
            { month: 'Apr', revenue: 118000, subscriptions: 8600 },
            { month: 'May', revenue: 125000, subscriptions: 8934 },
            { month: 'Jun', revenue: 142000, subscriptions: 9500 }
          ]
        }
      };
    }

    return { data: {} };
  }
};

const OverviewDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const { stats, user_growth, course_stats, revenue_data } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total_users.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="text-green-500 mr-1" size={16} />
                <span className="text-sm text-green-600 font-medium">+12.5%</span>
                <span className="text-sm text-gray-500 ml-1">from last month</span>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total_courses}</p>
              <div className="flex items-center mt-2">
                <CheckCircle className="text-green-500 mr-1" size={16} />
                <span className="text-sm text-gray-600">{stats.published_courses} published</span>
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <BookOpen className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-3xl font-bold text-gray-900">${(stats.monthly_revenue / 1000).toFixed(0)}K</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="text-green-500 mr-1" size={16} />
                <span className="text-sm text-green-600 font-medium">+8.2%</span>
                <span className="text-sm text-gray-500 ml-1">from last month</span>
              </div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <DollarSign className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-3xl font-bold text-gray-900">{stats.pending_approval}</p>
              <div className="flex items-center mt-2">
                <Clock className="text-amber-500 mr-1" size={16} />
                <span className="text-sm text-amber-600 font-medium">Requires attention</span>
              </div>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <AlertCircle className="text-amber-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">User Growth</h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-gray-600">Students</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-gray-600">Instructors</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={user_growth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Line type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6 }} />
              <Line type="monotone" dataKey="instructors" stroke="#10b981" strokeWidth={3} dot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Course Status Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Course Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={course_stats}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="count"
              >
                {course_stats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Revenue & Subscriptions</h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Revenue</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Subscriptions</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={revenue_data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis yAxisId="left" stroke="#6b7280" />
            <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
            <Tooltip />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stackId="1"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.1}
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="subscriptions"
              stackId="2"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.1}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
          <div className="flex items-center mb-4">
            <Shield className="text-blue-600 mr-3" size={24} />
            <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
          </div>
          <p className="text-gray-600 mb-4">All systems operational</p>
          <div className="flex items-center text-sm text-green-600">
            <CheckCircle size={16} className="mr-1" />
            <span>99.9% uptime</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
          <div className="flex items-center mb-4">
            <Activity className="text-green-600 mr-3" size={24} />
            <h3 className="text-lg font-semibold text-gray-900">Active Users</h3>
          </div>
          <p className="text-gray-600 mb-4">{(stats.total_users * 0.23).toFixed(0)} users online</p>
          <div className="flex items-center text-sm text-green-600">
            <TrendingUp size={16} className="mr-1" />
            <span>+15% from yesterday</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
          <div className="flex items-center mb-4">
            <Award className="text-purple-600 mr-3" size={24} />
            <h3 className="text-lg font-semibold text-gray-900">Top Instructors</h3>
          </div>
          <p className="text-gray-600 mb-4">42 instructors this month</p>
          <div className="flex items-center text-sm text-purple-600">
            <Award size={16} className="mr-1" />
            <span>View leaderboard</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewDashboard;