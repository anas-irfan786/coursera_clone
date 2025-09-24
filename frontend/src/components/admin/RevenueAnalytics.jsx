import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { DollarSign, TrendingUp, CreditCard, Users } from 'lucide-react';

// Mock API service
const api = {
  get: async (endpoint) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    if (endpoint.includes('/admin/revenue')) {
      return {
        data: {
          stats: {
            total_revenue: 245000,
            monthly_growth: 12.5,
            total_subscriptions: 8934,
            avg_revenue_per_user: 27.44
          },
          revenue_chart: [
            { month: 'Jan', revenue: 85000, subscriptions: 7200, courses_sold: 1200 },
            { month: 'Feb', revenue: 92000, subscriptions: 7800, courses_sold: 1350 },
            { month: 'Mar', revenue: 105000, subscriptions: 8200, courses_sold: 1500 },
            { month: 'Apr', revenue: 118000, subscriptions: 8600, courses_sold: 1680 },
            { month: 'May', revenue: 125000, subscriptions: 8934, courses_sold: 1820 },
            { month: 'Jun', revenue: 142000, subscriptions: 9500, courses_sold: 2100 }
          ],
          top_courses: [
            { name: 'Machine Learning Basics', revenue: 45000, enrollments: 1500 },
            { name: 'Web Development', revenue: 38000, enrollments: 1200 },
            { name: 'Data Science', revenue: 32000, enrollments: 980 },
            { name: 'Mobile Development', revenue: 28000, enrollments: 850 },
            { name: 'Cloud Computing', revenue: 22000, enrollments: 720 }
          ]
        }
      };
    }

    return { data: {} };
  }
};

const RevenueAnalytics = () => {
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    try {
      const response = await api.get('/admin/revenue');
      setRevenueData(response.data);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
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

  const { stats, revenue_chart, top_courses } = revenueData;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Revenue Analytics</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">${(stats.total_revenue / 1000).toFixed(0)}K</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="text-green-500 mr-1" size={16} />
                <span className="text-sm text-green-600 font-medium">+{stats.monthly_growth}%</span>
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Subscriptions</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total_subscriptions.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="text-blue-500 mr-1" size={16} />
                <span className="text-sm text-blue-600 font-medium">+8.2%</span>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Revenue/User</p>
              <p className="text-3xl font-bold text-gray-900">${stats.avg_revenue_per_user}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="text-purple-500 mr-1" size={16} />
                <span className="text-sm text-purple-600 font-medium">+3.1%</span>
              </div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <CreditCard className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Growth Rate</p>
              <p className="text-3xl font-bold text-gray-900">{stats.monthly_growth}%</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="text-emerald-500 mr-1" size={16} />
                <span className="text-sm text-emerald-600 font-medium">Month over month</span>
              </div>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <TrendingUp className="text-emerald-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue Over Time</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={revenue_chart}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.1}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscriptions Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Subscription Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenue_chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="subscriptions"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Courses */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Revenue Courses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={top_courses} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#6b7280" />
              <YAxis dataKey="name" type="category" stroke="#6b7280" width={120} />
              <Tooltip />
              <Bar dataKey="revenue" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Course Revenue Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Course Revenue Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enrollments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg. Price
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {top_courses.map((course, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{course.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${course.revenue.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{course.enrollments.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${(course.revenue / course.enrollments).toFixed(2)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RevenueAnalytics;