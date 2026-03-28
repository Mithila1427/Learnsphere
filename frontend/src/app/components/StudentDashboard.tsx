// StudentDashboard.tsx
import { useState, useEffect } from 'react';
import { Home, MessageSquare, Settings, LogOut, MessageCircle, Upload, Send, X, FileText, Image as ImageIcon, FileType } from 'lucide-react';
const NODE_BACKEND = "http://127.0.0.1:5001";
const AI_BACKEND = "http://127.0.0.1:8001";

interface StudentDashboardProps {
  onLogout: () => void;
}

interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  status?: "pending" | "verified" | "rejected";
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
  verified?: boolean;
}

interface UploadedFile {
  name: string;
  type: string;
  size: string;
  rawFile?: File; // ✅ ADD THIS
}


interface Submission {
  id: string;
  studentName: string;
  studentEmail: string;
  content: string;
  question: string;
  files: UploadedFile[];
  timestamp: string;
  status: 'pending' | 'verified' | 'rejected';
  teacherResponse?: string;
}
function UploadPage() {
  const [file, setFile] = useState<File | null>(null);

  // 👉 ADD THIS FUNCTION HERE (INSIDE COMPONENT)
  const uploadFile = async () => {
  console.log("UPLOAD CLICKED");

  if (!file) {
    alert("Select a file first");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://127.0.0.1:5001/api/upload", {
      method: "POST",
      body: formData,
    });

    console.log("STATUS CODE:", res.status);

    const text = await res.text(); // 🔥 IMPORTANT
    console.log("RAW RESPONSE:", text);

    setFile(null);
  } catch (err) {
    console.error("UPLOAD FAILED:", err);
  }
};


  return (
    <div>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button onClick={uploadFile}>Upload</button>
    </div>
  );
}

export default UploadPage;


export function StudentDashboard({ onLogout }: StudentDashboardProps) {
  const [activeView, setActiveView] = useState<'dashboard' | 'chat' | 'recent-chats' | 'settings'>('dashboard');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  // ✅ ADD THESE TWO LINES (THIS IS THE FIX)
  const name = localStorage.getItem("name") || "";
  const email = localStorage.getItem("email") || "";

const [recentChats, setRecentChats] = useState<Chat[]>(() => {
  const stored = localStorage.getItem("recentChats");
  return stored ? JSON.parse(stored) : [];
});
 
  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    const stored = localStorage.getItem('submissions');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {

  // 🔹 Check teacher verification from backend
  const checkStatus = async () => {

  try {

    const res = await fetch(`${AI_BACKEND}/check_status/${name}`);
let data = await res.json();

console.log("CHECK STATUS RESPONSE:", data);

// ✅ Ensure it is always an array
if (!Array.isArray(data)) {
  data = [data];
}

const chats = JSON.parse(localStorage.getItem("recentChats") || "[]");

const updated = chats.map((c:any) => {

  const found = data.find((d:any) =>
  d.question && c.title.toLowerCase().trim() === d.question.toLowerCase().trim()
);

  if(found){
  const newChat = { 
  ...c,
  status: found.status === "verified"
    ? "verified"
    : found.status === "rejected"
    ? "rejected"
    : c.status,
  lastMessage: found.answer || c.lastMessage
};

    // ✅ VERIFIED
    if(found.status === "verified"){
      setMessages(prev =>
  prev.map(m =>
    m.id === c.id + "-ai"
      ? { ...m, content: found.answer, verified: true }
      : m
  )
);
    }

    // ❌ REJECTED
    if(found.status === "rejected"){
      setMessages(prev =>
        prev.map(m =>
          m.id.includes("-pending")
            ? {
                ...m,
                content:`❌ Teacher rejected the answer\n\nComment: ${found.comment || "No comment provided"}`
              }
            : m
        )
      );
    }

    return newChat;
  }

  return c;

});

localStorage.setItem("recentChats", JSON.stringify(updated));
setRecentChats(updated);

    } catch(err){
      console.log("Status check error", err)
    }

  };


  // 🔹 Check local submissions
  

  // ⏱ Run every 1 seconds
  const interval = setInterval(() => {

  checkStatus();
 

}, 3000);


  return () => clearInterval(interval);

}, [email, name]);

 const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!e.target.files || e.target.files.length === 0) return;

  const file = e.target.files[0];   // ✅ move here

  const library = JSON.parse(localStorage.getItem("library") || "[]");

  library.push({
    name: file.name,
    type: file.type,
    size: (file.size / 1024).toFixed(2) + " KB"
  });

  localStorage.setItem("library", JSON.stringify(library));

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`${AI_BACKEND}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Upload failed");
    }

    console.log("Upload status:", res.status);

    setUploadedFiles(prev => [
      ...prev,
      {
        name: file.name,
        type: file.type,
        size: (file.size / 1024).toFixed(2) + " KB",
        rawFile: file,
      },
    ]);

    alert("File uploaded successfully ✅");
  } catch (error) {
    console.error("Upload failed:", error);
    alert("File upload failed ❌");
  }

  e.target.value = "";
};



  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const sendToTeacher = async (msg: Message) => {
if (msg.verified) {
  alert("This answer is already verified by the teacher.");
  return;
}
  try {

    await fetch(`${AI_BACKEND}/send_to_teacher`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
  question: messages.find(m => m.id === msg.id.replace("-ai",""))?.content,
  answer: msg.content,
  studentName: name
})
    });
const chats = JSON.parse(localStorage.getItem("recentChats") || "[]");

const updated = chats.map((c:any) => {

  if(c.id === msg.id.replace("-ai","")){
    return { ...c, status: "pending" };
  }

  return c;

});

localStorage.setItem("recentChats", JSON.stringify(updated));
setRecentChats(updated);
    // ✅ Show waiting message instead of verified
    setMessages(prev => {

      if(prev.some(m => m.id === msg.id + "-pending")){
        return prev;
      }

      return [
        ...prev,
        {
          id: msg.id + "-pending",
          sender:"ai",
          content:"⏳ Sent to teacher for verification...",
          timestamp:new Date().toLocaleTimeString()
        }
      ]

    })

  } catch (err) {

    console.error("Teacher send failed:", err);

  }

};
const handleSendMessage = async () => {

  if (message.trim() || uploadedFiles.length > 0) {

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, newMessage]);

    const res = await fetch(`${AI_BACKEND}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: message,
        files: uploadedFiles.map(f => f.name)
      })
    });

    const data = await res.json();
console.log("AI RESPONSE:", data);

  

const aiMessage: Message = {
  id: newMessage.id + "-ai",
  sender: "ai",
  content: data.answer,
  timestamp: new Date().toLocaleTimeString(),
  verified: data.verified || false
};

    setMessages(prev => [...prev, aiMessage]);

    // ✅ SAVE RECENT CHAT AFTER AI RESPONSE
    const chats = JSON.parse(localStorage.getItem("recentChats") || "[]");

    chats.push({
  id: newMessage.id,
  title: message,
  lastMessage: data.answer,
  timestamp: new Date().toLocaleString(),
  status: "none"
});

    localStorage.setItem("recentChats", JSON.stringify(chats));


    setMessage('');
    setUploadedFiles([]);
  }
};

  const renderMainContent = () => {
    switch (activeView) {
      case 'chat':
        return (
          <div className="flex flex-col h-full">
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
              <h2 className="text-2xl mb-2">Start a New Chat</h2>
              <p className="text-gray-600 text-sm">Upload files and ask questions to get personalized help</p>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm p-6 mb-4 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
  <div
    key={msg.id}
    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
  >
    <div
      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
        msg.sender === 'user'
          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
          : 'bg-gray-100 text-gray-800'
      }`}
    >

      {/* MESSAGE CONTENT */}
      {msg.content ? (
       <p className="whitespace-pre-wrap">
  {msg.content.replace(/\*\*/g, "")}
</p>
      ) : (
        <p className="italic text-gray-400">No response received</p>
      )}

      {/* VERIFIED BADGE */}
      {msg.verified && (
  <div className="text-green-600 text-xs mt-1">
    ✔ Verified by Teacher
  </div>
)}

      {/* TIMESTAMP */}
      <p
        className={`text-xs mt-1 ${
          msg.sender === 'user' ? 'text-white/70' : 'text-gray-500'
        }`}
      >
        {msg.timestamp}
      </p>

      {/* SEND TO TEACHER BUTTON (ONLY FOR AI) */}
      {msg.sender === "ai" && !msg.verified && (
  <button
    onClick={() => sendToTeacher(msg)}
    className="mt-2 text-sm text-purple-600 underline"
  >
    Send to Teacher for Verification
  </button>
)}

    </div>
  </div>
))}
                </div>
              )}
            </div>

            {/* File Upload Area */}
            {uploadedFiles.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
                <div className="flex flex-wrap gap-2">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-lg"
                    >
                      {file.type.includes('image') ? (
                        <ImageIcon className="w-4 h-4 text-purple-600" />
                      ) : (
                        <FileText className="w-4 h-4 text-purple-600" />
                      )}
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <div className="flex gap-3">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.ppt,.pptx,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl hover:bg-purple-200 transition-colors">
                    <Upload className="w-5 h-5 text-purple-600" />
                  </div>
                </label>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your question or paste text here..."
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        );

      case 'recent-chats':
        return (
          <div>
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <h2 className="text-2xl mb-2">Recent Chats</h2>
              <p className="text-gray-600 text-sm">Continue your previous conversations</p>
            </div>

            <div className="space-y-4">
              {recentChats.length === 0 ? (
  <p className="text-gray-500 italic">No chats yet</p>
) : (
  recentChats.map((chat) => (
    <div
      key={chat.id}
      className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg mb-2">{chat.title}</h3>

{chat.status === "rejected" ? (
  <p className="text-red-500 text-sm mb-2">
    This answer was rejected by the teacher.
  </p>
) : (
  <p className="text-gray-600 text-sm mb-2">{chat.lastMessage}</p>
)}

{chat.status === "verified" && (
  <p className="text-green-600">✔ Approved by Teacher</p>
)}

{chat.status === "rejected" && (
  <p className="text-red-600">✖ Rejected by Teacher</p>
)}

{chat.status === "pending" && (
  <p className="text-yellow-600">⏳ Waiting for Teacher Review</p>
)}

          <p className="text-gray-400 text-xs">{chat.timestamp}</p>
        </div>
        <MessageSquare className="w-6 h-6 text-purple-600" />
      </div>
    </div>
  ))
)}
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
                    <label className="block text-sm text-gray-600 mb-2">Username</label>
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

              <div className="border-t pt-6">
                <h3 className="text-lg mb-4">Notifications</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-gray-700">Email notifications</span>
                    <input type="checkbox" className="w-5 h-5 text-purple-600" defaultChecked />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-gray-700">Chat updates</span>
                    <input type="checkbox" className="w-5 h-5 text-purple-600" defaultChecked />
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
              <p className="text-gray-600 text-sm">
Ready to continue learning!
</p>   </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="bg-white rounded-2xl shadow-sm p-6 h-72 flex flex-col">
  <h3 className="text-xl mb-4">My Library</h3>

  <div className="overflow-y-auto flex-1">
    {JSON.parse(localStorage.getItem("library") || "[]").length === 0 ? (
      <p className="text-gray-500 italic">No saved materials yet</p>
    ) : (
      JSON.parse(localStorage.getItem("library") || "[]").map((file:any, i:number) => (
        <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
          📄 {file.name}
        </div>
      ))
    )}
  </div>
</div>

              <div className="bg-white rounded-2xl shadow-sm p-6 h-72 flex flex-col">
                <h3 className="text-xl mb-4">Recent Conversations</h3>
                <div className="space-y-3 overflow-y-auto max-h-52">
                  
                  {recentChats.length === 0 ? (
  <p className="text-gray-500 italic">No conversations yet</p>
) : (
 recentChats.slice(-5).reverse().map((chat:any) => (
    <div key={chat.id} className="text-sm">
      <p className="text-gray-700">{chat.title}</p>
      <p className="text-gray-400 text-xs">{chat.timestamp}</p>
    </div>
  ))
)}
                </div>
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
                  <span className="text-white text-sm">
{name.charAt(0).toUpperCase()}
</span>

                </div>
                <span className="text-gray-700">Hi, {name}!</span>

              </div>

              {/* Navigation */}
              <nav className="space-y-2 mb-8">
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

              {/* Start Chat Button */}
              <button
  onClick={() => {
    setMessages([]);     // ✅ clear old chat
    setUploadedFiles([]); // ✅ clear uploaded files
    setMessage("");       // ✅ clear input box
    setActiveView('chat');
  }}
  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all mb-4"
>
  <MessageCircle className="w-5 h-5" />
  <span>Start a New Chat</span>
</button>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all"
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