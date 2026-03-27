import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchDashboard, fetchComplaints } from '../api';
import L from 'leaflet';

// Fix leaflet marker icon issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    fetchDashboard().then(res => setStats(res.data));
    fetchComplaints().then(res => setComplaints(res.data));
  }, []);

  if (!stats) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;

  const chartData = Object.keys(stats.byDepartment).map(key => ({
    name: key.replace('Department', '').trim(),
    complaints: stats.byDepartment[key]
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Live Civic Intelligence</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-xl font-medium text-gray-500 mb-1">Total Issues</div>
          <div className="text-4xl font-bold text-indigo-600">{stats.total}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-xl font-medium text-gray-500 mb-1">Resolved</div>
          <div className="text-4xl font-bold text-green-500">{stats.resolved}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-xl font-medium text-gray-500 mb-1">Pending</div>
          <div className="text-4xl font-bold text-red-500">{stats.pending}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-xl font-medium text-gray-500 mb-1">In Progress</div>
          <div className="text-4xl font-bold text-blue-500">{stats.inProgress}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-96">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Department Distribution</h2>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Bar dataKey="complaints" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Map */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-96 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Location Clusters</h2>
          <div className="flex-1 rounded-lg overflow-hidden border">
            {/* For demo, hardcoding a center, normally we'd compute from complaints or use user location */}
            <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              {/* Simulate placing markers based on string hash for deterministic demo coords */}
              {complaints.map(c => {
                const lat = 51.505 + (c.text.length % 10) * 0.002;
                const lon = -0.09 + (c.location.length % 10) * 0.002;
                return (
                  <Marker key={c.id} position={[lat, lon]}>
                    <Popup>
                      <div className="font-semibold">{c.category}</div>
                      <div>{c.location}</div>
                      <div className="text-xs text-gray-500">{c.status} - Priority: {c.priority}</div>
                    </Popup>
                  </Marker>
                )
              })}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
