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
      const response = await api.post(`/courses/instructor/sections/${sectionId}/lectures/`, lectureData);
      fetchSections();
      return response.data;
    } catch (error) {
      console.error('Error creating lecture:', error);
      alert('Error creating lecture');
    }
  };

  const updateLecture = async (lectureId, lectureData) => {
    try {
      const response = await api.put(`/courses/instructor/lectures/${lectureId}/`, lectureData);
      fetchSections();
      return response.data;
    } catch (error) {
      console.error('Error updating lecture:', error);
      alert('Error updating lecture');
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

  return {
    sections,
    loading,
    createSection,
    updateSection,
    deleteSection,
    createLecture,
    updateLecture,
    deleteLecture
  };
};

export default useCurriculum;