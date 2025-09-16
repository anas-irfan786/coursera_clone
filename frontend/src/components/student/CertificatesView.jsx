import React from 'react';
import { Download, Eye } from 'lucide-react';

const CertificatesView = () => {
  const certificates = [
    {
      id: 1,
      courseName: "Complete Python Developer",
      instructor: "Dr. Sarah Johnson",
      completionDate: "2024-01-10",
      grade: "A+",
      credentialId: "PY2024-001-JS"
    },
    {
      id: 2,
      courseName: "Digital Marketing Fundamentals",
      instructor: "Emma Davis",
      completionDate: "2024-01-05",
      grade: "A",
      credentialId: "DM2024-002-JS"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">My Certificates</h1>
        <p className="text-indigo-100">Your earned certificates and credentials</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {certificates.map((cert) => (
          <div key={cert.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {cert.courseName}
              </h3>
              <p className="text-sm text-gray-600">by {cert.instructor}</p>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Completion Date:</span>
                <span className="font-medium">{new Date(cert.completionDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Grade:</span>
                <span className="font-medium text-green-600">{cert.grade}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Credential ID:</span>
                <span className="font-mono text-xs">{cert.credentialId}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center">
                <Eye size={16} className="mr-2" />
                View Certificate
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
                <Download size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {certificates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No certificates yet</h3>
          <p className="text-gray-600">Complete courses to earn your first certificate!</p>
        </div>
      )}
    </div>
  );
};

export default CertificatesView;