import React, { useState, useEffect } from 'react';
import { Plus, Search, Star, Edit2, Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';
import { CreateCourseModal, EditCourseModal } from './CourseModals';

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

export default CoursesManagement;