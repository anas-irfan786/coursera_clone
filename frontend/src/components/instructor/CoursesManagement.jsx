import React, { useState, useEffect } from 'react';
import { Plus, Search, Star, Edit2, Eye, EyeOff, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { CreateCourseModal, EditCourseModal } from './CourseModals';
import DeleteCourseModal from './DeleteCourseModal';
import authService from '../../services/authService';


const CoursesManagement = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOption, setSortOption] = useState('date');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses/instructor/courses/');
      setCourses(response.data);
      setFilteredCourses(response.data); // Initialize filtered courses
    } catch (error) {
      console.error('Error fetching courses:', error);
      // Set empty array as fallback to prevent infinite reload
      setCourses([]);
      setFilteredCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort courses whenever search term, status filter, or sort option changes
  useEffect(() => {
    let filtered = [...courses];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(course => course.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'revenue':
          return (b.total_revenue || 0) - (a.total_revenue || 0);
        case 'students':
          return (b.total_enrolled || 0) - (a.total_enrolled || 0);
        case 'date':
        default:
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
    });

    setFilteredCourses(filtered);
  }, [courses, searchTerm, statusFilter, sortOption]);

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

  const handleDeleteClick = (course) => {
    setCourseToDelete(course);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async (confirmation) => {
    try {
      await api.post(`/courses/instructor/courses/${courseToDelete.id}/delete-course/`, {
        confirmation
      });
      
      // Refresh the courses list
      await fetchCourses();
      
      // Close modal and reset state
      setShowDeleteModal(false);
      setCourseToDelete(null);
      
      alert(`Course "${courseToDelete.title}" has been successfully deleted.`);
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error; // Re-throw to let the modal handle the error
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="pending_review">Pending Review</option>
            <option value="unpublished">Unpublished</option>
          </select>
          <select 
            value={sortOption} 
            onChange={(e) => setSortOption(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="date">Sort by Date</option>
            <option value="revenue">Sort by Revenue</option>
            <option value="students">Sort by Students</option>
          </select>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(filteredCourses || []).map((course) => (
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
              
              <div className="space-y-2">
                {/* Edit and Publish/Unpublish buttons */}
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
                
                {/* Delete button */}
                <button
                  onClick={() => handleDeleteClick(course)}
                  className="w-full px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center border border-red-200"
                >
                  <Trash2 size={16} className="mr-1" />
                  Delete Course
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No results message */}
      {!loading && filteredCourses.length === 0 && courses.length > 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setSortOption('date');
            }}
            className="mt-4 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* No courses at all */}
      {!loading && courses.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
          <p className="text-gray-600 mb-4">Create your first course to get started!</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
          >
            Create Your First Course
          </button>
        </div>
      )}

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

      {/* Delete Course Modal */}
      {showDeleteModal && courseToDelete && (
        <DeleteCourseModal
          course={courseToDelete}
          currentUser={authService.getCurrentUser()}
          onClose={() => {
            setShowDeleteModal(false);
            setCourseToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
};

export default CoursesManagement;