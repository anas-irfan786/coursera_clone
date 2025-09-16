import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import CourseCard from './CourseCard';

// Using the same mock API structure
const api = {
  get: async (endpoint) => {
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

    return { data: [] };
  },
};

const ExploreView = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get("/courses/all/");
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: "all", name: "All Categories", icon: "🎯" },
    { id: "programming", name: "Programming", icon: "💻" },
    { id: "data-science", name: "Data Science", icon: "📊" },
    { id: "design", name: "Design", icon: "🎨" },
    { id: "marketing", name: "Marketing", icon: "📈" },
    { id: "business", name: "Business", icon: "💼" },
  ];

  const filteredCourses = courses.filter((course) => {
    const matchesCategory =
      selectedCategory === "all" ||
      course.category.toLowerCase().includes(selectedCategory);
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
        <p className="text-indigo-100 mb-6">
          Discover from thousands of courses from expert instructors
        </p>

        <div className="max-w-2xl">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
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
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
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
          Showing{" "}
          <span className="font-medium text-gray-900">
            {filteredCourses.length}
          </span>{" "}
          courses
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

export default ExploreView;