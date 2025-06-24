import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Briefcase, Calendar, Star, MessageCircle, Award, BookOpen, GraduationCap, Linkedin, Twitter, Globe } from 'lucide-react';
import { mentors } from '../../data/mentors';
import Button from '../../components/common/Button';
import PropTypes from 'prop-types';

const MentorDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(mentors.find((m) => m.id === Number(id)));

  useEffect(() => {
    if (!mentor) {
      navigate('/mentors');
    }
    // In a real app, we would fetch mentor details from an API
  }, [id, navigate, mentor]);

  if (!mentor) {
    return null;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/mentors')}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Mentors
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Mentor Profile */}
          <div className="md:col-span-2">
            <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <div className="flex-shrink-0 h-24 w-24 sm:h-32 sm:w-32 mb-4 sm:mb-0 sm:mr-6">
                    <img
                      src={mentor.imageUrl}
                      alt={mentor.name}
                      className="h-full w-full object-cover rounded-full"
                    />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">{mentor.name}</h1>
                    <p className="text-lg text-gray-600">{mentor.title}</p>

                    <div className="mt-2 space-y-1">
                      <div className="flex items-center text-gray-600">
                        <Briefcase className="h-4 w-4 mr-2" />
                        {mentor.company}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {mentor.location}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {mentor.experience} years of experience
                      </div>
                    </div>

                    <div className="mt-4 flex items-center">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(mentor.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="ml-2 text-gray-600">
                        {mentor.rating} ({mentor.reviews} reviews)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">About</h2>
                  <p className="text-gray-700 whitespace-pre-line">{mentor.bio}</p>
                </div>

                <div className="mt-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Expertise</h2>
                  <div className="flex flex-wrap gap-2">
                    {mentor.expertise.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Education</h2>
                  <ul className="space-y-2">
                    {mentor.education.map((edu, index) => (
                      <li key={index} className="flex items-start">
                        <GraduationCap className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                        <span className="text-gray-700">{edu}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Mentoring Sessions</h2>
                  <ul className="space-y-2">
                    {mentor.sessions.map((session, index) => (
                      <li key={index} className="flex items-start">
                        <Award className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                        <span className="text-gray-700">{session}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Languages</h2>
                  <div className="flex flex-wrap gap-2">
                    {mentor.languages.map((language) => (
                      <span
                        key={language}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                      >
                        {language}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Connect</h2>
                  <div className="flex space-x-4">
                    {mentor.socialLinks.linkedin && (
                      <a
                        href={mentor.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <Linkedin className="h-6 w-6" />
                      </a>
                    )}
                    {mentor.socialLinks.twitter && (
                      <a
                        href={mentor.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-blue-400 transition-colors"
                      >
                        <Twitter className="h-6 w-6" />
                      </a>
                    )}
                    {mentor.socialLinks.website && (
                      <a
                        href={mentor.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-purple-600 transition-colors"
                      >
                        <Globe className="h-6 w-6" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonials */}
            <div className="mt-8 bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Testimonials from Mentees</h2>
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                      <div className="flex items-center mb-3">
                        <div className="flex-shrink-0 h-10 w-10 mr-3">
                          <img
                            src={`https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/${i + 20}.jpg`}
                            alt="Mentee"
                            className="h-full w-full object-cover rounded-full"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {i === 1 ? 'Arjun Singh' : i === 2 ? 'Meera Patel' : 'Rahul Verma'}
                          </p>
                          <div className="flex items-center mt-1">
                            {Array.from({ length: 5 }).map((_, j) => (
                              <Star
                                key={j}
                                className={`h-3 w-3 ${
                                  j < 5 - (i % 2) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700">
                        {i === 1
                          ? `${mentor.name} provided invaluable guidance during my career transition into data science. His practical approach and industry insights helped me navigate the complex landscape and land my dream job.`
                          : i === 2
                          ? `I've had several mentoring sessions with ${mentor.name} and each one has been incredibly helpful. The personalized feedback on my portfolio and interview preparation made a significant difference in my job search.`
                          : `Working with ${mentor.name} has transformed my approach to problem-solving. The mentorship sessions were well-structured, and I appreciated the honest feedback and actionable advice.`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contact and Similar Mentors */}
          <div>
            <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200 sticky top-4">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Schedule a Session</h2>
                <p className="text-gray-600 mb-6">
                  Connect with {mentor.name.split(' ')[0]} to discuss your career goals and get personalized guidance.
                </p>
                <Button
                  variant="primary"
                  onClick={() => navigate(`/mentors/${mentor.id}/chat`)}
                  fullWidth
                  className="flex items-center justify-center"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Send Message
                </Button>
              </div>
            </div>

            {/* Similar Mentors */}
            <div className="mt-8 bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Similar Mentors</h2>
                <div className="space-y-4">
                  {mentors
                    .filter(
                      (m) =>
                        m.id !== mentor.id &&
                        m.expertise.some((skill) => mentor.expertise.includes(skill))
                    )
                    .slice(0, 3)
                    .map((similarMentor) => (
                      <div
                        key={similarMentor.id}
                        className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                      >
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 mr-3">
                            <img
                              src={similarMentor.imageUrl}
                              alt={similarMentor.name}
                              className="h-full w-full object-cover rounded-full"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 hover:text-blue-600">
                              <Link to={`/mentors/${similarMentor.id}`}>{similarMentor.name}</Link>
                            </h3>
                            <p className="text-sm text-gray-600">{similarMentor.title}</p>
                            <div className="flex items-center mt-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < Math.floor(similarMentor.rating)
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                              <span className="text-xs text-gray-600 ml-1">
                                ({similarMentor.reviews})
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Resources */}
            <div className="mt-8 bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Resources by {mentor.name.split(' ')[0]}</h2>
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-start">
                      <BookOpen className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                      <div>
                        <a
                          href="#"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {i === 0
                            ? `Guide to ${mentor.expertise[0]}`
                            : i === 1
                            ? `Career Paths in ${mentor.expertise.length > 1 ? mentor.expertise[1] : mentor.expertise[0]}`
                            : 'Interview Preparation Tips'}
                        </a>
                        <p className="text-sm text-gray-600">
                          {i === 0
                            ? 'A comprehensive guide for beginners'
                            : i === 1
                            ? 'Explore different career opportunities'
                            : 'Ace your next technical interview'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

MentorDetailPage.propTypes = {
  mentor: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    company: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    expertise: PropTypes.arrayOf(PropTypes.string).isRequired,
    languages: PropTypes.arrayOf(PropTypes.string).isRequired,
    experience: PropTypes.number.isRequired,
    rating: PropTypes.number.isRequired,
    reviews: PropTypes.number.isRequired,
    bio: PropTypes.string.isRequired,
    imageUrl: PropTypes.string.isRequired,
    sessions: PropTypes.arrayOf(PropTypes.string).isRequired,
    education: PropTypes.arrayOf(PropTypes.string).isRequired,
    socialLinks: PropTypes.shape({
      linkedin: PropTypes.string,
      twitter: PropTypes.string,
      website: PropTypes.string,
    }).isRequired,
  }),
};

export default MentorDetailPage;