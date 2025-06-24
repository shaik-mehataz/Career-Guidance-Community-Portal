import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Clock, Calendar, Video } from 'lucide-react';
import { mentors } from '../../data/mentors';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import PropTypes from 'prop-types';

const MentorChatPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(mentors.find((m) => m.id === Number(id)));
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!mentor) {
      navigate('/mentors');
      return;
    }

    if (!user) {
      navigate('/login', { state: { from: `/mentors/${id}/chat` } });
      return;
    }

    // Start with empty chat - no automatic welcome message
    setMessages([]);
  }, [id, navigate, mentor, user]);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!mentor || !user) {
    return null;
  }

  const showMessageSentNotification = () => {
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 2000);
  };

  const handleSendMessage = () => {
    if (message.trim() === '') return;

    // Add user message
    const newMessage = {
      sender: 'user',
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    // Show notification that message was sent
    showMessageSentNotification();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-4">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(`/mentors/${mentor.id}`)}
          className="mb-4 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Mentor Profile
        </button>

        {/* Message Sent Notification */}
        {showNotification && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50 transition-all duration-300">
            Message sent successfully!
          </div>
        )}

        <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
          {/* Chat Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="flex items-center">
              <div className="h-10 w-10 mr-3">
                <img
                  src={mentor.imageUrl}
                  alt={mentor.name}
                  className="h-full w-full object-cover rounded-full"
                />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{mentor.name}</h2>
                <p className="text-sm text-gray-600">{mentor.title}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors">
                <Video className="h-5 w-5" />
              </button>
              <button className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors">
                <Calendar className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="p-4 h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Start a conversation with {mentor.name.split(' ')[0]}...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'mentor' && (
                      <div className="h-8 w-8 mr-2 flex-shrink-0">
                        <img
                          src={mentor.imageUrl}
                          alt={mentor.name}
                          className="h-full w-full object-cover rounded-full"
                        />
                      </div>
                    )}
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      <div
                        className={`text-xs mt-1 ${
                          msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                        } flex items-center`}
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {msg.time}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="px-4 py-3 border-t border-gray-200">
            <div className="flex items-center">
              <div className="relative flex-1">
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Type your message..."
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                ></textarea>
              </div>
              <Button
                variant="primary"
                onClick={handleSendMessage}
                className="ml-2 px-4 py-2 rounded-lg flex-shrink-0"
                disabled={message.trim() === ''}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Session Information */}
        <div className="mt-6 bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">About Sessions with {mentor.name.split(' ')[0]}</h3>
          <p className="text-gray-600 mb-3">
            {mentor.name.split(' ')[0]} specializes in {mentor.expertise.slice(0, 2).join(' and ')} and can help you with:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-gray-600">
            {mentor.sessions.map((session, index) => (
              <li key={index}>{session}</li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-gray-600 text-sm">
              Typical response time: <span className="font-medium">Within 24 hours</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

MentorChatPage.propTypes = {
  mentor: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    imageUrl: PropTypes.string.isRequired,
    expertise: PropTypes.arrayOf(PropTypes.string).isRequired,
    sessions: PropTypes.arrayOf(PropTypes.string).isRequired,
  }),
};

export default MentorChatPage;