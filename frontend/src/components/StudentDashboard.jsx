import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { BookOpen, Clock, Award, TrendingUp, Calendar, Play, CheckCircle, Star, Filter, Search, Bell, User, Settings, LogOut, Home, BookMarked, Trophy, Download, ArrowRight, PlayCircle, Users, Timer, Target, Zap, ChevronRight, Heart, Share2, MoreVertical, Menu, X } from 'lucide-react';
import authService from '../services/authService';

// Mock API service
const api = {
  get: async (endpoint) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (endpoint.includes('/courses/all')) {
      return {
        data: [
          {
            id: 1,
            title: "Complete Python Developer",
            instructor: "Dr. Sarah Johnson",
            thumbnail: "https://via.placeholder.com/400x200/4F46E5/ffffff?text=Python",
            rating: 4.8,
            students: 15420,
            duration: "42 hours",
            level: "Beginner",
            category: "Programming",
            course_type: "coursera_plus",
            modules: 12,
            description: "Master Python programming from basics to advanced concepts"
          },
          {
            id: 2,
            title: "React - The Complete Guide",
            instructor: "John Williams",
            thumbnail: "https://via.placeholder.com/400x200/10B981/ffffff?text=React",
            rating: 4.9,
            students: 23500,
            duration: "58 hours",
            level: "Intermediate",
            category: "Web Development",
            course_type: "coursera_plus",
            modules: 16,
            description: "Build powerful, fast, user-friendly and reactive web apps"
          },
          {
            id: 3,
            title: "Machine Learning A-Z",
            instructor: "Prof. Michael Chen",
            thumbnail: "https://via.placeholder.com/400x200/F59E0B/ffffff?text=ML",
            rating: 4.7,
            students: 32100,
            duration: "67 hours",
            level: "Intermediate",
            category: "Data Science",
            course_type: "coursera_plus",
            modules: 20,
            description: "Learn to create Machine Learning Algorithms in Python"
          },
          {
            id: 4,
            title: "Digital Marketing Masterclass",
            instructor: "Emma Davis",
            thumbnail: "https://via.placeholder.com/400x200/EC4899/ffffff?text=Marketing",
            rating: 4.6,
            students: 8900,
            duration: "23 hours",
            level: "All Levels",
            category: "Marketing",
            course_type: "free",
            modules: 8,
            description: "Complete digital marketing course covering SEO, social media, and more"
          },
          {
            id: 5,
            title: "Data Structures & Algorithms",
            instructor: "Dr. Robert Lee",
            thumbnail: "https://via.placeholder.com/400x200/8B5CF6/ffffff?text=DSA",
            rating: 4.9,
            students: 19300,
            duration: "45 hours",
            level: "Advanced",
            category: "Computer Science",
            course_type: "coursera_plus",
            modules: 14,
            description: "Master algorithmic programming techniques"
          },
          {
            id: 6,
            title: "UI/UX Design Fundamentals",
            instructor: "Lisa Anderson",
            thumbnail: "https://via.placeholder.com/400x200/06B6D4/ffffff?text=Design",
            rating: 4.8,
            students: 11200,
            duration: "32 hours",
            level: "Beginner",
            category: "Design",
            course_type: "coursera_plus",
            modules: 10,
            description: "Learn the principles of user interface and user experience design"
          }
        ]
      };
    }
    
    if (endpoint.includes('/student/enrolled')) {
      return {
        data: [
          {
            id: 1,
            course_id: 1,
            title: "Complete Python Developer",
            instructor: "Dr. Sarah Johnson",
            thumbnail: "https://via.placeholder.com/400x200/4F46E5/ffffff?text=Python",
            progress: 65,
            last_accessed: "2024-01-15",
            next_lesson: "Working with APIs",
            total_lessons: 142,
            completed_lessons: 92,
            estimated_completion: "2 weeks"
          },
          {
            id: 2,
            course_id: 2,
            title: "React - The Complete Guide",
            instructor: "John Williams",
            thumbnail: "https://via.placeholder.com/400x200/10B981/ffffff?text=React",
            progress: 35,
            last_accessed: "2024-01-14",
            next_lesson: "React Hooks Deep Dive",
            total_lessons: 186,
            completed_lessons: 65,
            estimated_completion: "4 weeks"
          },
          {
            id: 3,
            course_id: 3,
            title: "Machine Learning A-Z",
            instructor: "Prof. Michael Chen",
            thumbnail: "https://via.placeholder.com/400x200/F59E0B/ffffff?text=ML",
            progress: 90,
            last_accessed: "2024-01-13",
            next_lesson: "Final Project",
            total_lessons: 234,
            completed_lessons: 210,
            estimated_completion: "3 days"
          }
        ]
      };
    }
    
    if (endpoint.includes('/student/stats')) {
      return {
        data: {
          total_courses: 3,
          completed_courses: 1,
          certificates_earned: 1,
          total_learning_hours: 156,
          current_streak: 7,
          longest_streak: 15,
          this_week_hours: 12.5,
          achievements: [
            { id: 1, title: "Fast Learner", icon: "🚀", description: "Complete 5 lessons in one day" },
            { id: 2, title: "Consistent", icon: "🔥", description: "7 day learning streak" },
            { id: 3, title: "Quiz Master", icon: "🏆", description: "Score 100% on 3 quizzes" }
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

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [user, setUser] = useState({
    name: 'John Student',
    email: 'student@example.com',
    avatar: 'https://ui-avatars.com/api/?name=John+Student&background=4F46E5&color=fff',
    subscription: 'coursera_plus' // or 'free'
  });

  // Get actual user data
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser({
        name: `${currentUser.first_name} ${currentUser.last_name}`,
        email: currentUser.email,
        avatar: `https://ui-avatars.com/api/?name=${currentUser.first_name}+${currentUser.last_name}&background=4F46E5&color=fff`,
        subscription: 'coursera_plus' // This should come from actual subscription data
      });
    }
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

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'my-learning', label: 'My Learning', icon: BookOpen },
    { id: 'explore', label: 'Explore', icon: Search },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'certificates', label: 'Certificates', icon: Award },
  ];

  const renderContent = () => {
    switch(activeTab) {
      case 'home':
        return <HomeView />;
      case 'my-learning':
        return <MyLearningView />;
      case 'explore':
        return <ExploreView />;
      case 'achievements':
        return <AchievementsView />;
      case 'certificates':
        return <CertificatesView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Desktop Nav */}
            <div className="flex items-center">
              <div className="flex items-center mr-8">
                <svg className="h-8 w-8 text-blue-600 mr-2" viewBox="0 0 32 32" fill="currentColor">
                  <rect x="0" y="0" width="14" height="14" rx="2" />
                  <rect x="18" y="0" width="14" height="14" rx="2" />
                  <rect x="0" y="18" width="14" height="14" rx="2" />
                  <rect x="18" y="18" width="14" height="14" rx="2" />
                </svg>
                <span className="text-2xl font-semibold text-gray-900">coursera</span>
              </div>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                        activeTab === item.id
                          ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Right side - User menu */}
            <div className="flex items-center space-x-4">
              {/* Subscription Badge */}
              {user.subscription === 'coursera_plus' && (
                <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-400 to-orange-400 text-white">
                  <Zap size={14} className="mr-1" />
                  Plus Member
                </span>
              )}
              
              {/* Notifications */}
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg relative">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {/* User Menu */}
              <div className="relative group">
                <button className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                  <img src={user.avatar} alt="Profile" className="w-8 h-8 rounded-full" />
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">Student</p>
                  </div>
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <User size={16} className="inline mr-2" />
                    Profile
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <Settings size={16} className="inline mr-2" />
                    Settings
                  </a>
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center ${
                      isLoggingOut 
                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                        : 'text-red-600 hover:bg-red-50'
                    }`}
                  >
                    {isLoggingOut ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 inline mr-2"></div>
                    ) : (
                      <LogOut size={16} className="inline mr-2" />
                    )}
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </button>
                </div>
              </div>
              
              {/* Mobile menu button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t bg-white">
            <div className="px-4 py-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

// Home View Component
const HomeView = () => {
  const [stats, setStats] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const [statsRes, enrolledRes, coursesRes] = await Promise.all([
        api.get('/student/stats'),
        api.get('/student/enrolled'),
        api.get('/courses/all')
      ]);
      
      setStats(statsRes.data);
      setEnrolledCourses(enrolledRes.data.slice(0, 3));
      setRecommendedCourses(coursesRes.data.slice(3, 6));
    } catch (error) {
      console.error('Error fetching data:', error);
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

  const weeklyProgress = [
    { day: 'Mon', hours: 2.5 },
    { day: 'Tue', hours: 1.8 },
    { day: 'Wed', hours: 3.2 },
    { day: 'Thu', hours: 2.1 },
    { day: 'Fri', hours: 1.5 },
    { day: 'Sat', hours: 4.0 },
    { day: 'Sun', hours: 3.5 },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back! 👋</h1>
        <p className="text-indigo-100">You're on a {stats?.current_streak || 0} day learning streak! Keep it up!</p>
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
            <p className="text-indigo-100 text-sm">This Week</p>
            <p className="text-2xl font-bold">{stats?.this_week_hours || 0} hrs</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
            <p className="text-indigo-100 text-sm">Total Courses</p>
            <p className="text-2xl font-bold">{stats?.total_courses || 0}</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
            <p className="text-indigo-100 text-sm">Certificates</p>
            <p className="text-2xl font-bold">{stats?.certificates_earned || 0}</p>
          </div>
        </div>
      </div>

      {/* Continue Learning */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Continue Learning</h2>
          <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
            View All <ChevronRight size={16} className="inline" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden">
              <div className="relative">
                <img src={course.thumbnail} alt={course.title} className="w-full h-40 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <button className="absolute bottom-4 right-4 bg-white/90 backdrop-blur p-2 rounded-full hover:bg-white transition-colors">
                  <PlayCircle size={20} className="text-indigo-600" />
                </button>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                <p className="text-sm text-gray-500 mb-3">{course.instructor}</p>
                
                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium text-gray-900">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    {course.completed_lessons}/{course.total_lessons} lessons
                  </p>
                  <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                    Continue →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Progress Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Learning Activity</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="hours" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4F46E5" />
                  <stop offset="100%" stopColor="#9333EA" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Achievements */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h3>
          <div className="space-y-3">
            {stats?.achievements?.map((achievement) => (
              <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{achievement.title}</p>
                  <p className="text-sm text-gray-500">{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Courses */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recommended for You</h2>
          <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
            Explore All <ChevronRight size={16} className="inline" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Course Card Component
const CourseCard = ({ course }) => {
  const [liked, setLiked] = useState(false);
  
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden">
      <div className="relative">
        <img src={course.thumbnail} alt={course.title} className="w-full h-48 object-cover" />
        {course.course_type === 'free' && (
          <span className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            FREE
          </span>
        )}
        <button 
          onClick={() => setLiked(!liked)}
          className="absolute top-4 right-4 bg-white/90 backdrop-blur p-2 rounded-full hover:bg-white transition-colors"
        >
          <Heart size={18} className={liked ? "fill-red-500 text-red-500" : "text-gray-600"} />
        </button>
      </div>
      
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
            {course.category}
          </span>
          <span className="text-xs text-gray-500">{course.level}</span>
        </div>
        
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{course.title}</h3>
        <p className="text-sm text-gray-600 mb-3">{course.instructor}</p>
        
        <div className="flex items-center space-x-4 mb-3">
          <div className="flex items-center">
            <Star size={16} className="text-yellow-500 fill-current" />
            <span className="text-sm font-medium ml-1">{course.rating}</span>
          </div>
          <span className="text-sm text-gray-500">({course.students.toLocaleString()} students)</span>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center space-x-3 text-sm text-gray-500">
            <span className="flex items-center">
              <Clock size={14} className="mr-1" />
              {course.duration}
            </span>
            <span className="flex items-center">
              <BookOpen size={14} className="mr-1" />
              {course.modules} modules
            </span>
          </div>
        </div>
        
        <button className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 text-sm font-medium">
          Enroll Now
        </button>
      </div>
    </div>
  );
};

// My Learning View
const MyLearningView = () => {
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      const response = await api.get('/student/enrolled');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">My Learning</h1>
        
        <div className="flex items-center space-x-4">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Courses</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="not-started">Not Started</option>
          </select>
          
          <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden">
            <div className="flex flex-col sm:flex-row">
              <img 
                src={course.thumbnail} 
                alt={course.title} 
                className="w-full sm:w-48 h-48 sm:h-auto object-cover"
              />
              
              <div className="flex-1 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{course.instructor}</p>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Overall Progress</span>
                      <span className="font-medium text-gray-900">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {course.completed_lessons} of {course.total_lessons} lessons
                    </span>
                    <span className="text-gray-500">
                      Est. {course.estimated_completion}
                    </span>
                  </div>
                  
                  <div className="pt-3 border-t">
                    <p className="text-sm text-gray-600 mb-2">
                      Next: <span className="font-medium text-gray-900">{course.next_lesson}</span>
                    </p>
                    <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                      Continue Learning
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Explore View
const ExploreView = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses/all');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'All Categories', icon: '🎯' },
    { id: 'programming', name: 'Programming', icon: '💻' },
    { id: 'data-science', name: 'Data Science', icon: '📊' },
    { id: 'design', name: 'Design', icon: '🎨' },
    { id: 'marketing', name: 'Marketing', icon: '📈' },
    { id: 'business', name: 'Business', icon: '💼' },
  ];

  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === 'all' || course.category.toLowerCase().includes(selectedCategory);
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-4">Explore Courses</h1>
        <p className="text-indigo-100 mb-6">Discover from thousands of courses from expert instructors</p>
        
        <div className="max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for courses, instructors, or topics..."
              className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              selectedCategory === category.id
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="mr-2">{category.icon}</span>
            {category.name}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Showing <span className="font-medium text-gray-900">{filteredCourses.length}</span> courses
        </p>
        
        <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option>Most Popular</option>
          <option>Highest Rated</option>
          <option>Newest</option>
          <option>Price: Low to High</option>
        </select>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
};

// Achievements View
const AchievementsView = () => {
  const achievements = [
    { id: 1, title: 'First Steps', description: 'Complete your first lesson', icon: '👶', earned: true, date: '2024-01-01' },
    { id: 2, title: 'Dedicated Learner', description: 'Complete 10 lessons', icon: '📚', earned: true, date: '2024-01-05' },
    { id: 3, title: 'Week Warrior', description: '7 day learning streak', icon: '🔥', earned: true, date: '2024-01-10' },
    { id: 4, title: 'Quiz Master', description: 'Score 100% on 5 quizzes', icon: '🏆', earned: true, date: '2024-01-12' },
    { id: 5, title: 'Speed Learner', description: 'Complete a course in 7 days', icon: '⚡', earned: false, progress: 60 },
    { id: 6, title: 'Polyglot', description: 'Complete courses in 3 different categories', icon: '🌍', earned: false, progress: 33 },
    { id: 7, title: 'Perfectionist', description: 'Complete 3 courses with 100% score', icon: '💯', earned: false, progress: 0 },
    { id: 8, title: 'Social Learner', description: 'Participate in 50 discussions', icon: '💬', earned: false, progress: 20 },
  ];

  const stats = {
    total_points: 2450,
    current_level: 12,
    next_level_points: 3000,
    global_rank: 1542,
    monthly_rank: 89
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">Your Achievements</h1>
            <p className="text-indigo-100">Keep learning to unlock more achievements!</p>
          </div>
          <Trophy size={48} className="text-yellow-300" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/20 backdrop-blur rounded-lg p-3">
            <p className="text-indigo-100 text-sm">Total Points</p>
            <p className="text-2xl font-bold">{stats.total_points}</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-3">
            <p className="text-indigo-100 text-sm">Current Level</p>
            <p className="text-2xl font-bold">Level {stats.current_level}</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-3">
            <p className="text-indigo-100 text-sm">Global Rank</p>
            <p className="text-2xl font-bold">#{stats.global_rank}</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-3">
            <p className="text-indigo-100 text-sm">This Month</p>
            <p className="text-2xl font-bold">#{stats.monthly_rank}</p>
          </div>
        </div>
        
        {/* Level Progress */}
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Level {stats.current_level}</span>
            <span>Level {stats.current_level + 1}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-yellow-300 h-3 rounded-full"
              style={{ width: `${(stats.total_points / stats.next_level_points) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-indigo-100 mt-2">
            {stats.next_level_points - stats.total_points} points to next level
          </p>
        </div>
      </div>

      {/* Achievements Grid */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">All Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`bg-white rounded-xl p-4 border-2 transition-all duration-200 ${
                achievement.earned 
                  ? 'border-green-500 shadow-md' 
                  : 'border-gray-200 opacity-75'
              }`}
            >
              <div className="text-3xl mb-3">{achievement.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{achievement.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
              
              {achievement.earned ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle size={16} className="mr-1" />
                  <span className="text-sm">Earned {achievement.date}</span>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Progress</span>
                    <span className="text-gray-700">{achievement.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${achievement.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Certificates View
const CertificatesView = () => {
  const certificates = [
    {
      id: 1,
      course_title: 'Python for Data Science',
      instructor: 'Dr. Sarah Johnson',
      issue_date: '2024-01-10',
      certificate_id: 'CERT-2024-PY-001',
      verification_url: 'https://coursera.com/verify/CERT-2024-PY-001',
      grade: 95.5,
      thumbnail: 'https://via.placeholder.com/400x280/4F46E5/ffffff?text=Certificate'
    },
    {
      id: 2,
      course_title: 'Machine Learning Fundamentals',
      instructor: 'Prof. Michael Chen',
      issue_date: '2023-12-15',
      certificate_id: 'CERT-2023-ML-042',
      verification_url: 'https://coursera.com/verify/CERT-2023-ML-042',
      grade: 88.0,
      thumbnail: 'https://via.placeholder.com/400x280/10B981/ffffff?text=Certificate'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">My Certificates</h1>
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
            {certificates.length} Earned
          </span>
        </div>
      </div>

      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div key={cert.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden">
              <div className="relative">
                <img src={cert.thumbnail} alt="Certificate" className="w-full h-48 object-cover" />
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Verified
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{cert.course_title}</h3>
                <p className="text-sm text-gray-600 mb-4">Instructor: {cert.instructor}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Issue Date</span>
                    <span className="text-gray-900">{new Date(cert.issue_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Certificate ID</span>
                    <span className="font-mono text-gray-900">{cert.certificate_id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Final Grade</span>
                    <span className="font-semibold text-green-600">{cert.grade}%</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                    <Download size={16} className="inline mr-2" />
                    Download
                  </button>
                  <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                    <Share2 size={16} className="inline mr-2" />
                    Share
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Award size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Certificates Yet</h3>
          <p className="text-gray-600 mb-6">Complete courses to earn verified certificates</p>
          <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Explore Courses
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;