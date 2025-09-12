import React, { useState, useEffect } from 'react';
import { ChevronRight, PlayCircle, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import CourseCard from './CourseCard';

// Using the mock API from StudentDashboard
const api = {
  get: async (endpoint) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (endpoint.includes("/courses/all")) {
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
            description: "Master Python programming from basics to advanced concepts",
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
            description: "Build powerful, fast, user-friendly and reactive web apps",
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
            description: "Learn to create Machine Learning Algorithms in Python",
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
            description: "Complete digital marketing course covering SEO, social media, and more",
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
            description: "Master algorithmic programming techniques",
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
            description: "Learn the principles of user interface and user experience design",
          },
        ],
      };
    }

    if (endpoint.includes("/courses/enrolled")) {
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
            estimated_completion: "2 weeks",
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
            estimated_completion: "4 weeks",
          },
          {
            id: 3,
            course_id: 3,
            title: "Machine Learning A-Z",
            instructor: "Prof. Michael Chen",
            thumbnail: "https://via.placeholder.com/400x200/F59E0B/ffffff?text=ML",
            progress: 18,
            last_accessed: "2024-01-13",
            next_lesson: "Linear Regression",
            total_lessons: 204,
            completed_lessons: 37,
            estimated_completion: "8 weeks",
          },
        ],
      };
    }

    if (endpoint.includes("/courses/student/stats/")) {
      return {
        data: {
          current_streak: 12,
          this_week_hours: 18.5,
          total_courses: 8,
          certificates_earned: 3,
          achievements: [
            {
              id: 1,
              title: "Week Warrior",
              description: "Completed 5 hours of learning this week",
              icon: "🏆",
              earned_date: "2024-01-15",
            },
            {
              id: 2,
              title: "Python Master",
              description: "Completed Python fundamentals course",
              icon: "🐍",
              earned_date: "2024-01-12",
            },
            {
              id: 3,
              title: "Streak Master",
              description: "Maintained a 10-day learning streak",
              icon: "🔥",
              earned_date: "2024-01-10",
            },
          ],
        },
      };
    }

    return { data: [] };
  },
};

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
        api.get("/courses/student/stats/"),
        api.get("/courses/enrolled/"),
        api.get("/courses/all/"),
      ]);

      setStats(statsRes.data);
      setEnrolledCourses(enrolledRes.data.slice(0, 3));
      setRecommendedCourses(coursesRes.data.slice(3, 6));
    } catch (error) {
      console.error("Error fetching data:", error);
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
    { day: "Mon", hours: 2.5 },
    { day: "Tue", hours: 1.8 },
    { day: "Wed", hours: 3.2 },
    { day: "Thu", hours: 2.1 },
    { day: "Fri", hours: 1.5 },
    { day: "Sat", hours: 4.0 },
    { day: "Sun", hours: 3.5 },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back! 👋</h1>
        <p className="text-indigo-100">
          You're on a {stats?.current_streak || 0} day learning streak! Keep it up!
        </p>
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
            <div
              key={course.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden"
            >
              <div className="relative">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-40 object-cover"
                />
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
              <div
                key={achievement.id}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
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

export default HomeView;