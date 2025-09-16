import React, { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';

// Using the same mock API structure
const api = {
  get: async (endpoint) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

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
          {
            id: 4,
            course_id: 4,
            title: "Digital Marketing Masterclass",
            instructor: "Emma Davis",
            thumbnail: "https://via.placeholder.com/400x200/EC4899/ffffff?text=Marketing",
            progress: 100,
            last_accessed: "2024-01-10",
            next_lesson: "Course Complete!",
            total_lessons: 89,
            completed_lessons: 89,
            estimated_completion: "Complete",
          },
          {
            id: 5,
            course_id: 5,
            title: "UI/UX Design Fundamentals",
            instructor: "Lisa Anderson",
            thumbnail: "https://via.placeholder.com/400x200/06B6D4/ffffff?text=Design",
            progress: 5,
            last_accessed: "2024-01-12",
            next_lesson: "Introduction to Design Thinking",
            total_lessons: 156,
            completed_lessons: 8,
            estimated_completion: "12 weeks",
          }
        ],
      };
    }

    return { data: [] };
  },
};

const MyLearningView = () => {
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      const response = await api.get("/courses/enrolled/");
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
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
          <div
            key={course.id}
            className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full sm:w-48 h-48 sm:h-auto object-cover"
              />

              <div className="flex-1 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {course.instructor}
                </p>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Overall Progress</span>
                      <span className="font-medium text-gray-900">
                        {course.progress}%
                      </span>
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
                      Next:{" "}
                      <span className="font-medium text-gray-900">
                        {course.next_lesson}
                      </span>
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

export default MyLearningView;