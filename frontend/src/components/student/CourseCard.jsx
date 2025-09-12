import React, { useState } from 'react';
import { Heart, Star, Clock, BookOpen } from 'lucide-react';

const CourseCard = ({ course }) => {
  const [liked, setLiked] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden">
      <div className="relative">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-48 object-cover"
        />
        {course.course_type === "free" && (
          <span className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            FREE
          </span>
        )}
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

export default CourseCard;