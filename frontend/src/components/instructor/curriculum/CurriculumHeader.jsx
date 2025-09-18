import React from 'react';
import { Plus } from 'lucide-react';

const CurriculumHeader = ({ onAddSection }) => {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-gray-900">Course Curriculum</h3>
      <button
        onClick={onAddSection}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        <Plus size={16} />
        Add Section
      </button>
    </div>
  );
};

export default CurriculumHeader;