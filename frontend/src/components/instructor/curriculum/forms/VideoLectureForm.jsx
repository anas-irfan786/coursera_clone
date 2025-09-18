import React, { useState } from 'react';
import { Upload } from 'lucide-react';

const VideoLectureForm = ({ formData, setFormData }) => {
  const [videoSource, setVideoSource] = useState('url');

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Video Source
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="url"
              checked={videoSource === 'url'}
              onChange={(e) => setVideoSource(e.target.value)}
              className="text-indigo-600"
            />
            <span className="text-sm">YouTube/External URL</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="upload"
              checked={videoSource === 'upload'}
              onChange={(e) => setVideoSource(e.target.value)}
              className="text-indigo-600"
            />
            <span className="text-sm">Upload Video File</span>
          </label>
        </div>
      </div>

      {videoSource === 'url' ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Video URL
          </label>
          <input
            type="url"
            value={formData.video_url}
            onChange={(e) => setFormData({...formData, video_url: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="https://www.youtube.com/watch?v=..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Supported: YouTube, Vimeo, and direct video URLs
          </p>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Video File
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">Choose video file or drag and drop</p>
            <p className="text-sm text-gray-500">MP4, WebM, MOV up to 2GB</p>
            <input
              type="file"
              accept="video/*"
              className="hidden"
              id="video-upload"
            />
            <label
              htmlFor="video-upload"
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

export default VideoLectureForm;