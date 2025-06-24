import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Calendar, Clock, Briefcase } from 'lucide-react';
import { jobs } from '../../data/jobs';
import Button from '../../components/common/Button';
import PropTypes from 'prop-types';

const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(jobs.find((j) => j.id === id));

  useEffect(() => {
    if (!job) {
      navigate('/jobs');
    }
  }, [id, navigate, job]);

  if (!job) {
    return null;
  }

  // Calculate days ago for posted date
  const getDaysAgo = (dateString) => {
    const now = new Date();
    const postedDate = new Date(dateString);
    const diffTime = Math.abs(now.getTime() - postedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/jobs')}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Jobs
        </button>

        {/* Job Header */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-start">
              <div className="flex-shrink-0 h-20 w-20 mb-4 md:mb-0 md:mr-6">
                <img
                  src={job.imageUrl}
                  alt={job.company}
                  className="h-full w-full object-cover rounded-md"
                />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                <p className="mt-1 text-lg text-gray-600">{job.company}</p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <div className="flex items-center text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-sm">
                    <MapPin className="h-4 w-4 mr-1" />
                    {job.location}
                  </div>
                  <div className="flex items-center text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-sm">
                    <Briefcase className="h-4 w-4 mr-1" />
                    {job.type}
                  </div>
                  <div className="flex items-center text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    Posted {getDaysAgo(job.postedDate)} days ago
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-xl font-semibold text-gray-900">{job.salary}</p>
                </div>

                <div className="mt-6">
                  <Button
                    variant="primary"
                    onClick={() => navigate(`/jobs/${job.id}/apply`)}
                    className="px-6 py-3"
                  >
                    Apply Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div className="mt-8 bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
            <p className="text-gray-700 leading-relaxed">{job.description}</p>

            <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-3">Requirements</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              {job.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-3">Responsibilities</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              {job.responsibilities.map((resp, index) => (
                <li key={index}>{resp}</li>
              ))}
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-3">Benefits</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              {job.benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Company Information */}
        <div className="mt-8 bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">About {job.company}</h2>
            <p className="text-gray-700 leading-relaxed">{job.companyDescription}</p>
          </div>
        </div>

        {/* Similar Jobs */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Similar Jobs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs
              .filter((j) => j.id !== job.id && j.category === job.category)
              .slice(0, 2)
              .map((similarJob) => (
                <div
                  key={similarJob.id}
                  className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/jobs/${similarJob.id}`)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-12 w-12 mr-4">
                        <img
                          src={similarJob.imageUrl}
                          alt={similarJob.company}
                          className="h-full w-full object-cover rounded-md"
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{similarJob.title}</h3>
                        <p className="text-gray-600">{similarJob.company}</p>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <MapPin className="h-4 w-4 mr-1" />
                          {similarJob.location}
                        </div>
                        <p className="mt-2 text-blue-600 font-medium">{similarJob.salary}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Apply Button (Fixed Bottom) */}
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-md border-t border-gray-200 p-4 md:hidden">
          <Button
            variant="primary"
            onClick={() => navigate(`/jobs/${job.id}/apply`)}
            fullWidth
          >
            Apply Now
          </Button>
        </div>
      </div>
    </div>
  );
};

JobDetailPage.propTypes = {
  job: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    company: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    salary: PropTypes.string.isRequired,
    imageUrl: PropTypes.string.isRequired,
    postedDate: PropTypes.string.isRequired,
    requirements: PropTypes.arrayOf(PropTypes.string).isRequired,
    responsibilities: PropTypes.arrayOf(PropTypes.string).isRequired,
    benefits: PropTypes.arrayOf(PropTypes.string).isRequired,
    companyDescription: PropTypes.string.isRequired,
    category: PropTypes.oneOf(['student', 'jobseeker', 'mentor', 'employer']).isRequired,
  }),
};

export default JobDetailPage;