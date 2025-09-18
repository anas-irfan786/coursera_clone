import React from 'react';
import { Edit3, Trash2, GripVertical, Play, FileText, HelpCircle, ClipboardList } from 'lucide-react';

const LectureItem = ({ lecture, lectureIndex, onEdit, onDelete }) => {
  const getLectureIcon = (contentType) => {
    switch (contentType) {
      case 'video': return <Play size={16} className="text-blue-600" />;
      case 'article': return <FileText size={16} className="text-green-600" />;
      case 'quiz': return <HelpCircle size={16} className="text-yellow-600" />;
      case 'assignment': return <ClipboardList size={16} className="text-red-600" />;
      default: return <FileText size={16} className="text-gray-600" />;
    }
  };

  const getLectureTypeLabel = (contentType) => {
    const labels = {
      'video': 'Video Lecture',
      'article': 'Reading',
      'quiz': 'Quiz',
      'assignment': 'Assignment',
      'resource': 'Resource'
    };
    return labels[contentType] || 'Content';
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
      <GripVertical size={14} className="text-gray-400 cursor-move" />
      {getLectureIcon(lecture.content_type)}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{lecture.title}</span>
          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
            {getLectureTypeLabel(lecture.content_type)}
          </span>
        </div>
        {lecture.description && (
          <p className="text-sm text-gray-600 mt-1">{lecture.description}</p>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onEdit}
          className="p-1 text-gray-400 hover:text-indigo-600 rounded"
          title="Edit Lecture"
        >
          <Edit3 size={14} />
        </button>
        <button
          onClick={onDelete}
          className="p-1 text-gray-400 hover:text-red-600 rounded"
          title="Delete Lecture"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

export default LectureItem;