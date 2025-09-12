import React, { useState } from 'react';
import { X } from 'lucide-react';
import api from '../../services/api';

// Create Course Modal
export const CreateCourseModal = ({ onClose, onSave }) => {
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
export const EditCourseModal = ({ course, onClose, onSave }) => {
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