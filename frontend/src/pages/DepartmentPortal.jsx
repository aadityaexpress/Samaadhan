import React, { useEffect, useState, useContext, useMemo } from 'react';
import { fetchComplaints, updateComplaint } from '../api';
import ComplaintCard from '../components/ComplaintCard';
import { AuthContext } from '../AuthContext';
import { Briefcase, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';

const DepartmentPortal = () => {
  const [complaints, setComplaints] = useState([]);
  const { user } = useContext(AuthContext);

  const loadData = async () => {
    if (!user || user.role !== 'department') return;
    try {
      const { data } = await fetchComplaints({ department: user.department });
      setComplaints(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleStatusChange = async (id, status) => {
    await updateComplaint(id, { status });
    loadData(); 
  };

  const aiInsights = useMemo(() => {
    if (complaints.length === 0) return null;
    
    const categoryCounts = {};
    const locationCounts = {};
    let highPriCount = 0;
    
    complaints.forEach(c => {
      categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
      
      const rootLoc = c.location.toLowerCase();
      locationCounts[rootLoc] = (locationCounts[rootLoc] || 0) + 1;
      
      if (c.priority === 'High') highPriCount++;
    });

    const topCategory = Object.keys(categoryCounts).reduce((a, b) => categoryCounts[a] > categoryCounts[b] ? a : b);
    const topLocationRaw = Object.keys(locationCounts).reduce((a, b) => locationCounts[a] > locationCounts[b] ? a : b);
    
    const topLocation = topLocationRaw.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    
    return [
      {
        icon: <TrendingUp className="w-5 h-5 text-indigo-500" />,
        text: `Majority of incoming complaints are related to ${topCategory} (${categoryCounts[topCategory]} reports).`
      },
      {
        icon: <Briefcase className="w-5 h-5 text-blue-500" />,
        text: `The most affected area currently is ${topLocation} with ${locationCounts[topLocationRaw]} active issues.`
      },
      {
         icon: <AlertTriangle className={`w-5 h-5 ${highPriCount > 0 ? 'text-red-500' : 'text-green-500'}`} />,
         text: highPriCount > 0 ? `Attention: ${highPriCount} High Priority emergencies require immediate intervention.` : 'No critical High Priority clusters detected.'
      }
    ];
  }, [complaints]);

  if (!user || user.role !== 'department') {
    return <div className="p-8 text-center text-gray-500">Access Denied: You must be a logged in Department User.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-indigo-600 rounded-2xl shadow-lg p-6 sm:px-10 flex flex-col sm:flex-row justify-between items-center text-white">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">{user.department} Dashboard</h1>
          <p className="text-indigo-200 text-sm">Reviewing tasks auto-assigned to your team.</p>
        </div>
        
        <div className="mt-4 sm:mt-0 relative flex items-center bg-white/10 rounded-lg py-2 px-4 shadow-inner">
          <Briefcase className="w-5 h-5 mr-2 opacity-70" />
          <span className="font-medium">{user.name}</span>
        </div>
      </div>

      {aiInsights && (
        <div className="bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>
          <div className="p-5 md:p-6 pl-8">
            <h2 className="text-lg font-bold text-gray-900 flex items-center mb-4">
              <Sparkles className="w-5 h-5 mr-2 text-indigo-600" />
              Samaadhan AI Insights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {aiInsights.map((insight, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-100 flex items-start">
                  <div className="mt-0.5 mr-3 flex-shrink-0">
                    {insight.icon}
                  </div>
                  <p className="text-sm font-medium text-gray-700 leading-snug">
                    {insight.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {complaints.length > 0 ? (
          complaints.map(c => (
            <ComplaintCard
              key={c.id}
              complaint={c}
              onStatusChange={handleStatusChange}
              isDepartmentView={true}
            />
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-white rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-1">Inbox Zero</h3>
            <p className="text-gray-500">No active complaints found for your department.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentPortal;
