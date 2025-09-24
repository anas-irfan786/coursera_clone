import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  PlayCircle,
  BookOpen,
  FileText,
  Award,
  CheckCircle,
  Clock,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Download,
  MoreVertical
} from 'lucide-react';
import api from '../../services/api';

// Assignment Submission Form Component
const AssignmentSubmissionForm = ({ assignment, onSubmissionSuccess }) => {
  const [submitting, setSubmitting] = useState(false);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFile, setSubmissionFile] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        alert('File size cannot exceed 50MB');
        return;
      }

      // Check file type
      const allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.zip'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

      if (!allowedTypes.includes(fileExtension)) {
        alert(`File type ${fileExtension} not allowed. Allowed types: ${allowedTypes.join(', ')}`);
        return;
      }

      setSubmissionFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!submissionText.trim() && !submissionFile) {
      alert('Please provide either text submission or upload a file');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('submission_text', submissionText);
      if (submissionFile) {
        formData.append('submission_file', submissionFile);
      }

      await api.post(`/assignments/${assignment.assignment_id}/submit/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Assignment submitted successfully!');
      if (onSubmissionSuccess) {
        onSubmissionSuccess();
      }
    } catch (error) {
      console.error('Assignment submission error:', error);
      alert(error.response?.data?.error || 'Failed to submit assignment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isLate = assignment.due_date && new Date() > new Date(assignment.due_date);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Text Submission */}
      <div>
        <label htmlFor="submissionText" className="block text-sm font-medium text-gray-700 mb-2">
          Text Submission (Optional)
        </label>
        <textarea
          id="submissionText"
          value={submissionText}
          onChange={(e) => setSubmissionText(e.target.value)}
          rows={6}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Enter your submission text here..."
        />
      </div>

      {/* File Upload */}
      <div>
        <label htmlFor="submissionFile" className="block text-sm font-medium text-gray-700 mb-2">
          File Upload (Optional)
        </label>
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="submissionFile"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mb-2 text-sm text-gray-500">
                {submissionFile ? submissionFile.name : 'Click to upload file'}
              </p>
              <p className="text-xs text-gray-500">PDF, DOC, DOCX, TXT, JPG, PNG, ZIP (Max 50MB)</p>
            </div>
            <input
              id="submissionFile"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.zip"
            />
          </label>
        </div>
      </div>

      {/* Late Submission Warning */}
      {isLate && assignment.allow_late_submission && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            ⚠️ This assignment is past the due date. Late submissions may be penalized.
          </p>
        </div>
      )}

      {/* Submit Button */}
      <div className="text-center">
        <button
          type="submit"
          disabled={submitting || (isLate && !assignment.allow_late_submission)}
          className={`px-6 py-3 rounded-lg font-medium ${
            submitting || (isLate && !assignment.allow_late_submission)
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          {submitting ? 'Submitting...' : 'Submit Assignment'}
        </button>
        {isLate && !assignment.allow_late_submission && (
          <p className="mt-2 text-sm text-red-600">Late submissions not allowed for this assignment</p>
        )}
      </div>
    </form>
  );
};

const CourseLearning = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const response = await api.get(`/courses/${courseId}/learn/`);
      setCourseData(response.data);

      // Auto-expand all sections initially
      const expanded = {};
      response.data.sections.forEach(section => {
        expanded[section.id] = true;
      });
      setExpandedSections(expanded);

      // Select first incomplete lecture or first lecture
      const firstIncomplete = findFirstIncompleteLecture(response.data.sections);
      if (firstIncomplete) {
        setSelectedLecture(firstIncomplete);
      }
    } catch (error) {
      console.error('Error fetching course data:', error);
      if (error.response?.status === 403) {
        alert('You must be enrolled in this course to access learning materials');
        navigate('/student');
      }
    } finally {
      setLoading(false);
    }
  };

  const findFirstIncompleteLecture = (sections) => {
    for (const section of sections) {
      for (const lecture of section.lectures) {
        if (!lecture.is_completed) {
          return lecture;
        }
      }
    }
    // If all completed, return first lecture
    if (sections.length > 0 && sections[0].lectures.length > 0) {
      return sections[0].lectures[0];
    }
    return null;
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleLectureSelect = (lecture) => {
    setSelectedLecture(lecture);
    // Update last accessed time
    updateLastAccessed();
  };

  const updateLastAccessed = async () => {
    try {
      // This would be an API call to update last accessed time
      // await api.patch(`/courses/${courseId}/last-accessed/`);
    } catch (error) {
      console.error('Error updating last accessed:', error);
    }
  };

  const markLectureComplete = async (lectureId) => {
    try {
      await api.post(`/courses/${courseId}/lectures/${lectureId}/complete/`);
      // Refresh course data to update progress
      fetchCourseData();
    } catch (error) {
      console.error('Error marking lecture complete:', error);
      alert('Failed to mark lecture as complete. Please try again.');
    }
  };

  const getLectureIcon = (contentType) => {
    switch (contentType) {
      case 'video':
        return <PlayCircle size={16} className="text-blue-500" />;
      case 'reading':
        return <BookOpen size={16} className="text-green-500" />;
      case 'quiz':
        return <FileText size={16} className="text-orange-500" />;
      case 'assignment':
        return <Award size={16} className="text-purple-500" />;
      default:
        return <FileText size={16} className="text-gray-500" />;
    }
  };

  const renderLectureContent = () => {
    if (!selectedLecture) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No lecture selected</h3>
            <p className="text-gray-500">Select a lecture from the sidebar to start learning</p>
          </div>
        </div>
      );
    }

    const lecture = selectedLecture;

    return (
      <div className="h-full flex flex-col">
        {/* Lecture Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getLectureIcon(lecture.content_type)}
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{lecture.title}</h1>
                <p className="text-sm text-gray-500 capitalize">{lecture.content_type} Lecture</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!lecture.is_completed && lecture.content_type === 'video' && (
                <button
                  onClick={() => markLectureComplete(lecture.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Mark Complete
                </button>
              )}
              {!lecture.is_completed && lecture.content_type === 'reading' && (
                <button
                  onClick={() => markLectureComplete(lecture.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Mark Complete
                </button>
              )}
              {lecture.is_completed && (
                <span className="flex items-center text-green-600">
                  <CheckCircle size={16} className="mr-1" />
                  Completed
                </span>
              )}
            </div>
          </div>
          {lecture.description && (
            <p className="mt-2 text-gray-600">{lecture.description}</p>
          )}
        </div>

        {/* Lecture Content */}
        <div className="flex-1 overflow-auto">
          {lecture.content_type === 'video' && (
            <div className="p-6">
              {lecture.video_url ? (
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    controls
                    className="w-full h-full"
                    poster={lecture.thumbnail}
                    onTimeUpdate={(e) => {
                      // Save progress
                      const currentTime = Math.floor(e.target.currentTime);
                      // You could save this to backend periodically
                    }}
                  >
                    <source src={lecture.video_url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <PlayCircle className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-gray-500">Video content not available</p>
                  </div>
                </div>
              )}
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <span>Duration: {Math.floor(lecture.duration / 60)}:{(lecture.duration % 60).toString().padStart(2, '0')}</span>
                <span>Watched {lecture.watch_count} time{lecture.watch_count !== 1 ? 's' : ''}</span>
              </div>
            </div>
          )}

          {lecture.content_type === 'reading' && (
            <div className="p-6">
              <div className="prose max-w-none">
                <div className="mb-4 text-sm text-gray-500">
                  Estimated reading time: {lecture.estimated_reading_time} minutes
                </div>
                <div
                  className="text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: lecture.content || '<p>Reading content not available</p>' }}
                />
              </div>
            </div>
          )}

          {lecture.content_type === 'quiz' && (
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-blue-900 mb-2">Quiz Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Attempts:</span> {lecture.attempts_taken}/{lecture.max_attempts}
                  </div>
                  <div>
                    <span className="text-blue-700">Passing Score:</span> {lecture.passing_score}%
                  </div>
                  <div>
                    <span className="text-blue-700">Best Score:</span> {lecture.best_score}%
                  </div>
                  <div>
                    <span className="text-blue-700">Status:</span>
                    <span className={`ml-1 ${lecture.passed ? 'text-green-600' : 'text-red-600'}`}>
                      {lecture.passed ? 'Passed' : 'Not Passed'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  disabled={!lecture.can_attempt}
                  className={`px-6 py-3 rounded-lg font-medium ${
                    lecture.can_attempt
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {lecture.attempts_taken === 0 ? 'Start Quiz' : 'Retake Quiz'}
                </button>
                {!lecture.can_attempt && lecture.attempts_taken >= lecture.max_attempts && (
                  <p className="mt-2 text-sm text-red-600">Maximum attempts reached</p>
                )}
              </div>
            </div>
          )}

          {lecture.content_type === 'assignment' && (
            <div className="p-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-purple-900 mb-2">Assignment Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-purple-700">Due Date:</span>{' '}
                    {lecture.due_date ? new Date(lecture.due_date).toLocaleDateString() : 'No due date'}
                  </div>
                  <div>
                    <span className="text-purple-700">Max Points:</span> {lecture.max_points}
                  </div>
                  <div>
                    <span className="text-purple-700">Passing Score:</span> {lecture.passing_score}%
                  </div>
                  <div>
                    <span className="text-purple-700">Status:</span>
                    <span className={`ml-1 ${lecture.submission.submitted ? 'text-green-600' : 'text-orange-600'}`}>
                      {lecture.submission.submitted ? 'Submitted' : 'Not Submitted'}
                    </span>
                  </div>
                </div>
              </div>

              {lecture.submission.submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">Your Submission</h4>
                  <p className="text-sm text-green-700">
                    Submitted on: {new Date(lecture.submission.submission_date).toLocaleDateString()}
                    {lecture.submission.is_late && <span className="text-red-600 ml-2">(Late)</span>}
                  </p>
                  {lecture.submission.graded && (
                    <div className="mt-2">
                      <p className="text-sm">
                        <span className="text-green-700">Grade:</span> {lecture.submission.grade}/{lecture.max_points}
                      </p>
                      {lecture.submission.feedback && (
                        <div className="mt-2">
                          <p className="text-sm text-green-700">Feedback:</p>
                          <p className="text-sm text-gray-700 italic">{lecture.submission.feedback}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <AssignmentSubmissionForm
                  assignment={lecture}
                  onSubmissionSuccess={fetchCourseData}
                />
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Course not found</h2>
          <p className="text-gray-500">The course you're looking for doesn't exist or you don't have access to it.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/student')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{courseData.course.title}</h1>
                <p className="text-sm text-gray-500">by {courseData.course.instructor}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Progress: {courseData.progress.progress_percentage}%
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${courseData.progress.progress_percentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar - Course Content */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Course Content</h2>
            <p className="text-sm text-gray-500 mt-1">
              {courseData.progress.completed_lectures} of {courseData.progress.total_lectures} lectures completed
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {courseData.sections.map((section) => (
              <div key={section.id}>
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">{section.title}</h3>
                    <p className="text-sm text-gray-500">
                      {section.completed_lectures}/{section.total_lectures} lectures
                    </p>
                  </div>
                  {expandedSections[section.id] ? (
                    <ChevronDown size={16} className="text-gray-400" />
                  ) : (
                    <ChevronRight size={16} className="text-gray-400" />
                  )}
                </button>

                {expandedSections[section.id] && (
                  <div className="bg-gray-50">
                    {section.lectures.map((lecture) => (
                      <button
                        key={lecture.id}
                        onClick={() => handleLectureSelect(lecture)}
                        className={`w-full px-6 py-3 text-left hover:bg-gray-100 flex items-center space-x-3 ${
                          selectedLecture?.id === lecture.id ? 'bg-indigo-50 border-r-2 border-indigo-600' : ''
                        }`}
                      >
                        {getLectureIcon(lecture.content_type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{lecture.title}</p>
                          <p className="text-xs text-gray-500 capitalize">{lecture.content_type}</p>
                        </div>
                        {lecture.is_completed && (
                          <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white">
          {renderLectureContent()}
        </div>
      </div>
    </div>
  );
};

export default CourseLearning;