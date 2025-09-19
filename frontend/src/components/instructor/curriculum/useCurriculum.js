import { useState, useEffect } from 'react';
import api from '../../../services/api';

const useCurriculum = (courseId) => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSections = async () => {
    if (!courseId) return;

    try {
      const response = await api.get(`/courses/instructor/courses/${courseId}/sections/`);
      setSections(response.data);
    } catch (error) {
      console.error('Error fetching sections:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, [courseId]);

  const createSection = async (sectionData) => {
    try {
      const response = await api.post(`/courses/instructor/courses/${courseId}/sections/`, sectionData);
      fetchSections();
      return response.data;
    } catch (error) {
      console.error('Error creating section:', error);
      alert('Error creating section');
    }
  };

  const updateSection = async (sectionId, sectionData) => {
    try {
      const response = await api.put(`/courses/instructor/sections/${sectionId}/`, sectionData);
      fetchSections();
      return response.data;
    } catch (error) {
      console.error('Error updating section:', error);
      alert('Error updating section');
    }
  };

  const deleteSection = async (sectionId) => {
    if (!window.confirm('Are you sure you want to delete this section and all its lectures?')) return;

    try {
      await api.delete(`/courses/instructor/sections/${sectionId}/`);
      fetchSections();
    } catch (error) {
      console.error('Error deleting section:', error);
      alert('Error deleting section');
    }
  };

  const createLecture = async (sectionId, lectureData) => {
    try {
      // Convert to FormData if there are files
      const formData = new FormData();

      // Add all non-file data
      Object.keys(lectureData).forEach(key => {
        if (key !== 'video_file' && key !== 'subtitle_file' && key !== 'reading_file' && key !== 'markdown_file' && key !== 'pdf_file' && key !== 'questions' && key !== 'quiz_settings' && key !== 'assignment_settings') {
          if (lectureData[key] !== null && lectureData[key] !== undefined) {
            formData.append(key, lectureData[key]);
          }
        }
      });

      // Add file data
      if (lectureData.video_file) {
        formData.append('video_file', lectureData.video_file);
      }
      if (lectureData.subtitle_file) {
        formData.append('subtitle_file', lectureData.subtitle_file);
      }
      if (lectureData.reading_file) {
        formData.append('reading_file', lectureData.reading_file);
      }
      if (lectureData.markdown_file) {
        formData.append('markdown_file', lectureData.markdown_file);
      }
      if (lectureData.pdf_file) {
        formData.append('pdf_file', lectureData.pdf_file);
      }

      // Handle assignment attachment file separately
      if (lectureData.assignment_settings?.attachment && lectureData.assignment_settings.attachment instanceof File) {
        formData.append('attachment', lectureData.assignment_settings.attachment);
      }

      // Add complex objects as JSON strings (excluding attachment file from assignment_settings)
      if (lectureData.questions) {
        formData.append('questions', JSON.stringify(lectureData.questions));
      }
      if (lectureData.quiz_settings) {
        formData.append('quiz_settings', JSON.stringify(lectureData.quiz_settings));
      }
      if (lectureData.assignment_settings) {
        // Create a copy without the attachment file for JSON serialization
        const assignmentSettingsForJson = { ...lectureData.assignment_settings };
        if (assignmentSettingsForJson.attachment instanceof File) {
          delete assignmentSettingsForJson.attachment;
        }
        formData.append('assignment_settings', JSON.stringify(assignmentSettingsForJson));
      }

      const response = await api.post(`/courses/instructor/sections/${sectionId}/lectures/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 900000, // 15 minutes timeout for very large files (up to 2GB)
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        },
      });
      fetchSections();
      return response.data;
    } catch (error) {
      console.error('Error creating lecture:', error);

      // Handle different types of errors
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        alert('Upload timeout. The file is too large or your connection is slow. Please try with a smaller file or check your internet connection.');
      } else if (error.response?.status === 413) {
        alert('File too large. Maximum file size is 2GB. Please reduce the file size and try again.');
      } else if (error.response?.status === 500) {
        alert('Server error while processing your upload. Please try again later.');
      } else {
        alert(`Error creating lecture: ${error.response?.data?.error || error.message || 'Unknown error'}`);
      }

      throw error; // Re-throw so the modal can handle the uploading state
    }
  };

  const updateLecture = async (lectureId, lectureData) => {
    try {
      // Convert to FormData if there are files
      const formData = new FormData();

      // Add all non-file data
      Object.keys(lectureData).forEach(key => {
        if (key !== 'video_file' && key !== 'subtitle_file' && key !== 'reading_file' && key !== 'markdown_file' && key !== 'pdf_file' && key !== 'questions' && key !== 'quiz_settings' && key !== 'assignment_settings') {
          if (lectureData[key] !== null && lectureData[key] !== undefined) {
            formData.append(key, lectureData[key]);
          }
        }
      });

      // Add file data
      if (lectureData.video_file) {
        formData.append('video_file', lectureData.video_file);
      }
      if (lectureData.subtitle_file) {
        formData.append('subtitle_file', lectureData.subtitle_file);
      }
      if (lectureData.reading_file) {
        formData.append('reading_file', lectureData.reading_file);
      }
      if (lectureData.markdown_file) {
        formData.append('markdown_file', lectureData.markdown_file);
      }
      if (lectureData.pdf_file) {
        formData.append('pdf_file', lectureData.pdf_file);
      }

      // Handle assignment attachment file separately
      if (lectureData.assignment_settings?.attachment && lectureData.assignment_settings.attachment instanceof File) {
        formData.append('attachment', lectureData.assignment_settings.attachment);
      }

      // Add complex objects as JSON strings (excluding attachment file from assignment_settings)
      if (lectureData.questions) {
        formData.append('questions', JSON.stringify(lectureData.questions));
      }
      if (lectureData.quiz_settings) {
        formData.append('quiz_settings', JSON.stringify(lectureData.quiz_settings));
      }
      if (lectureData.assignment_settings) {
        // Create a copy without the attachment file for JSON serialization
        const assignmentSettingsForJson = { ...lectureData.assignment_settings };
        if (assignmentSettingsForJson.attachment instanceof File) {
          delete assignmentSettingsForJson.attachment;
        }
        formData.append('assignment_settings', JSON.stringify(assignmentSettingsForJson));
      }

      const response = await api.put(`/courses/instructor/lectures/${lectureId}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 900000, // 15 minutes timeout for very large files (up to 2GB)
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        },
      });
      fetchSections();
      return response.data;
    } catch (error) {
      console.error('Error updating lecture:', error);

      // Handle different types of errors
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        alert('Upload timeout. The file is too large or your connection is slow. Please try with a smaller file or check your internet connection.');
      } else if (error.response?.status === 413) {
        alert('File too large. Maximum file size is 2GB. Please reduce the file size and try again.');
      } else if (error.response?.status === 500) {
        alert('Server error while processing your upload. Please try again later.');
      } else {
        alert(`Error updating lecture: ${error.response?.data?.error || error.message || 'Unknown error'}`);
      }

      throw error; // Re-throw so the modal can handle the uploading state
    }
  };

  const deleteLecture = async (lectureId) => {
    if (!window.confirm('Are you sure you want to delete this lecture?')) return;

    try {
      await api.delete(`/courses/instructor/lectures/${lectureId}/`);
      fetchSections();
    } catch (error) {
      console.error('Error deleting lecture:', error);
      alert('Error deleting lecture');
    }
  };

  const reorderSections = async (newSectionOrder) => {
    try {
      const section_orders = newSectionOrder.map((section, index) => ({
        uuid: section.id,
        order: index + 1
      }));

      await api.post(`/courses/instructor/courses/${courseId}/sections/reorder/`, {
        section_orders
      });

      // Update local state immediately for better UX
      setSections(newSectionOrder);
    } catch (error) {
      console.error('Error reordering sections:', error);
      alert('Error reordering sections');
      // Revert on error
      fetchSections();
    }
  };

  const reorderLectures = async (sectionId, newLectureOrder) => {
    try {
      const lecture_orders = newLectureOrder.map((lecture, index) => ({
        uuid: lecture.id,
        order: index + 1
      }));

      await api.post(`/courses/instructor/sections/${sectionId}/lectures/reorder/`, {
        lecture_orders
      });

      // Update local state immediately for better UX
      setSections(prevSections =>
        prevSections.map(section =>
          section.id === sectionId
            ? { ...section, lectures: newLectureOrder }
            : section
        )
      );
    } catch (error) {
      console.error('Error reordering lectures:', error);
      alert('Error reordering lectures');
      // Revert on error
      fetchSections();
    }
  };

  const reorderQuizQuestions = async (lectureId, newQuestionOrder) => {
    try {
      const question_orders = newQuestionOrder.map((question, index) => ({
        id: question.id, // Using internal ID for questions
        order: index + 1
      }));

      await api.post(`/assessments/api/quizzes/${lectureId}/reorder-questions/`, {
        question_orders
      });

      return true;
    } catch (error) {
      console.error('Error reordering quiz questions:', error);
      alert('Error reordering quiz questions');
      return false;
    }
  };

  return {
    sections,
    loading,
    createSection,
    updateSection,
    deleteSection,
    createLecture,
    updateLecture,
    deleteLecture,
    reorderSections,
    reorderLectures,
    reorderQuizQuestions
  };
};

export default useCurriculum;