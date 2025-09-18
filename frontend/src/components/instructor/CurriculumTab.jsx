import React, { useState } from 'react';
import useCurriculum from './curriculum/useCurriculum';
import CurriculumHeader from './curriculum/CurriculumHeader';
import EmptyState from './curriculum/EmptyState';
import SectionComponent from './curriculum/SectionComponent';
import SectionModal from './curriculum/SectionModal';
import LectureModal from './curriculum/LectureModal';

const CurriculumTab = ({ courseId }) => {
  const {
    sections,
    loading,
    createSection,
    updateSection,
    deleteSection,
    createLecture,
    updateLecture,
    deleteLecture
  } = useCurriculum(courseId);

  const [showAddSection, setShowAddSection] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [showAddLecture, setShowAddLecture] = useState(null);
  const [editingLecture, setEditingLecture] = useState(null);

  const handleCreateSection = async (data) => {
    await createSection({ ...data, order: sections.length + 1 });
    setShowAddSection(false);
  };

  const handleUpdateSection = async (data) => {
    await updateSection(editingSection.id, data);
    setEditingSection(null);
  };

  const handleCreateLecture = async (data) => {
    const section = sections.find(s => s.id === showAddLecture);
    const lectureCount = section ? section.lectures.length : 0;
    await createLecture(showAddLecture, { ...data, order: lectureCount + 1 });
    setShowAddLecture(null);
  };

  const handleUpdateLecture = async (data) => {
    await updateLecture(editingLecture.id, data);
    setEditingLecture(null);
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading curriculum...</div>;
  }

  return (
    <div className="space-y-6">
      <CurriculumHeader onAddSection={() => setShowAddSection(true)} />

      {sections.length === 0 && (
        <EmptyState onAddSection={() => setShowAddSection(true)} />
      )}

      {sections.map((section, sectionIndex) => (
        <SectionComponent
          key={section.id}
          section={section}
          sectionIndex={sectionIndex}
          onEdit={() => setEditingSection(section)}
          onDelete={() => deleteSection(section.id)}
          onAddLecture={() => setShowAddLecture(section.id)}
          onEditLecture={setEditingLecture}
          onDeleteLecture={deleteLecture}
        />
      ))}

      {showAddSection && (
        <SectionModal
          onClose={() => setShowAddSection(false)}
          onSave={handleCreateSection}
          title="Add New Section"
        />
      )}

      {editingSection && (
        <SectionModal
          section={editingSection}
          onClose={() => setEditingSection(null)}
          onSave={handleUpdateSection}
          title="Edit Section"
        />
      )}

      {showAddLecture && (
        <LectureModal
          onClose={() => setShowAddLecture(null)}
          onSave={handleCreateLecture}
          title="Add New Lecture"
        />
      )}

      {editingLecture && (
        <LectureModal
          lecture={editingLecture}
          onClose={() => setEditingLecture(null)}
          onSave={handleUpdateLecture}
          title="Edit Lecture"
        />
      )}
    </div>
  );
};

export default CurriculumTab;