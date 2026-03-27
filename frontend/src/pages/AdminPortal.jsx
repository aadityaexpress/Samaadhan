import React, { useEffect, useState } from 'react';
import { fetchComplaints, updateComplaint, fetchDepartments, fetchUsers, createDepartment, deleteDepartment, deleteUser } from '../api';
import ComplaintCard from '../components/ComplaintCard';
import { Search, Filter, Users, ClipboardList, PlusCircle, AlertCircle, CheckCircle, Trash2, Building } from 'lucide-react';

const AdminPortal = () => {
  const [activeTab, setActiveTab] = useState('complaints'); // complaints | users
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Filters
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Department Management Form
  const [newDeptName, setNewDeptName] = useState('');
  const [deptFormStatus, setDeptFormStatus] = useState('');
  const [deptFormError, setDeptFormError] = useState('');

  const loadData = async () => {
    try {
      if (activeTab === 'complaints') {
        const [cRes, dRes] = await Promise.all([
          fetchComplaints({ department: departmentFilter, status: statusFilter }),
          fetchDepartments()
        ]);
        setComplaints(cRes.data);
        setDepartments(dRes.data);
      } else {
        const [uRes, dRes] = await Promise.all([
          fetchUsers(),
          fetchDepartments()
        ]);
        setUsers(uRes.data);
        setDepartments(dRes.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [departmentFilter, statusFilter, activeTab]);

  const handleStatusChange = async (id, status) => {
    await updateComplaint(id, { status });
    loadData();
  };

  const handleDepartmentChange = async (id, department) => {
    await updateComplaint(id, { department });
    loadData();
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this citizen?")) return;
    try {
      await deleteUser(id);
      loadData();
    } catch (err) {
      console.error("Failed to delete user", err);
    }
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    setDeptFormError('');
    setDeptFormStatus('');
    try {
      await createDepartment(newDeptName);
      setDeptFormStatus('Department added successfully.');
      setNewDeptName('');
      loadData();
      setTimeout(() => setDeptFormStatus(''), 3000);
    } catch(err) {
      setDeptFormError('Failed to add department');
    }
  };

  const handleDeleteDepartment = async (name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    try {
      await deleteDepartment(name);
      loadData();
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 mb-4 pb-4 border-b border-gray-200">
         <button onClick={() => setActiveTab('complaints')} className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'complaints' ? 'bg-indigo-600 text-white shadow' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
            <ClipboardList className="w-5 h-5 mr-2" />
            Manage Complaints
         </button>
         <button onClick={() => setActiveTab('users')} className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
            <Users className="w-5 h-5 mr-2" />
            Users Overview
         </button>
      </div>

      {activeTab === 'complaints' && (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Global Administration</h1>
            
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <Filter className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm outline-none appearance-none"
                >
                  <option value="">All Departments</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm outline-none appearance-none"
                >
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complaints.length > 0 ? (
              complaints.map(c => (
                <ComplaintCard
                  key={c.id}
                  complaint={c}
                  departments={departments}
                  onStatusChange={handleStatusChange}
                  onDepartmentChange={handleDepartmentChange}
                  isDepartmentView={false}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                No complaints match the current filters.
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">System Users</h2>
              <p className="text-gray-500 text-sm mt-1">Full list of all citizens and department managers.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold">Name</th>
                    <th className="p-4 font-semibold">Email</th>
                    <th className="p-4 font-semibold">Role</th>
                    <th className="p-4 font-semibold">Department</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-900">{u.name}</td>
                      <td className="p-4 text-gray-500">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wider ${u.role === 'admin' ? 'bg-red-100 text-red-700' : u.role === 'department' ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 flex items-center justify-between">
                         <span className="text-gray-500">{u.department || '—'}</span>
                         {u.role === 'citizen' && (
                           <button onClick={() => handleDeleteUser(u.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition ml-2" title="Delete Citizen">
                             <Trash2 className="w-4 h-4" />
                           </button>
                         )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-fit relative">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <Building className="w-5 h-5 mr-2 text-indigo-600" />
                Manage Departments
              </h2>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleCreateDepartment} className="space-y-4 mb-6">
                
                {deptFormError && (
                  <div className="bg-red-50 text-red-700 p-3 rounded flex items-start text-sm border border-red-200">
                    <AlertCircle className="w-4 h-4 mr-2 mt-0.5" />
                    {deptFormError}
                  </div>
                )}
                {deptFormStatus && (
                  <div className="bg-green-50 text-green-700 p-3 rounded flex items-start text-sm border border-green-200">
                    <CheckCircle className="w-4 h-4 mr-2 mt-0.5" />
                    {deptFormStatus}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Department Name</label>
                  <input required type="text" value={newDeptName} onChange={e => setNewDeptName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm" placeholder="e.g. Parks & Recreation" />
                </div>
                
                <button type="submit" className="w-full bg-indigo-600 text-white font-medium py-2 rounded shadow hover:bg-indigo-700 transition mt-2 text-sm flex justify-center items-center">
                  <PlusCircle className="w-4 h-4 mr-2" /> Add Department
                </button>
              </form>

              <div className="border-t border-gray-100 pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Current Departments</h3>
                <ul className="space-y-2">
                  {departments.map((d, i) => (
                    <li key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100 text-sm">
                      <span className="text-gray-800 font-medium">{d}</span>
                      <button onClick={() => handleDeleteDepartment(d)} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPortal;
