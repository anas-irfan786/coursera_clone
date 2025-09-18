import React, { useState } from 'react';

const QuizForm = ({ formData, setFormData }) => {
  const [quizType, setQuizType] = useState('practice');

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Quiz Type
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="practice"
              checked={quizType === 'practice'}
              onChange={(e) => setQuizType(e.target.value)}
              className="text-indigo-600"
            />
            <span className="text-sm">Practice Quiz (Ungraded)</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="graded"
              checked={quizType === 'graded'}
              onChange={(e) => setQuizType(e.target.value)}
              className="text-indigo-600"
            />
            <span className="text-sm">Graded Quiz</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Limit (minutes)
          </label>
          <input
            type="number"
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Attempts
          </label>
          <input
            type="number"
            min="1"
            max="10"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="3"
          />
        </div>
      </div>

      {quizType === 'graded' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Passing Score (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="70"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weight in Grade
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="10.0"
            />
          </div>
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Quiz questions will be managed separately after creating the lecture.
          You'll be able to add multiple choice questions with auto-grading functionality.
        </p>
      </div>
    </div>
  );
};

export default QuizForm;