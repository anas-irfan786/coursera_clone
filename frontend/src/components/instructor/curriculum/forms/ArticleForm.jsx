import React, { useState } from 'react';
import { Upload } from 'lucide-react';

const ArticleForm = ({ formData, setFormData }) => {
  const [contentSource, setContentSource] = useState('text');

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Content Type
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="text"
              checked={contentSource === 'text'}
              onChange={(e) => setContentSource(e.target.value)}
              className="text-indigo-600"
            />
            <span className="text-sm">Rich Text</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="markdown"
              checked={contentSource === 'markdown'}
              onChange={(e) => setContentSource(e.target.value)}
              className="text-indigo-600"
            />
            <span className="text-sm">Markdown File</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="pdf"
              checked={contentSource === 'pdf'}
              onChange={(e) => setContentSource(e.target.value)}
              className="text-indigo-600"
            />
            <span className="text-sm">PDF Upload</span>
          </label>
        </div>
      </div>

      {contentSource === 'text' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Article Content
          </label>
          <textarea
            value={formData.article_content}
            onChange={(e) => setFormData({...formData, article_content: e.target.value})}
            rows="10"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Write your article content here..."
          />
        </div>
      )}

      {(contentSource === 'markdown' || contentSource === 'pdf') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload {contentSource === 'markdown' ? 'Markdown' : 'PDF'} File
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">Choose {contentSource} file or drag and drop</p>
            <p className="text-sm text-gray-500">
              {contentSource === 'markdown' ? '.md files up to 10MB' : '.pdf files up to 50MB'}
            </p>
            <input
              type="file"
              accept={contentSource === 'markdown' ? '.md' : '.pdf'}
              className="hidden"
              id="content-upload"
            />
            <label
              htmlFor="content-upload"
              className="mt-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
            >
              Choose File
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleForm;