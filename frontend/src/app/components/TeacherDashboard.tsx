import { useState } from 'react';

import { Home, MessageSquare, Settings, LogOut, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';


interface TeacherDashboardProps {
  onLogout: () => void;
}

interface Submission {
  id: string;
  studentName: string;
  subject: string;
  content: string;
  files: string[];
  timestamp: string;
  status: 'pending' | 'verified' | 'rejected';
}

interface Chat {
  id: string;
  studentName: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

export function TeacherDashboard({ onLogout }: TeacherDashboardProps) {
  const [activeView, setActiveView] = useState<'dashboard' | 'recent-chats' | 'settings'>('dashboard');
    // ✅ Logged-in teacher info (from login)
  const name = localStorage.getItem("name") || "";
  const email = localStorage.getItem("email") || "";
  const role = localStorage.getItem("role") || "teacher";

  const [submissions, setSubmissions] = useState<Submission[]>
  ([
    {
      id: '1',
      studentName: 'John Smith',
      subject: 'Calculus - Derivative Problem',
      content: 'Can you verify my solution for finding the derivative of f(x) = x^3 + 2x^2 - 5x + 1?',
      files: ['solution.pdf', 'graph.png'],
      timestamp: '10 minutes ago',
      status: 'pending'
    },
    {
      id: '2',
      studentName: 'Sarah Johnson',
      subject: 'Physics - Newton\'s Laws',
      content: 'Please review my homework on Newton\'s third law application.',
      files: ['homework.pdf'],
      timestamp: '1 hour ago',
      status: 'pending'
    },
    {
      id: '3',
      studentName: 'Mike Davis',
      subject: 'English Essay Review',
      content: 'Could you verify my essay on Shakespeare\'s Hamlet?',
      files: ['essay.docx'],
      timestamp: '3 hours ago',
      status: 'verified'
    }
  ]);

  const [recentChats] = useState<Chat[]>([
    { id: '1', studentName: 'Emma Wilson', lastMessage: 'Thank you for the help!', timestamp: '5 min ago', unread: true },
    { id: '2', studentName: 'Alex Brown', lastMessage: 'Can we discuss question 5?', timestamp: '1 hour ago', unread: true },
    { id: '3', studentName: 'Lisa Chen', lastMessage: 'Got it, thanks!', timestamp: '2 hours ago', unread: false },
  ]);

  const handleVerify = (id: string, status: 'verified' | 'rejected') => {
    setSubmissions(submissions.map(sub => 
      sub.id === id ? { ...sub, status } : sub
    ));
  };

  const renderMainContent = () => {
    switch (activeView) {
      case 'recent-chats':
        return (
          <div>
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <h2 className="text-2xl mb-2">Recent Chats</h2>
              <p className="text-gray-600 text-sm">Messages from your students</p>
            </div>

            <div className="space-y-4">
              {recentChats.map((chat) => (
                <div
                  key={chat.id}
                  className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg">{chat.studentName}</h3>
                        {chat.unread && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{chat.lastMessage}</p>
                      <p className="text-gray-400 text-xs">{chat.timestamp}</p>
                    </div>
                    <MessageSquare className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'settings':
        return (
          <div>
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <h2 className="text-2xl mb-2">Settings</h2>
              <p className="text-gray-600 text-sm">Manage your account preferences</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
              <div>
                <h3 className="text-lg mb-4">Account Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Name</label>
                    <input
                      type="text"
                      value={name}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Email</label>
                    <input
                      type="email"
                      value={email}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Subject</label>
                    <input
                      type="text"
                      value="Mathematics & Physics"
                      readOnly
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg mb-4">Notifications</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-gray-700">New submission alerts</span>
                    <input type="checkbox" className="w-5 h-5 text-purple-600" defaultChecked />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-gray-700">Student messages</span>
                    <input type="checkbox" className="w-5 h-5 text-purple-600" defaultChecked />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-gray-700">Daily summary</span>
                    <input type="checkbox" className="w-5 h-5 text-purple-600" />
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div>
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <h2 className="text-2xl mb-2">Welcome back, {name}!</h2>
              <p className="text-gray-600 text-sm">You have {submissions.filter(s => s.status === 'pending').length} pending submissions to review</p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm opacity-90">Pending</h3>
                  <Clock className="w-6 h-6 opacity-80" />
                </div>
                <p className="text-3xl">{submissions.filter(s => s.status === 'pending').length}</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm opacity-90">Verified</h3>
                  <CheckCircle className="w-6 h-6 opacity-80" />
                </div>
                <p className="text-3xl">{submissions.filter(s => s.status === 'verified').length}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm opacity-90">Unread Messages</h3>
                  <MessageSquare className="w-6 h-6 opacity-80" />
                </div>
                <p className="text-3xl">{recentChats.filter(c => c.unread).length}</p>
              </div>
            </div>

            {/* Student Submissions */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <h3 className="text-xl mb-4">Student Submissions</h3>
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className={`border-2 rounded-xl p-5 transition-all ${
                      submission.status === 'pending'
                        ? 'border-blue-200 bg-blue-50/50'
                        : submission.status === 'verified'
                        ? 'border-green-200 bg-green-50/50'
                        : 'border-red-200 bg-red-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg">{submission.studentName}</h4>
                          <span
                            className={`px-3 py-1 rounded-full text-xs ${
                              submission.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : submission.status === 'verified'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm mb-2">{submission.subject}</p>
                        <p className="text-gray-600 text-sm mb-3">{submission.content}</p>
                        
                        {/* Files */}
                        {submission.files.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {submission.files.map((file, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200"
                              >
                                <FileText className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-700">{file}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <p className="text-gray-400 text-xs">{submission.timestamp}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {submission.status === 'pending' && (
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => handleVerify(submission.id, 'verified')}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Verify</span>
                        </button>
                        <button
                          onClick={() => handleVerify(submission.id, 'rejected')}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-200 to-purple-300">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row h-[calc(100vh-3rem)]">
            {/* Sidebar */}
            <div className="lg:w-80 bg-white p-6 border-r border-gray-100">
              {/* Logo */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">LS</span>
                </div>
                <span className="text-2xl">LearnSphere</span>
              </div>

              {/* User Info */}
              <div className="flex items-center gap-3 mb-8 p-3 bg-purple-50 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">DW</span>
                </div>
                <div>
                  <p className="text-gray-700">{name}</p>
                  <p className="text-xs text-gray-500">Teacher</p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveView('dashboard')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeView === 'dashboard'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Home className="w-5 h-5" />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => setActiveView('recent-chats')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeView === 'recent-chats'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Recent Chats</span>
                </button>

                <button
                  onClick={() => setActiveView('settings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeView === 'settings'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </button>
              </nav>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all mt-8"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
              {renderMainContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
