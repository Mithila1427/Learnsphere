import { useState, useEffect } from 'react';
import { Home, MessageSquare, Settings, LogOut, CheckCircle, XCircle, Clock } from 'lucide-react';

interface TeacherDashboardProps {
  onLogout: () => void;
}

interface Submission {
  id: string;
  studentName: string;
  subject: string;
  content: string;
  timestamp: string;
  status: 'pending' | 'verified' | 'rejected';
}

export function TeacherDashboard({ onLogout }: TeacherDashboardProps) {

  const [activeView, setActiveView] = useState<'dashboard' | 'recent-chats' | 'settings'>('dashboard');

  const name = localStorage.getItem("name") || "";
  const email = localStorage.getItem("email") || "";

  const [submissions, setSubmissions] = useState<Submission[]>([]);
const [editingId, setEditingId] = useState<string | null>(null);
const [editedAnswer, setEditedAnswer] = useState("");
  const [rejectComment, setRejectComment] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  // FETCH DOUBTS FROM BACKEND
  useEffect(() => {

    const fetchSubmissions = () => {

      fetch("http://127.0.0.1:8001/pending_doubts")
        .then(res => res.json())
        .then(data => setSubmissions(data))
        .catch(err => console.error(err))

    }

    fetchSubmissions()

    const interval = setInterval(fetchSubmissions, 5000)

    return () => clearInterval(interval)

  }, [])

  // VERIFY OR REJECT
  const handleVerify = async (id: string, status: 'verified' | 'rejected') => {

    if (status === "verified") {

      await fetch(`http://127.0.0.1:8001/accept_answer/${id}`, {
        method: "POST"
      })

    } else {

      await fetch(`http://127.0.0.1:8001/discard/${id}`, {
        method: "POST"
      })

    }

    setSubmissions(submissions.map(sub =>
      sub.id === id ? { ...sub, status } : sub
    ))

  }

  // EDIT ANSWER
  const saveEditedAnswer = async (id: string) => {

  await fetch("http://127.0.0.1:8001/edit_answer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      id: id,
      new_answer: editedAnswer
    })
  })

  setSubmissions(submissions.map(sub =>
    sub.id === id ? { ...sub, content: editedAnswer } : sub
  ))

  setEditingId(null)
}

  const renderMainContent = () => {

    switch (activeView) {

      case "settings":

        return (

          <div>

            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <h2 className="text-2xl mb-2">Settings</h2>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">

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

            </div>

          </div>

        )

      default:

        return (

          <div>

            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">

              <h2 className="text-2xl mb-2">Welcome back, {name}!</h2>

              <p className="text-gray-600 text-sm">
                {submissions.filter(s => s.status === 'pending').length} pending submissions
              </p>

            </div>


            {/* STATS */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

              <div className="bg-blue-500 text-white rounded-2xl p-6">

                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm">Pending</h3>
                  <Clock className="w-6 h-6" />
                </div>

                <p className="text-3xl">
                  {submissions.filter(s => s.status === 'pending').length}
                </p>

              </div>

              <div className="bg-green-500 text-white rounded-2xl p-6">

                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm">Verified</h3>
                  <CheckCircle className="w-6 h-6" />
                </div>

                <p className="text-3xl">
                  {submissions.filter(s => s.status === 'verified').length}
                </p>

              </div>

            </div>


            {/* STUDENT DOUBTS */}

            <div className="bg-white rounded-2xl shadow-sm p-6">

              <h3 className="text-xl mb-4">Student Doubts</h3>

              <div className="space-y-4">

                {submissions.map((submission) => (

                  <div
                    key={submission.id}
                    className="border-2 border-blue-200 bg-blue-50 rounded-xl p-5"
                  >

                    <h4 className="text-lg mb-2">{submission.studentName}</h4>

                    <p className="text-sm mb-2">{submission.subject}</p>

                    {editingId === submission.id ? (

  <div className="mb-3">
    <textarea
      value={editedAnswer}
      onChange={(e) => setEditedAnswer(e.target.value)}
      className="w-full border p-2 rounded-lg"
    />

    <button
      onClick={() => saveEditedAnswer(submission.id)}
      className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
    >
      Save
    </button>
  </div>

) : (

  <p className="text-gray-600 text-sm mb-3">
    AI Answer: {submission.content}
  </p>

)}

                    <p className="text-gray-400 text-xs mb-3">{submission.timestamp}</p>


                    {submission.status === "pending" && (

                      <div className="flex flex-wrap items-center gap-3">

                        <button
                          onClick={() => handleVerify(submission.id, 'verified')}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Verify
                        </button>


                        <button
  onClick={() => {
    setEditingId(submission.id)
    setEditedAnswer(submission.content)
  }}
  className="px-4 py-2 bg-yellow-500 text-white rounded-lg"
>
  Edit
</button>


                        <button
  onClick={() => setRejectingId(submission.id)}
  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg"
>
  <XCircle className="w-4 h-4" />
  Reject
</button>
{rejectingId === submission.id && (

<div className="mt-3">

<textarea
placeholder="Enter reason for rejection..."
value={rejectComment}
onChange={(e)=>setRejectComment(e.target.value)}
className="w-full border p-2 rounded-lg"
/>

<button


onClick={async () => {

await fetch("http://127.0.0.1:8001/reject",{
method:"POST",
headers:{ "Content-Type":"application/json"},
body: JSON.stringify({
id: submission.id,
comment: rejectComment
})
})

setSubmissions(submissions.map(sub =>
  sub.id === submission.id
    ? { ...sub, status: "rejected" }
    : sub
))

setRejectingId(null)
setRejectComment("")

}}


className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg"
>

Submit Reject

</button>

</div>

)}

                      </div>

                    )}

                  </div>

                ))}

              </div>

            </div>

          </div>

        )

    }

  }

  return (

    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-200 to-purple-300">

      <div className="max-w-7xl mx-auto p-6">

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden">

          <div className="flex flex-col lg:flex-row h-[calc(100vh-3rem)]">


            {/* SIDEBAR */}

            {/* SIDEBAR */}

<div className="lg:w-80 bg-white p-6 border-r border-gray-100 flex flex-col justify-between">

  <div>

    {/* Logo */}
    <div className="flex items-center gap-3 mb-8">
      <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold">
        LS
      </div>
      <span className="text-xl font-semibold">LearnSphere</span>
    </div>

    {/* Profile */}
    <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-3 mb-8">
      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm">
        {name.charAt(0)}
      </div>
      <span className="text-sm">Hi, {name}!</span>
    </div>

    {/* Navigation */}
    <nav className="space-y-3">

      <button
  onClick={() => setActiveView("dashboard")}
  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition 
  ${activeView === "dashboard"
    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
    : "hover:bg-gray-100 text-gray-700"
  }`}
>
  <Home className="w-5 h-5"/>
  Dashboard
</button>

      <button
  onClick={() => setActiveView("settings")}
  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition 
  ${activeView === "settings"
    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
    : "hover:bg-gray-100 text-gray-700"
  }`}

      >
        <Settings className="w-5 h-5"/>
        Settings
      </button>

    </nav>

  </div>

  {/* Logout Button */}

  <button
    onClick={onLogout}
    className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600"
  >
    <LogOut className="w-5 h-5"/>
    Logout
  </button>

</div>

            {/* MAIN */}

            <div className="flex-1 p-6 lg:p-8 overflow-y-auto">

              {renderMainContent()}

            </div>

          </div>

        </div>

      </div>

    </div>

  )

}