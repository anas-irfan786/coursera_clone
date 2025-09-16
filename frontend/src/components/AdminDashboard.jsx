import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Users, BookOpen, DollarSign, TrendingUp, CheckCircle, XCircle, Clock, AlertCircle, Shield, Activity, Award, CreditCard, FileText, Settings, LogOut, Home, BarChart2, UserCheck, BookCheck, Search, Filter, Calendar, Download, Eye, ChevronRight, MoreVertical, Bell, Menu, X } from 'lucide-react';

// Mock API service (replace with actual API calls)
const api = {
  get: async (endpoint) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (endpoint.includes('/admin/dashboard')) {
      return {
        data: {
          stats: {
            total_users: 15234,
            total_students: 14500,
            total_instructors: 234,
            total_courses: 486,
            published_courses: 342,
            pending_approval: 12,
            total_enrollments: 45678,
            coursera_plus_subscribers: 8934,
            monthly_revenue: 125000,
            platform_revenue_share: 37500
          },
          user_growth: [
            { month: 'Jan', students: 1200, instructors: 20 },
            { month: 'Feb', students: 1500, instructors: 25 },
            { month: 'Mar', students: 1800, instructors: 30 },
            { month: 'Apr', students: 2200, instructors: 35 },
            { month: 'May', students: 2800, instructors: 42 },
            { month: 'Jun', students: 3500, instructors: 50 }
          ],
          course_distribution: [
            { category: 'Programming', count: 120 },
            { category: 'Data Science', count: 85 },
            { category: 'Business', count: 65 },
            { category: 'Design', count: 45 },
            { category: 'Marketing', count: 35 }
          ],
          recent_activities: [
            { type: 'course_submitted', user: 'John Instructor', course: 'Advanced React', time: '2 hours ago' },
            { type: 'user_registered', user: 'Sarah Student', time: '3 hours ago' },
            { type: 'subscription', user: 'Mike Johnson', plan: 'Coursera Plus', time: '4 hours ago' },
            { type: 'course_approved', admin: 'Admin', course: 'Python Basics', time: '5 hours ago' }
          ]
        }
      };
    }
    
    if (endpoint.includes('/admin/courses/pending')) {
      return {
        data: [
          {
            id: 1,
            title: 'Advanced Machine Learning',
            instructor: 'Dr. Sarah Johnson',
            instructor_id: 'inst_001',
            category: 'Data Science',
            course_type: 'coursera_plus',
            submitted_date: '2024-01-14',
            sections: 12,
            lectures: 145,
            duration: '42 hours',
            description: 'Comprehensive course on advanced ML techniques...',
            preview_available: true
          },
          {
            id: 2,
            title: 'Web Development Bootcamp',
            instructor: 'John Williams',
            instructor_id: 'inst_002',
            category: 'Programming',
            course_type: 'free',
            submitted_date: '2024-01-13',
            sections: 8,
            lectures: 98,
            duration: '28 hours',
            description: 'Complete web development from zero to hero...',
            preview_available: true
          },
          {
            id: 3,
            title: 'Digital Marketing Strategy',
            instructor: 'Emma Davis',
            instructor_id: 'inst_003',
            category: 'Marketing',
            course_type: 'coursera_plus',
            submitted_date: '2024-01-12',
            sections: 6,
            lectures: 52,
            duration: '18 hours',
            description: 'Learn modern digital marketing strategies...',
            preview_available: false
          }
        ]
      };
    }
    
    if (endpoint.includes('/admin/users')) {
      return {
        data: [
          {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            user_type: 'student',
            registration_date: '2024-01-01',
            last_active: '2024-01-15',
            courses_enrolled: 5,
            subscription: 'coursera_plus',
            status: 'active'
          },
          {
            id: 2,
            name: 'Dr. Sarah Johnson',
            email: 'sarah@example.com',
            user_type: 'instructor',
            registration_date: '2023-06-15',
            last_active: '2024-01-15',
            courses_created: 8,
            students_taught: 1234,
            status: 'active'
          }
        ]
      };
    }
    
    if (endpoint.includes('/admin/revenue')) {
      return {
        data: {
          monthly_breakdown: [
            { month: 'Jan', subscription: 45000, platform_fee: 13500, total: 58500 },
            { month: 'Feb', subscription: 52000, platform_fee: 15600, total: 67600 },
            { month: 'Mar', subscription: 58000, platform_fee: 17400, total: 75400 },
            { month: 'Apr', subscription: 61000, platform_fee: 18300, total: 79300 },
            { month: 'May', subscription: 65000, platform_fee: 19500, total: 84500 },
            { month: 'Jun', subscription: 68000, platform_fee: 20400, total: 88400 }
          ],
          top_earning_courses: [
            { title: 'Python Complete', instructor: 'John Doe', students: 2341, revenue: 15600 },
            { title: 'React Mastery', instructor: 'Jane Smith', students: 1892, revenue: 12300 },
            { title: 'Data Science', instructor: 'Mike Johnson', students: 1567, revenue: 10200 }
          ]
        }
      };
    }
    
    return { data: {} };
  },
  
  post: async (endpoint, data) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: { success: true } };
  }
};

const AdminDashboard = () => {
  const [activeView, setActiveView] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user] = useState({
    name: 'Admin User',
    email: 'admin@coursera.com',
    avatar: 'https://ui-avatars.com/api/?name=Admin&background=6366F1&color=fff',
    role: 'Super Admin'
  });

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'approvals', label: 'Course Approvals', icon: BookCheck, badge: 12 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'courses', label: 'All Courses', icon: BookOpen },
    { id: 'revenue', label: 'Revenue Analytics', icon: DollarSign },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Platform Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch(activeView) {
      case 'overview':
        return <OverviewDashboard />;
      case 'approvals':
        return <CourseApprovals />;
      case 'users':
        return <UserManagement />;
      case 'courses':
        return <CourseManagement />;
      case 'revenue':
        return <RevenueAnalytics />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <PlatformSettings />;
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="flex items-center">
            <Shield className="text-white mr-2" size={24} />
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:bg-white/10 p-1 rounded"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeView === item.id
                    ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center space-x-3 mb-4">
            <img src={user.avatar} alt="Admin" className="w-10 h-10 rounded-full" />
            <div>
              <p className="text-sm font-semibold text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
          </div>
          <button className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut size={18} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-900"
            >
              <Menu size={24} />
            </button>
            
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900 capitalize">{activeView.replace('-', ' ')}</h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <button className="flex items-center space-x-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                <Download size={18} />
                <span className="hidden sm:inline">Export Report</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

// Overview Dashboard Component
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

  const stats = dashboardData?.stats;
  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.total_users.toLocaleString()}
          subtitle={`${stats?.total_students} students, ${stats?.total_instructors} instructors`}
          icon={Users}
          color="blue"
          trend="+12.5%"
        />
        <StatCard
          title="Total Courses"
          value={stats?.total_courses}
          subtitle={`${stats?.published_courses} published`}
          icon={BookOpen}
          color="green"
          trend="+8.2%"
        />
        <StatCard
          title="Pending Approvals"
          value={stats?.pending_approval}
          subtitle="Requires review"
          icon={Clock}
          color="yellow"
          urgent={true}
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${(stats?.monthly_revenue / 1000).toFixed(1)}k`}
          subtitle={`$${(stats?.platform_revenue_share / 1000).toFixed(1)}k platform share`}
          icon={DollarSign}
          color="purple"
          trend="+15.3%"
        />
      </div>

      {/* Subscription Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Active Enrollments</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.total_enrollments.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
              <p className="text-sm text-gray-600">Plus Subscribers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.coursera_plus_subscribers.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
              <p className="text-sm text-gray-600">Avg. Rating</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">4.7/5.0</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
              <p className="text-sm text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">68%</p>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-3">
            {dashboardData?.recent_activities?.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${
                  activity.type === 'course_submitted' ? 'bg-blue-100 text-blue-600' :
                  activity.type === 'user_registered' ? 'bg-green-100 text-green-600' :
                  activity.type === 'subscription' ? 'bg-purple-100 text-purple-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {activity.type === 'course_submitted' ? <BookOpen size={16} /> :
                   activity.type === 'user_registered' ? <Users size={16} /> :
                   activity.type === 'subscription' ? <CreditCard size={16} /> :
                   <Activity size={16} />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    {activity.type === 'course_submitted' ? `${activity.user} submitted "${activity.course}"` :
                     activity.type === 'user_registered' ? `${activity.user} registered` :
                     activity.type === 'subscription' ? `${activity.user} subscribed to ${activity.plan}` :
                     `${activity.admin} approved "${activity.course}"`}
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dashboardData?.user_growth}>
              <defs>
                <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorInstructors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="students" stackId="1" stroke="#4F46E5" fillOpacity={1} fill="url(#colorStudents)" />
              <Area type="monotone" dataKey="instructors" stackId="1" stroke="#10B981" fillOpacity={1} fill="url(#colorInstructors)" />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Course Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dashboardData?.course_distribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.category}: ${entry.count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {dashboardData?.course_distribution?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, subtitle, icon: Icon, color, trend, urgent }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 ${colorClasses[color]} bg-opacity-10 rounded-lg`}>
          <Icon className={`text-${color}-600`} size={24} />
        </div>
        {urgent && (
          <span className="flex items-center text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
            <AlertCircle size={12} className="mr-1" />
            Action Required
          </span>
        )}
        {trend && (
          <span className="flex items-center text-xs font-medium text-green-600">
            <TrendingUp size={12} className="mr-1" />
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
};

// Course Approvals Component
const CourseApprovals = () => {
  const [pendingCourses, setPendingCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPendingCourses();
  }, []);

  const fetchPendingCourses = async () => {
    try {
      const response = await api.get('/admin/courses/pending');
      setPendingCourses(response.data);
    } catch (error) {
      console.error('Error fetching pending courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (courseId) => {
    try {
      await api.post(`/admin/courses/${courseId}/approve`);
      setPendingCourses(pendingCourses.filter(c => c.id !== courseId));
      setSelectedCourse(null);
    } catch (error) {
      console.error('Error approving course:', error);
    }
  };

  const handleReject = async (courseId, reason) => {
    try {
      await api.post(`/admin/courses/${courseId}/reject`, { reason });
      setPendingCourses(pendingCourses.filter(c => c.id !== courseId));
      setSelectedCourse(null);
    } catch (error) {
      console.error('Error rejecting course:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const filteredCourses = filter === 'all' ? pendingCourses : 
    pendingCourses.filter(c => c.course_type === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Course Approvals</h2>
          <p className="text-gray-600 mt-1">{pendingCourses.length} courses pending review</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Types</option>
            <option value="free">Free Courses</option>
            <option value="coursera_plus">Coursera Plus</option>
          </select>
          
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center">
            <Filter size={18} className="mr-2" />
            Filters
          </button>
        </div>
      </div>

      {/* Pending Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCourses.map((course) => (
          <div key={course.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">by {course.instructor}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  course.course_type === 'free' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {course.course_type === 'free' ? 'FREE' : 'PLUS'}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{course.sections}</p>
                  <p className="text-xs text-gray-500">Sections</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{course.lectures}</p>
                  <p className="text-xs text-gray-500">Lectures</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{course.duration}</p>
                  <p className="text-xs text-gray-500">Duration</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar size={16} />
                  <span>Submitted {course.submitted_date}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedCourse(course)}
                    className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors flex items-center"
                  >
                    <Eye size={16} className="mr-1" />
                    Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Review Modal */}
      {selectedCourse && (
        <CourseReviewModal
          course={selectedCourse}
          onApprove={() => handleApprove(selectedCourse.id)}
          onReject={(reason) => handleReject(selectedCourse.id, reason)}
          onClose={() => setSelectedCourse(null)}
        />
      )}
    </div>
  );
};

// Course Review Modal
const CourseReviewModal = ({ course, onApprove, onReject, onClose }) => {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Review Course: {course.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Course Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Instructor</h3>
              <p className="text-gray-900">{course.instructor}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Category</h3>
              <p className="text-gray-900">{course.category}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Course Type</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                course.course_type === 'free' 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-purple-100 text-purple-800'
              }`}>
                {course.course_type === 'free' ? 'FREE' : 'COURSERA PLUS'}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Duration</h3>
              <p className="text-gray-900">{course.duration}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
            <p className="text-gray-900">{course.description}</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{course.sections}</p>
              <p className="text-sm text-gray-500">Sections</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{course.lectures}</p>
              <p className="text-sm text-gray-500">Lectures</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{course.duration}</p>
              <p className="text-sm text-gray-500">Total Duration</p>
            </div>
          </div>

          {/* Preview Options */}
          <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Eye className="text-indigo-600" size={20} />
              <span className="text-sm text-gray-700">Preview Available: {course.preview_available ? 'Yes' : 'No'}</span>
            </div>
            {course.preview_available && (
              <button className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
                View Course Preview
              </button>
            )}
          </div>

          {/* Rejection Form */}
          {showRejectForm && (
            <div className="p-4 bg-red-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Please provide a reason for rejection..."
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t">
            {!showRejectForm ? (
              <>
                <button
                  onClick={onApprove}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <CheckCircle size={18} className="mr-2" />
                  Approve Course
                </button>
                <button
                  onClick={() => setShowRejectForm(true)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <XCircle size={18} className="mr-2" />
                  Reject Course
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    if (rejectReason.trim()) {
                      onReject(rejectReason);
                    }
                  }}
                  disabled={!rejectReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Rejection
                </button>
                <button
                  onClick={() => {
                    setShowRejectForm(false);
                    setRejectReason('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// User Management Component
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
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

  const filteredUsers = users.filter(user => {
    const matchesType = filter === 'all' || user.user_type === filter;
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Users</option>
            <option value="student">Students</option>
            <option value="instructor">Instructors</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-indigo-600">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.user_type === 'student' 
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {user.user_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.user_type === 'student' ? (
                      <div>
                        <p>{user.courses_enrolled} courses enrolled</p>
                        {user.subscription && (
                          <span className="text-xs text-indigo-600">{user.subscription}</span>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p>{user.courses_created} courses created</p>
                        <p className="text-xs">{user.students_taught} students</p>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">View</button>
                    <button className="text-gray-600 hover:text-gray-900">
                      <MoreVertical size={16} />
                    </button>
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

// Course Management Component
const CourseManagement = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">All Courses</h2>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <p className="text-gray-600">Course management interface coming soon...</p>
      </div>
    </div>
  );
};

// Revenue Analytics Component
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Revenue Analytics</h2>
        <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option>Last 6 Months</option>
          <option>Last Year</option>
          <option>All Time</option>
        </select>
      </div>

      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-green-100">Total Revenue</p>
            <DollarSign size={24} className="text-green-200" />
          </div>
          <p className="text-3xl font-bold">$453,600</p>
          <p className="text-sm text-green-100 mt-2">+15.3% from last month</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-purple-100">Subscription Revenue</p>
            <CreditCard size={24} className="text-purple-200" />
          </div>
          <p className="text-3xl font-bold">$349,000</p>
          <p className="text-sm text-purple-100 mt-2">8,934 active subscriptions</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-indigo-100">Platform Share</p>
            <TrendingUp size={24} className="text-indigo-200" />
          </div>
          <p className="text-3xl font-bold">$104,600</p>
          <p className="text-sm text-indigo-100 mt-2">30% revenue share</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue Breakdown</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={revenueData?.monthly_breakdown}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="subscription" fill="#4F46E5" name="Subscriptions" />
            <Bar dataKey="platform_fee" fill="#10B981" name="Platform Fee" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Earning Courses */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Earning Courses</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 text-sm font-medium text-gray-700">Course</th>
                <th className="text-left py-3 text-sm font-medium text-gray-700">Instructor</th>
                <th className="text-left py-3 text-sm font-medium text-gray-700">Students</th>
                <th className="text-left py-3 text-sm font-medium text-gray-700">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {revenueData?.top_earning_courses?.map((course, index) => (
                <tr key={index}>
                  <td className="py-3 text-sm text-gray-900">{course.title}</td>
                  <td className="py-3 text-sm text-gray-600">{course.instructor}</td>
                  <td className="py-3 text-sm text-gray-600">{course.students.toLocaleString()}</td>
                  <td className="py-3 text-sm font-semibold text-green-600">${course.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Reports Component
const Reports = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Reports</h3>
          <div className="space-y-4">
            <button className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left flex items-center justify-between">
              <span>User Activity Report</span>
              <Download size={18} />
            </button>
            <button className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left flex items-center justify-between">
              <span>Course Performance Report</span>
              <Download size={18} />
            </button>
            <button className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left flex items-center justify-between">
              <span>Revenue Report</span>
              <Download size={18} />
            </button>
            <button className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left flex items-center justify-between">
              <span>Instructor Performance Report</span>
              <Download size={18} />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Scheduled Reports</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Weekly User Report</p>
                <p className="text-sm text-gray-500">Every Monday at 9:00 AM</p>
              </div>
              <button className="text-indigo-600 hover:text-indigo-700">
                <Settings size={18} />
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Monthly Revenue Report</p>
                <p className="text-sm text-gray-500">1st of every month</p>
              </div>
              <button className="text-indigo-600 hover:text-indigo-700">
                <Settings size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Platform Settings Component
const PlatformSettings = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Platform Settings</h2>
      
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Platform Name</label>
            <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg" defaultValue="Coursera Clone" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
            <input type="email" className="w-full px-4 py-2 border border-gray-200 rounded-lg" defaultValue="support@coursera.com" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Platform Revenue Share (%)</label>
            <input type="number" className="w-full px-4 py-2 border border-gray-200 rounded-lg" defaultValue="30" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Coursera Plus Monthly Price</label>
            <input type="number" className="w-full px-4 py-2 border border-gray-200 rounded-lg" defaultValue="39" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Coursera Plus Yearly Price</label>
            <input type="number" className="w-full px-4 py-2 border border-gray-200 rounded-lg" defaultValue="399" />
          </div>
        </div>
        <button className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;