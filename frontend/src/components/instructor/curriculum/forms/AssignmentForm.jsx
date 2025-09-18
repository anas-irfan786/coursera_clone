import React from 'react';
import { Upload } from 'lucide-react';

const AssignmentForm = ({ formData, setFormData }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Points
          </label>
          <input
            type="number"
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Due Date (Optional)
          </label>
          <input
            type="datetime-local"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Assignment Instructions
        </label>
        <div className="flex gap-4 mb-3">
          <label className="flex items-center gap-2">
            <input type="radio" name="instruction-type" value="text" defaultChecked className="text-indigo-600" />
            <span className="text-sm">Text Instructions</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="instruction-type" value="file" className="text-indigo-600" />
            <span className="text-sm">Upload PDF/Markdown</span>
          </label>
        </div>
        <textarea
          rows="6"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Describe the assignment requirements, deliverables, and grading criteria..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Attachment (Optional)
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600 mb-2">Upload assignment resources or templates</p>
          <p className="text-sm text-gray-500">PDF, DOC, ZIP files up to 50MB</p>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.zip"
            className="hidden"
            id="assignment-upload"
          />
          <label
            htmlFor="assignment-upload"
            className="mt-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
          >
            Choose File
          </label>
        </div>
      </div>

      <div className="bg-orange-50 p-4 rounded-lg">
        <p className="text-sm text-orange-800">
          <strong>Submission:</strong> Students will upload PDF files for submission.
          You'll review and grade submissions manually through the grading interface.
        </p>
      </div>
    </div>
  );
};

export default AssignmentForm;