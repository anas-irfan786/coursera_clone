import React, { useState } from 'react';
import { Heart, Star, Clock, BookOpen } from 'lucide-react';
import api from '../../services/api';

const CourseCard = ({ course, onEnrollSuccess }) => {
  const [liked, setLiked] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  const handleEnroll = async () => {
    if (!course.can_enroll || enrolling) return;

    setEnrolling(true);
    try {
      await api.post(`/courses/${course.id}/enroll/`);

      // Show success message
      alert('Successfully enrolled in course!');

      // Callback to parent to refresh data
      if (onEnrollSuccess) {
        onEnrollSuccess();
      }
    } catch (error) {
      console.error('Enrollment error:', error);

      if (error.response?.status === 402) {
        alert('Coursera Plus subscription required to enroll in this course.');
      } else if (error.response?.data?.error) {
        alert(`Enrollment failed: ${error.response.data.error}`);
      } else {
        alert('Failed to enroll. Please try again.');
      }
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden">
      <div className="relative">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            course.course_type === "free"
              ? "bg-green-500 text-white"
              : "bg-purple-500 text-white"
          }`}>
            {course.course_type === "free" ? "FREE" : "PLUS"}
          </span>
          {course.is_enrolled && (
            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              ENROLLED
            </span>
          )}
        </div>
        <button
          onClick={() => setLiked(!liked)}
          className="absolute top-4 right-4 bg-white/90 backdrop-blur p-2 rounded-full hover:bg-white transition-colors"
        >
          <Heart
            size={18}
            className={liked ? "fill-red-500 text-red-500" : "text-gray-600"}
          />
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
            {course.category}
          </span>
          <span className="text-xs text-gray-500">{course.level}</span>
        </div>

        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
          {course.title}
        </h3>
        <p className="text-sm text-gray-600 mb-3">{course.instructor}</p>

        <div className="flex items-center space-x-4 mb-3">
          <div className="flex items-center">
            <Star size={16} className="text-yellow-500 fill-current" />
            <span className="text-sm font-medium ml-1">{course.rating}</span>
          </div>
          <span className="text-sm text-gray-500">
            ({course.students.toLocaleString()} students)
          </span>
        </div>

        {/* Progress bar for enrolled courses */}
        {course.is_enrolled && course.progress !== undefined && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span>{Math.round(course.progress || 0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${course.progress || 0}%` }}
              ></div>
            </div>
          </div>
        )}

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

        <button
          onClick={course.is_enrolled ? () => window.location.href = `/courses/${course.course_id || course.id}/learn` : handleEnroll}
          className={`w-full mt-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
            course.is_enrolled
              ? "bg-green-600 text-white hover:bg-green-700"
              : course.can_enroll && !enrolling
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          disabled={!course.is_enrolled && (!course.can_enroll || enrolling)}
        >
          {course.is_enrolled
            ? "Go to Course"
            : enrolling
              ? "Enrolling..."
              : course.can_enroll
                ? "Enroll Now"
                : course.enrollment_message || "Cannot Enroll"
          }
        </button>
      </div>
    </div>
  );
};

export default CourseCard;