import React from 'react';
import { AlertCircle, MapPin, Clock } from 'lucide-react';

const ComplaintCard = ({ complaint, onStatusChange, onDepartmentChange, departments, isDepartmentView }) => {
  const priorityColors = {
    'High': 'bg-red-100 text-red-800 border-red-200',
    'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Low': 'bg-green-100 text-green-800 border-green-200'
  };

  const statusColors = {
    'Pending': 'bg-gray-100 text-gray-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'Completed': 'bg-green-100 text-green-800'
  };

  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-2 items-center">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${priorityColors[complaint.priority]}`}>
              <AlertCircle className="w-3 h-3 mr-1" />
              {complaint.priority} Priority
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-transparent ${statusColors[complaint.status]}`}>
              <Clock className="w-3 h-3 mr-1" />
              {complaint.status}
            </span>
            {complaint.similarCount > 1 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {complaint.similarCount} Similar Complaints
              </span>
            )}
          </div>
          <div className="text-sm text-gray-400">
            {new Date(complaint.createdAt).toLocaleDateString()}
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">{complaint.category}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{complaint.text}</p>
        
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <MapPin className="w-4 h-4 mr-1" />
          {complaint.location}
        </div>

        {complaint.image && (
          <div className="mb-4">
            <img src={complaint.image} alt="Complaint Attachment" className="w-full max-h-48 object-cover rounded-lg border border-gray-200" />
          </div>
        )}

        {complaint.answers && complaint.answers.length > 0 && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg text-sm border border-gray-100">
            <h4 className="font-semibold text-gray-700 mb-3">Additional Context</h4>
            <ul className="space-y-3">
              {complaint.answers.map((ans, idx) => (
                <li key={idx}>
                  <p className="text-gray-500 italic mb-1 mb-1">Q: {ans.q}</p>
                  <p className="text-gray-800 font-medium">A: {ans.a}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">{complaint.department}</span>
          </div>

          <div className="flex items-center gap-3 space-x-2">
            {!isDepartmentView && departments && onDepartmentChange && (
              <select 
                value={complaint.department} 
                onChange={(e) => onDepartmentChange(complaint.id, e.target.value)}
                className="text-sm block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-1"
              >
                {departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            )}

            {(isDepartmentView || !departments) && onStatusChange && (
              <select 
                value={complaint.status} 
                onChange={(e) => onStatusChange(complaint.id, e.target.value)}
                className="text-sm block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-1 border"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintCard;
