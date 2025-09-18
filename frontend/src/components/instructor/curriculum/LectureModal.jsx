import React, { useState, useEffect } from 'react';
import { Play, FileText, HelpCircle, ClipboardList } from 'lucide-react';
import VideoLectureForm from './forms/VideoLectureForm';
import ArticleForm from './forms/ArticleForm';
import QuizForm from './forms/QuizForm';
import AssignmentForm from './forms/AssignmentForm';

const LectureModal = ({ lecture, onClose, onSave, title }) => {
  const [formData, setFormData] = useState({
    title: lecture?.title || '',
    description: lecture?.description || '',
    content_type: lecture?.content_type || 'video',
    video_url: lecture?.video_url || '',
    article_content: lecture?.article_content || '',
    is_preview: lecture?.is_preview || false,
    is_downloadable: lecture?.is_downloadable || false
  });

  const [activeTab, setActiveTab] = useState(formData.content_type);

  useEffect(() => {
    setFormData(prev => ({ ...prev, content_type: activeTab }));
  }, [activeTab]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a lecture title');
      return;
    }
    onSave(formData);
  };

  const contentTypes = [
    { id: 'video', label: 'Video Lecture', icon: Play },
    { id: 'article', label: 'Reading', icon: FileText },
    { id: 'quiz', label: 'Quiz', icon: HelpCircle },
    { id: 'assignment', label: 'Assignment', icon: ClipboardList }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>

        <div className="px-6 pt-4">
          <div className="flex space-x-1 border-b">
            {contentTypes.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === id
                    ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lecture Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Introduction to Components"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Brief description of this lecture"
            />
          </div>

          {activeTab === 'video' && (
            <VideoLectureForm formData={formData} setFormData={setFormData} />
          )}

          {activeTab === 'article' && (
            <ArticleForm formData={formData} setFormData={setFormData} />
          )}

          {activeTab === 'quiz' && (
            <QuizForm formData={formData} setFormData={setFormData} />
          )}

          {activeTab === 'assignment' && (
            <AssignmentForm formData={formData} setFormData={setFormData} />
          )}

          <div className="space-y-3 pt-4 border-t">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_preview}
                onChange={(e) => setFormData({...formData, is_preview: e.target.checked})}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Allow free preview</span>
            </label>

            {activeTab !== 'quiz' && (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_downloadable}
                  onChange={(e) => setFormData({...formData, is_downloadable: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Allow download</span>
              </label>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              {lecture ? 'Update' : 'Create'} Lecture
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LectureModal;