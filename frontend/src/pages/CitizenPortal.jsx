import React, { useState, useEffect, useContext } from 'react';
import { submitComplaint, fetchComplaints } from '../api';
import { AuthContext } from '../AuthContext';
import ComplaintCard from '../components/ComplaintCard';
import { CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react';

const QUESTION_MAPPING = {
  'Water': [
    "How many days has water not been available?",
    "Is the issue affecting the entire area or your house only?"
  ],
  'Electricity': [
    "Is this a complete power outage or fluctuation?",
    "Since when is this issue happening?"
  ],
  'Roads': [
    "Is it a pothole or complete road damage?",
    "Is it causing traffic or safety issues?"
  ],
  'Sanitation': [
    "Is garbage piled up on the street?",
    "How long has it been uncleared?"
  ],
  'Others': [
    "Can you provide more specific details?",
    "Is this an emergency?"
  ]
};

const DEPT_MAPPING = {
  'Water': 'Water Department',
  'Electricity': 'Electricity Department',
  'Roads': 'Roads Department',
  'Sanitation': 'Sanitation Department',
  'Others': 'General Department'
};

const KEYWORDS = {
  'Water': ['water', 'leak', 'pipe', 'pipeline', 'drain'],
  'Electricity': ['power', 'electricity', 'light', 'outage', 'wire', 'voltage'],
  'Roads': ['road', 'pothole', 'street', 'damage', 'pave', 'accident'],
  'Sanitation': ['garbage', 'trash', 'sanitation', 'smell', 'waste', 'dump', 'dustbin']
};

const detectCategory = (text) => {
  const lowerText = text.toLowerCase();
  for (const [cat, words] of Object.entries(KEYWORDS)) {
    if (words.some(w => lowerText.includes(w))) {
      return cat;
    }
  }
  return 'Others';
};

const CitizenPortal = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('new'); // 'new' | 'history'
  const [myComplaints, setMyComplaints] = useState([]);

  const [formData, setFormData] = useState({
    location: '',
    text: '',
    category: '',
    department: '',
    image: null
  });

  const [answers, setAnswers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [status, setStatus] = useState('idle'); 
  const [submittedData, setSubmittedData] = useState(null);

  const loadHistory = async () => {
    try {
      const { data } = await fetchComplaints({ citizenEmail: user.email });
      setMyComplaints(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const clearForm = () => {
    setFormData({ location: '', text: '', category: '', department: '', image: null });
    setAnswers([]);
    setQuestions([]);
    setStatus('idle');
    setSubmittedData(null);
  };

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    setStatus('analyzing');
    
    setTimeout(() => {
      const detectedCat = detectCategory(formData.text);
      const detectedDept = DEPT_MAPPING[detectedCat];
      const categoryQuestions = QUESTION_MAPPING[detectedCat];
      
      setFormData(prev => ({ ...prev, category: detectedCat, department: detectedDept }));
      setQuestions(categoryQuestions);
      setAnswers(categoryQuestions.map(q => ({ q, a: '' })));
      setStatus('questions');
    }, 1500);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      const payload = {
        ...formData,
        answers,
        name: user.name,
        citizenEmail: user.email
      };
      const { data } = await submitComplaint(payload);
      setSubmittedData(data);
      setStatus('success');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex bg-white rounded-lg p-1 border shadow-sm w-fit mx-auto lg:mx-0">
        <button
          onClick={() => { setActiveTab('new'); clearForm(); }}
          className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'new' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Submit New Complaint
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'history' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
        >
          My Complaints
        </button>
      </div>

      {activeTab === 'new' && (
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Report a Civic Issue</h1>
            <p className="text-gray-500">Your complaint helps us build a better community. Our AI assists in determining the right department.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8">
            {status === 'success' && submittedData && (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Complaint Submitted!</h2>
                <p className="text-gray-600 mb-6">Thank you. We have automatically routed this to the <span className="font-semibold">{submittedData.department}</span>.</p>
                
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-left border mb-6 inline-block">
                  <p><strong>Tracking ID:</strong> #{submittedData.id}</p>
                  <p><strong>Category:</strong> {submittedData.category}</p>
                  <p><strong>Current Status:</strong> <span className="text-indigo-600 font-medium">Pending Review</span></p>
                </div>

                <div>
                  <button
                    onClick={clearForm}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                  >
                    Report Another Issue
                  </button>
                </div>
              </div>
            )}

            {status === 'analyzing' && (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-6"></div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Analyzing complaint...</h3>
                <p className="text-gray-500">Detecting category and routing to the correct department based on keywords.</p>
              </div>
            )}

            {(status === 'questions' || status === 'submitting' || (status === 'error' && questions.length > 0)) && (
              <form onSubmit={handleFinalSubmit} className="space-y-6">
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-5 mb-6">
                  <h3 className="font-semibold text-indigo-900 mb-1">Issue Routed Automatically</h3>
                  <p className="text-indigo-700 text-sm">Based on your description, we categorized this as <span className="font-bold">{formData.category}</span> and will route it to the <span className="font-bold">{formData.department}</span>.</p>
                  <p className="text-indigo-700 text-sm mt-3 font-medium">To help them resolve this faster, please answer these quick questions we've generated:</p>
                </div>

                {status === 'error' && (
                  <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center mb-6 border border-red-200">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Failed to submit. Please try again.
                  </div>
                )}

                <div className="space-y-6">
                  {questions.map((q, idx) => (
                    <div key={idx}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{q}</label>
                      <input
                        required
                        type="text"
                        value={answers[idx].a}
                        onChange={(e) => {
                          const newAnswers = [...answers];
                          newAnswers[idx].a = e.target.value;
                          setAnswers(newAnswers);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        placeholder="Your answer..."
                      />
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-4 pt-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="flex-1 bg-gray-100 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="flex-[2] bg-indigo-600 text-white font-medium py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {status === 'submitting' ? 'Submitting...' : 'Final Submit'}
                  </button>
                </div>
              </form>
            )}

            {(status === 'idle' || (status === 'error' && !questions.length)) && (
              <form onSubmit={handleInitialSubmit} className="space-y-6">
                
                {status === 'error' && (
                  <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center mb-6 border border-red-200">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Failed to process. Please try again.
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specific Location</label>
                  <input
                    required
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="E.g., 10th Cross, Main St"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue Description</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.text}
                    onChange={(e) => setFormData({...formData, text: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                    placeholder="Describe the issue in detail..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Photo (Optional)</label>
                  <div className="mt-1 flex items-center">
                    <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none flex items-center">
                      <ImageIcon className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{formData.image ? 'Change Image' : 'Select Image'}</span>
                      <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleImageChange} />
                    </label>
                    {formData.image && <span className="ml-3 text-sm text-green-600 font-medium">Image attached</span>}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white font-medium py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Next Step</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Complaints</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myComplaints.length > 0 ? (
              myComplaints.map(c => (
                <ComplaintCard
                  key={c.id}
                  complaint={c}
                  isDepartmentView={true} // Reusing this prop to hide the department reassignment dropdown
                />
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                You haven't submitted any complaints yet.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default CitizenPortal;
