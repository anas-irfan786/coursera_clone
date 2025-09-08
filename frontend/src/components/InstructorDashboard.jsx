import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Camera, Upload, FileText, Video, Users, DollarSign, TrendingUp, Award, BookOpen, Clock, Star, Menu, X, ChevronRight, Plus, Edit2, Trash2, Eye, EyeOff, MoreVertical, Calendar, Download, Filter, Search, Bell, Settings, LogOut, Home, BarChart2, CreditCard, MessageSquare, PlayCircle, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react';
import api from '../services/api';
import authService from '../services/authService';


const InstructorDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const profileDropdownRef = useRef(null);
  const [user, setUser] = useState({
    name: 'John Instructor',
    email: 'instructor@example.com',
    avatar: 'https://ui-avatars.com/api/?name=John+Instructor&background=4F46E5&color=fff'
  });

  // Get actual user data
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser({
        name: `${currentUser.first_name} ${currentUser.last_name}`,
        email: currentUser.email,
        avatar: `https://ui-avatars.com/api/?name=${currentUser.first_name}+${currentUser.last_name}&background=4F46E5&color=fff`
      });
    }
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Logout functionality
  const handleLogout = async () => {
    // Show confirmation dialog
    if (window.confirm('Are you sure you want to logout?')) {
      setIsLoggingOut(true);
      try {
        await authService.logout();
        // Redirect to login page
        window.location.href = '/login';
      } catch (error) {
        console.error('Error during logout:', error);
        // Even if logout API fails, clear local storage and redirect
        localStorage.clear();
        window.location.href = '/login';
      }
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'courses', label: 'My Courses', icon: BookOpen },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'earnings', label: 'Earnings', icon: CreditCard },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'courses':
        return <CoursesManagement />;
      case 'students':
        return <StudentsView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'earnings':
        return <EarningsView />;
      case 'messages':
        return <MessagesView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-indigo-600 to-purple-600">
          <h1 className="text-xl font-bold text-white">Instructor Hub</h1>
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
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
                {item.id === 'messages' && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">3</span>
                )}
              </button>
            );
          })}
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isLoggingOut 
                ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                : 'text-red-600 hover:bg-red-50'
            }`}
          >
            {isLoggingOut ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
            ) : (
              <LogOut size={20} />
            )}
            <span className="font-medium">
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </span>
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
            
            <div className="flex-1 max-w-xl mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search courses, students..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
                >
                  <img src={user.avatar} alt="Profile" className="w-10 h-10 rounded-full" />
                  <div className="hidden md:block">
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Profile Dropdown */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <button
                      onClick={() => {
                        setActiveTab('profile');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Settings size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-700">Profile Settings</span>
                    </button>
                    <hr className="my-2" />
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      disabled={isLoggingOut}
                      className={`w-full text-left px-4 py-2 flex items-center space-x-2 ${
                        isLoggingOut 
                          ? 'bg-gray-100 cursor-not-allowed' 
                          : 'hover:bg-red-50'
                      }`}
                    >
                      {isLoggingOut ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                      ) : (
                        <LogOut size={16} className="text-red-500" />
                      )}
                      <span className={`text-sm ${isLoggingOut ? 'text-gray-400' : 'text-red-600'}`}>
                        {isLoggingOut ? 'Logging out...' : 'Logout'}
                      </span>
                    </button>
                  </div>
                )}
              </div>
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

// Dashboard Overview Component
const DashboardOverview = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/courses/instructor/dashboard/');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set fallback data to prevent infinite reload
      setDashboardData({
        stats: {
          total_courses: 0,
          total_students: 0,
          total_revenue: 0,
          average_rating: 0,
          published_courses: 0,
          draft_courses: 0,
        },
        recent_enrollments: [],
        revenue_chart: [],
        top_courses: []
      });
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

  const stats = [
    { title: 'Total Courses', value: dashboardData?.stats?.total_courses || 0, icon: BookOpen, color: 'from-blue-500 to-blue-600', change: '+12%' },
    { title: 'Total Students', value: dashboardData?.stats?.total_students || 0, icon: Users, color: 'from-green-500 to-green-600', change: '+23%' },
    { title: 'Revenue', value: `$${(dashboardData?.stats?.total_revenue || 0).toLocaleString()}`, icon: DollarSign, color: 'from-purple-500 to-purple-600', change: '+18%' },
    { title: 'Avg Rating', value: ((dashboardData?.stats?.average_rating || 0)).toFixed(1), icon: Star, color: 'from-yellow-500 to-yellow-600', change: '+0.2' },
  ];

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EC4899'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <Calendar className="inline-block w-4 h-4 mr-2" />
            Last 30 Days
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
            <Download className="inline-block w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-xs text-green-600 mt-2 flex items-center">
                    <TrendingUp size={12} className="mr-1" />
                    {stat.change} from last month
                  </p>
                </div>
                <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-lg text-white`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dashboardData?.revenue_chart || []}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#4F46E5" fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Course Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Published', value: dashboardData?.stats?.published_courses || 0 },
                  { name: 'Draft', value: dashboardData?.stats?.draft_courses || 0 },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {[0, 1].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Enrollments */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Enrollments</h2>
          <div className="space-y-4">
            {(dashboardData?.recent_enrollments || []).map((enrollment, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                    <Users size={16} className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{enrollment.student_name}</p>
                    <p className="text-sm text-gray-500">{enrollment.course_title}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(enrollment.enrolled_date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Courses */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Courses</h2>
          <div className="space-y-4">
            {(dashboardData?.top_courses || []).map((course, index) => (
              <div key={index} className="flex items-center space-x-4">
                <img
                  src={course.thumbnail || 'https://via.placeholder.com/300x200/4F46E5/ffffff?text=Course'}
                  alt={course.title || 'Course'}
                  className="w-16 h-12 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{course.title}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-gray-500">{course.total_enrolled} students</span>
                    <span className="flex items-center text-sm text-yellow-600">
                      <Star size={14} className="mr-1" />
                      {course.average_rating}
                    </span>
                    <span className="text-sm font-semibold text-green-600">${course.total_revenue}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Courses Management Component
const CoursesManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses/instructor/courses/');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      // Set empty array as fallback to prevent infinite reload
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToggle = async (courseId, currentStatus) => {
    const endpoint = currentStatus === 'published' 
      ? `/courses/instructor/courses/${courseId}/unpublish/`
      : `/courses/instructor/courses/${courseId}/publish/`;
    
    try {
      await api.post(endpoint);
      fetchCourses();
    } catch (error) {
      console.error('Error toggling publish status:', error);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 sm:mt-0 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Create New Course
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search courses..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option>All Status</option>
            <option>Published</option>
            <option>Draft</option>
          </select>
          <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option>Sort by Date</option>
            <option>Sort by Revenue</option>
            <option>Sort by Students</option>
          </select>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(courses || []).map((course) => (
          <div key={course.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden">
            <div className="relative">
              <img
                src={course.thumbnail || 'https://via.placeholder.com/300x200/4F46E5/ffffff?text=Course'}
                alt={course.title || 'Course'}
                className="w-full h-48 object-cover"
              />
              <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${
                course.status === 'published'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {course.status}
              </span>
            </div>
            
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
              
              <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                <div className="text-center">
                  <p className="text-gray-500">Students</p>
                  <p className="font-semibold text-gray-900">{course.total_enrolled}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500">Rating</p>
                  <p className="font-semibold text-yellow-600 flex items-center justify-center">
                    <Star size={14} className="mr-1" />
                    {course.average_rating || 'N/A'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500">Revenue</p>
                  <p className="font-semibold text-green-600">${course.total_revenue}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedCourse(course)}
                  className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <Edit2 size={16} className="mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handlePublishToggle(course.id, course.status)}
                  className={`flex-1 px-3 py-2 rounded-lg transition-colors flex items-center justify-center ${
                    course.status === 'published'
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {course.status === 'published' ? (
                    <>
                      <EyeOff size={16} className="mr-1" />
                      Unpublish
                    </>
                  ) : (
                    <>
                      <Eye size={16} className="mr-1" />
                      Publish
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Course Modal */}
      {showCreateModal && (
        <CreateCourseModal onClose={() => setShowCreateModal(false)} onSave={() => {
          fetchCourses();
          setShowCreateModal(false);
        }} />
      )}

      {/* Edit Course Modal */}
      {selectedCourse && (
        <EditCourseModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onSave={() => {
            fetchCourses();
            setSelectedCourse(null);
          }}
        />
      )}
    </div>
  );
};

// Create Course Modal
const CreateCourseModal = ({ onClose, onSave }) => {
  const [courseData, setCourseData] = useState({
    title: '',
    subtitle: '',
    description: '',
    category: '',
    level: 'beginner',
    language: 'en',
    course_type: 'coursera_plus', // FREE or COURSERA_PLUS
    estimated_hours: 10,
  });

  const handleSubmit = async () => {
    if (!courseData.title || !courseData.description) {
      alert('Please fill in required fields');
      return;
    }
    
    try {
      await api.post('/courses/instructor/courses/', courseData);
      onSave();
    } catch (error) {
      console.error('Error creating course:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Create New Course</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Title *
            </label>
            <input
              type="text"
              value={courseData.title}
              onChange={(e) => setCourseData({...courseData, title: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Complete React Developer Course"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subtitle
            </label>
            <input
              type="text"
              value={courseData.subtitle}
              onChange={(e) => setCourseData({...courseData, subtitle: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Brief description of your course"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={courseData.description}
              onChange={(e) => setCourseData({...courseData, description: e.target.value})}
              rows="4"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="What will students learn in this course?"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Level
              </label>
              <select
                value={courseData.level}
                onChange={(e) => setCourseData({...courseData, level: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="all_levels">All Levels</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={courseData.language}
                onChange={(e) => setCourseData({...courseData, language: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>
          
          <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Type
          </label>
          <select
            value={courseData.course_type}
            onChange={(e) => setCourseData({...courseData, course_type: e.target.value})}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="coursera_plus">Coursera Plus (Paid via subscription)</option>
            <option value="free">Free Course (No earnings)</option>
          </select>
          {courseData.course_type === 'free' && (
            <p className="text-sm text-gray-500 mt-1">
              Free courses don't generate instructor earnings
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estimated Hours to Complete
          </label>
          <input
            type="number"
            value={courseData.estimated_hours}
            onChange={(e) => setCourseData({...courseData, estimated_hours: parseFloat(e.target.value)})}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg"
            min="1"
            step="0.5"
          />
        </div>
          
          <div className="flex gap-4 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700"
            >
              Create Course
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Edit Course Modal
const EditCourseModal = ({ course, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState('basic');
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b">
          <div className="p-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Edit Course: {course.title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
          
          <div className="px-6 flex space-x-8">
            {['basic', 'curriculum', 'pricing', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-6">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Title
                </label>
                <input
                  type="text"
                  defaultValue={course.title}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows="4"
                  defaultValue={course.description || ''}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}
          
          {activeTab === 'curriculum' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Course Sections</h3>
                <button className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 text-sm">
                  Add Section
                </button>
              </div>
              <div className="space-y-3">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Section 1: Introduction</h4>
                    <span className="text-sm text-gray-500">3 lectures</span>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Section 2: Core Concepts</h4>
                    <span className="text-sm text-gray-500">5 lectures</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Type
                </label>
                <select
                  defaultValue={course.course_type || 'coursera_plus'}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="coursera_plus">Coursera Plus (Subscription-based)</option>
                  <option value="free">Free Course</option>
                </select>
                <p className="text-sm text-gray-500 mt-2">
                  {course.course_type === 'free' 
                    ? 'Free courses are available to all users but don\'t generate instructor earnings.' 
                    : 'Coursera Plus courses generate earnings based on student engagement and completion rates.'
                  }
                </p>
              </div>
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Course Settings</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3" />
                    <span className="text-sm text-gray-700">Enable course discussions</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3" />
                    <span className="text-sm text-gray-700">Allow content downloads</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3" />
                    <span className="text-sm text-gray-700">Issue certificate on completion</span>
                  </label>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex gap-4 mt-8">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Students View Component
const StudentsView = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
        <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
          <Filter size={16} className="mr-2" />
          Filter
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Courses Enrolled
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[1, 2, 3, 4, 5].map((index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-indigo-600">JS</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">John Smith</div>
                        <div className="text-sm text-gray-500">john@example.com</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">3 courses</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">65%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    2 hours ago
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">View</button>
                    <button className="text-gray-600 hover:text-gray-900">Message</button>
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

// Analytics View Component
const AnalyticsView = () => {
  const monthlyData = [
    { month: 'Jan', students: 450, revenue: 12500, completion: 78 },
    { month: 'Feb', students: 520, revenue: 14200, completion: 82 },
    { month: 'Mar', students: 480, revenue: 13800, completion: 75 },
    { month: 'Apr', students: 590, revenue: 16500, completion: 85 },
    { month: 'May', students: 650, revenue: 18200, completion: 88 },
    { month: 'Jun', students: 720, revenue: 19800, completion: 90 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option>Last 6 Months</option>
          <option>Last Year</option>
          <option>All Time</option>
        </select>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students Growth */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Student Growth</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="students" stroke="#4F46E5" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Revenue Trend */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Course Performance Table */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 text-sm font-medium text-gray-700">Course</th>
                <th className="text-left py-3 text-sm font-medium text-gray-700">Enrollments</th>
                <th className="text-left py-3 text-sm font-medium text-gray-700">Completion Rate</th>
                <th className="text-left py-3 text-sm font-medium text-gray-700">Avg. Rating</th>
                <th className="text-left py-3 text-sm font-medium text-gray-700">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[
                { name: 'React Mastery', enrollments: 890, completion: 85, rating: 4.8, revenue: 15600 },
                { name: 'Python Complete', enrollments: 670, completion: 78, rating: 4.6, revenue: 12300 },
                { name: 'Django REST API', enrollments: 450, completion: 82, rating: 4.9, revenue: 8900 },
              ].map((course, index) => (
                <tr key={index}>
                  <td className="py-3 text-sm text-gray-900">{course.name}</td>
                  <td className="py-3 text-sm text-gray-600">{course.enrollments}</td>
                  <td className="py-3 text-sm text-gray-600">{course.completion}%</td>
                  <td className="py-3 text-sm text-yellow-600 flex items-center">
                    <Star size={14} className="mr-1" />
                    {course.rating}
                  </td>
                  <td className="py-3 text-sm text-green-600 font-semibold">${course.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Earnings View Component
const EarningsView = () => {
  const [earningsData, setEarningsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const response = await api.get('/payments/instructor/earnings/');
      setEarningsData(response.data);
    } catch (error) {
      console.error('Error fetching earnings:', error);
      // Set fallback data to prevent infinite reload
      setEarningsData({
        summary: {
          total_earnings: 0,
          pending_earnings: 0,
          monthly_earnings: 0,
          platform_fee_rate: 30
        },
        recent_transactions: [],
        monthly_chart: []
      });
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
      <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
      
      {/* Earnings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-green-100">Total Earnings</p>
            <DollarSign size={24} className="text-green-200" />
          </div>
          <p className="text-3xl font-bold">${earningsData?.summary?.total_earnings || 0}</p>
          <p className="text-sm text-green-100 mt-2">Lifetime earnings</p>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-yellow-100">Pending</p>
            <Clock size={24} className="text-yellow-200" />
          </div>
          <p className="text-3xl font-bold">${earningsData?.summary?.pending_earnings || 0}</p>
          <p className="text-sm text-yellow-100 mt-2">Being processed</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-100">This Month</p>
            <TrendingUp size={24} className="text-blue-200" />
          </div>
          <p className="text-3xl font-bold">${earningsData?.summary?.monthly_earnings || 0}</p>
          <p className="text-sm text-blue-100 mt-2">Current month earnings</p>
        </div>
      </div>
      
      {/* Monthly Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Earnings</h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={earningsData?.monthly_chart || []}>
            <defs>
              <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="earnings" stroke="#10B981" fillOpacity={1} fill="url(#colorEarnings)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(earningsData?.recent_transactions || []).map((transaction, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.course}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.student_email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${transaction.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      transaction.status === 'Paid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {transaction.status}
                    </span>
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

// Messages View Component
const MessagesView = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">Message center coming soon...</p>
      </div>
    </div>
  );
};

// Settings View Component
const SettingsView = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" defaultValue="John" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" defaultValue="Instructor" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input type="email" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" defaultValue="instructor@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input type="tel" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="+1 234 567 890" />
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payout Method</label>
                <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option>PayPal</option>
                  <option>Bank Transfer</option>
                  <option>Stripe</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payout Email/Account</label>
                <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="payment@example.com" />
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" defaultChecked />
                <span className="text-sm text-gray-700">Email me when a student enrolls</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" defaultChecked />
                <span className="text-sm text-gray-700">Email me for new reviews</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" />
                <span className="text-sm text-gray-700">Weekly summary reports</span>
              </label>
            </div>
          </div>
          
          <button className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;