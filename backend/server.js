const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory Database
let complaints = [
  {
    id: '1',
    name: 'Citizen One',
    citizenEmail: 'citizen1@pscrm.com',
    location: 'Downtown Main St',
    text: 'A large pothole on Main St is causing damage to cars.',
    category: 'Roads',
    department: 'Roads Department',
    status: 'Pending',
    priority: 'Low',
    similarCount: 1,
    clusterId: 'c1',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Citizen Two',
    citizenEmail: 'citizen2@pscrm.com',
    location: 'Westside Avenue',
    text: 'Streetlights have been out for a week.',
    category: 'Electricity',
    department: 'Electricity Department',
    status: 'In Progress',
    priority: 'Medium',
    similarCount: 3,
    clusterId: 'c2',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

let clusters = {
  'c1': ['1'],
  'c2': ['2', 'mock3', 'mock4'] // Mocking that 3 people complained
};

// Auto Department Assignment Mapping
const DEPT_MAPPING = {
  'Water': 'Water Department',
  'Electricity': 'Electricity Department',
  'Roads': 'Roads Department',
  'Sanitation': 'Sanitation Department',
  'Others': 'General Department'
};

// In-memory Auth Database
let users = [
  { id: 'u1', name: 'System Admin', email: 'admin@pscrm.com', password: 'admin123', role: 'admin' },
  { id: 'u2', name: 'Water Dept User', email: 'water@pscrm.com', password: 'dept123', role: 'department', department: 'Water Department' },
  { id: 'u3', name: 'Electricity Dept User', email: 'electricity@pscrm.com', password: 'dept123', role: 'department', department: 'Electricity Department' },
  { id: 'u4', name: 'Roads Dept User', email: 'roads@pscrm.com', password: 'dept123', role: 'department', department: 'Roads Department' },
  { id: 'u5', name: 'Sanitation Dept User', email: 'sanitation@pscrm.com', password: 'dept123', role: 'department', department: 'Sanitation Department' },
  { id: 'u6', name: 'Citizen One', email: 'citizen1@pscrm.com', password: 'user123', role: 'citizen' },
  { id: 'u7', name: 'Citizen Two', email: 'citizen2@pscrm.com', password: 'user123', role: 'citizen' },
  { id: 'u8', name: 'Citizen Three', email: 'citizen3@pscrm.com', password: 'user123', role: 'citizen' }
];

// Simple clustering logic: checking keywords and location
function findCluster(text, location) {
  const words = text.toLowerCase().split(' ').filter(w => w.length > 4);
  
  for (const c of complaints) {
    // Very simple check: if location matches exactly or 2 significant keywords match
    const cWords = c.text.toLowerCase().split(' ');
    const commonWords = words.filter(w => cWords.includes(w));
    
    if (c.location.toLowerCase() === location.toLowerCase() || commonWords.length >= 2) {
      return c.clusterId;
    }
  }
  return `cluster-${Date.now()}`;
}

// Recalculate Priority for a cluster
function recalculatePriority(clusterId) {
  const count = clusters[clusterId].length;
  let priority = 'Low';
  if (count >= 6) priority = 'High';
  else if (count >= 3) priority = 'Medium';
  
  // Update all complaints in cluster
  complaints.forEach(c => {
    if (c.clusterId === clusterId) {
      c.similarCount = count;
      c.priority = priority;
    }
  });
}

// Endpoints

// GET Dashboard Stats
app.get('/api/dashboard', (req, res) => {
  const total = complaints.length;
  const resolved = complaints.filter(c => c.status === 'Completed').length;
  const pending = complaints.filter(c => c.status === 'Pending').length;
  const inProgress = complaints.filter(c => c.status === 'In Progress').length;
  
  const byDepartment = complaints.reduce((acc, c) => {
    acc[c.department] = (acc[c.department] || 0) + 1;
    return acc;
  }, {});

  res.json({ total, resolved, pending, inProgress, byDepartment });
});

// GET Complaints
app.get('/api/complaints', (req, res) => {
  const { department, status, location, citizenEmail } = req.query;
  let filtered = complaints;

  if (department) filtered = filtered.filter(c => c.department === department);
  if (status) filtered = filtered.filter(c => c.status === status);
  if (location) filtered = filtered.filter(c => c.location.toLowerCase().includes(location.toLowerCase()));
  if (citizenEmail) filtered = filtered.filter(c => c.citizenEmail === citizenEmail);

  // Sort by priority (High -> Medium -> Low)
  const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
  filtered.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority] || new Date(b.createdAt) - new Date(a.createdAt));

  res.json(filtered);
});

// POST Complaint
app.post('/api/complaints', (req, res) => {
  const { name, location, text, category, image, answers, citizenEmail } = req.body;
  
  const mappedCategory = category || 'Others';
  const department = DEPT_MAPPING[mappedCategory] || 'General Department';
  
  const clusterId = findCluster(text, location);
  
  const newComplaint = {
    id: Date.now().toString(),
    name,
    citizenEmail: citizenEmail || null,
    location,
    text,
    category: mappedCategory,
    department,
    status: 'Pending',
    clusterId,
    image: image || null,
    answers: answers || [],
    createdAt: new Date().toISOString()
  };

  if (!clusters[clusterId]) clusters[clusterId] = [];
  clusters[clusterId].push(newComplaint.id);

  complaints.push(newComplaint);
  recalculatePriority(clusterId);

  res.status(201).json(newComplaint);
});

// PUT Complaint (Status Update & Reassign)
app.put('/api/complaints/:id', (req, res) => {
  const { id } = req.params;
  const { status, department } = req.body;
  
  const cIndex = complaints.findIndex(c => c.id === id);
  if (cIndex === -1) return res.status(404).json({ message: "Not found" });

  if (status) complaints[cIndex].status = status;
  if (department) complaints[cIndex].department = department;

  res.json(complaints[cIndex]);
});

// Cluster details endpoint
app.get('/api/clusters/:clusterId', (req, res) => {
  const { clusterId } = req.params;
  const grouped = complaints.filter(c => c.clusterId === clusterId);
  res.json(grouped);
});

// Departments Endpoint
let departmentsList = Object.values(DEPT_MAPPING);
app.get('/api/departments', (req, res) => {
  res.json(departmentsList);
});

app.post('/api/departments', (req, res) => {
  const { name } = req.body;
  if (name && !departmentsList.includes(name)) departmentsList.push(name);
  res.status(201).json({ name });
});

app.delete('/api/departments/:name', (req, res) => {
  const { name } = req.params;
  const decodeName = decodeURIComponent(name);
  departmentsList = departmentsList.filter(d => d !== decodeName);
  res.json({ message: 'Deleted', name: decodeName });
});

// AUTH & USERS endpoints
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.get('/api/users', (req, res) => {
  res.json(users.map(({ password, ...u }) => u));
});

app.post('/api/users', (req, res) => {
  const { name, email, password, role, department } = req.body;
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ message: 'Email already exists' });
  }
  const newUser = {
    id: `u${Date.now()}`,
    name,
    email,
    password: password || (role === 'citizen' ? 'user123' : 'dept123'),
    role,
    department: department || null
  };
  users.push(newUser);
  const { password: _, ...safeUser } = newUser;
  res.status(201).json(safeUser);
});

app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex === -1) return res.status(404).json({ message: 'User not found' });
  if (users[userIndex].role !== 'citizen') return res.status(403).json({ message: 'Cannot delete admin or department' });
  users.splice(userIndex, 1);
  res.json({ message: 'User deleted' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
