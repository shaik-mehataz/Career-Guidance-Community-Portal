import { useState } from 'react';
import { Download, ArrowLeft, Edit, X, Plus, Trash2 } from 'lucide-react';
import Button from '../../components/common/Button';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ResumeBuilderPage = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+91 9876543210',
      location: 'Mumbai, Maharashtra',
      summary: 'Experienced software engineer with 5+ years of expertise in full-stack development, specializing in React, Node.js, and cloud technologies. Passionate about creating scalable solutions and leading development teams.',
    },
    education: [
      { 
        degree: 'Bachelor of Technology in Computer Science', 
        institution: 'Indian Institute of Technology, Mumbai', 
        year: '2018-2022', 
        gpa: '8.5/10' 
      }
    ],
    experience: [
      { 
        role: 'Senior Software Engineer', 
        company: 'TechCorp Solutions', 
        duration: 'Jan 2022 - Present', 
        description: '• Led development of microservices architecture serving 1M+ users\n• Implemented CI/CD pipelines reducing deployment time by 60%\n• Mentored junior developers and conducted code reviews' 
      },
      { 
        role: 'Software Developer Intern', 
        company: 'StartupXYZ', 
        duration: 'Jun 2021 - Dec 2021', 
        description: '• Developed responsive web applications using React and Node.js\n• Collaborated with cross-functional teams in agile environment\n• Optimized database queries improving performance by 40%' 
      }
    ],
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'MongoDB', 'Git'],
    projects: [
      {
        name: 'E-commerce Platform',
        description: 'Built a full-stack e-commerce platform with React, Node.js, and MongoDB',
        technologies: 'React, Node.js, MongoDB, Stripe API'
      }
    ]
  });

  const templates = [
    {
      id: 1,
      name: 'Professional Blue',
      description: 'Clean sidebar design perfect for corporate roles',
      color: 'bg-blue-600',
      preview: 'Modern layout with sidebar for contact info and skills'
    },
    {
      id: 2,
      name: 'Creative Purple',
      description: 'Bold design for creative professionals',
      color: 'bg-purple-600',
      preview: 'Eye-catching gradient header with modern styling'
    },
    {
      id: 3,
      name: 'Minimalist Gray',
      description: 'Elegant and timeless design',
      color: 'bg-gray-600',
      preview: 'Clean typography with plenty of white space'
    },
    {
      id: 4,
      name: 'Executive Dark',
      description: 'Sophisticated design for senior positions',
      color: 'bg-slate-800',
      preview: 'Premium dark theme with professional styling'
    },
    {
      id: 5,
      name: 'Modern Green',
      description: 'Fresh design for tech and startups',
      color: 'bg-green-600',
      preview: 'Contemporary layout with vibrant accents'
    },
    {
      id: 6,
      name: 'Academic Red',
      description: 'Traditional format for academic positions',
      color: 'bg-red-600',
      preview: 'Classic academic styling with serif fonts'
    }
  ];

  const handleTemplateClick = (template) => {
    setSelectedTemplate(template);
    setIsEditing(false);
  };

  const handleEditResume = () => {
    setIsEditing(true);
  };

  const handleBackToTemplates = () => {
    setSelectedTemplate(null);
    setIsEditing(false);
  };

  // Fixed input change handlers
  const handlePersonalInfoChange = (field, value) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  const handleEducationChange = (index, field, value) => {
    setResumeData(prev => {
      const newEducation = [...prev.education];
      newEducation[index] = {
        ...newEducation[index],
        [field]: value
      };
      return {
        ...prev,
        education: newEducation
      };
    });
  };

  const handleExperienceChange = (index, field, value) => {
    setResumeData(prev => {
      const newExperience = [...prev.experience];
      newExperience[index] = {
        ...newExperience[index],
        [field]: value
      };
      return {
        ...prev,
        experience: newExperience
      };
    });
  };

  const handleSkillChange = (index, value) => {
    setResumeData(prev => {
      const newSkills = [...prev.skills];
      newSkills[index] = value;
      return {
        ...prev,
        skills: newSkills
      };
    });
  };

  const handleProjectChange = (index, field, value) => {
    setResumeData(prev => {
      const newProjects = [...prev.projects];
      newProjects[index] = {
        ...newProjects[index],
        [field]: value
      };
      return {
        ...prev,
        projects: newProjects
      };
    });
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', institution: '', year: '', gpa: '' }]
    }));
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, { role: '', company: '', duration: '', description: '' }]
    }));
  };

  const addSkill = () => {
    setResumeData(prev => ({
      ...prev,
      skills: [...prev.skills, '']
    }));
  };

  const addProject = () => {
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, { name: '', description: '', technologies: '' }]
    }));
  };

  const removeEducation = (index) => {
    if (resumeData.education.length > 1) {
      setResumeData(prev => ({
        ...prev,
        education: prev.education.filter((_, i) => i !== index)
      }));
    }
  };

  const removeExperience = (index) => {
    if (resumeData.experience.length > 1) {
      setResumeData(prev => ({
        ...prev,
        experience: prev.experience.filter((_, i) => i !== index)
      }));
    }
  };

  const removeSkill = (index) => {
    if (resumeData.skills.length > 1) {
      setResumeData(prev => ({
        ...prev,
        skills: prev.skills.filter((_, i) => i !== index)
      }));
    }
  };

  const removeProject = (index) => {
    if (resumeData.projects.length > 1) {
      setResumeData(prev => ({
        ...prev,
        projects: prev.projects.filter((_, i) => i !== index)
      }));
    }
  };

  const downloadPDF = async () => {
    try {
      const resumeElement = document.getElementById('resume-preview');
      if (!resumeElement) {
        alert('Error: Preview element not found');
        return;
      }

      const canvas = await html2canvas(resumeElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        windowWidth: resumeElement.scrollWidth,
        windowHeight: resumeElement.scrollHeight
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF({
        orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${resumeData.personalInfo.name.replace(/\s+/g, '_')}_Resume.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const renderTemplate = (template) => {
    const baseClasses = "bg-white p-8 shadow-lg border border-gray-200 min-h-[1000px] max-w-[800px] mx-auto";
    
    switch (template.id) {
      case 1: // Professional Blue
        return (
          <div className={`${baseClasses} flex`} style={{ fontFamily: 'Arial, sans-serif' }}>
            {/* Sidebar */}
            <div className="w-1/3 bg-blue-600 text-white p-6 -m-8 mr-0">
              <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2">{resumeData.personalInfo.name}</h1>
                <p className="text-blue-100 text-sm">{resumeData.personalInfo.email}</p>
                <p className="text-blue-100 text-sm">{resumeData.personalInfo.phone}</p>
                <p className="text-blue-100 text-sm">{resumeData.personalInfo.location}</p>
              </div>
              
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-3 border-b border-blue-400 pb-1">Skills</h2>
                <div className="space-y-1">
                  {resumeData.skills.filter(skill => skill).map((skill, index) => (
                    <div key={index} className="text-sm">{skill}</div>
                  ))}
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold mb-3 border-b border-blue-400 pb-1">Education</h2>
                {resumeData.education.map((edu, index) => (
                  edu.degree && (
                    <div key={index} className="mb-4">
                      <h3 className="font-semibold text-sm">{edu.degree}</h3>
                      <p className="text-blue-100 text-xs">{edu.institution}</p>
                      <p className="text-blue-100 text-xs">{edu.year}</p>
                    </div>
                  )
                ))}
              </div>
            </div>
            
            {/* Main Content */}
            <div className="w-2/3 pl-8">
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-blue-600 mb-3 border-b border-gray-300 pb-1">Professional Summary</h2>
                <p className="text-gray-700 leading-relaxed text-sm">{resumeData.personalInfo.summary}</p>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-blue-600 mb-4 border-b border-gray-300 pb-1">Experience</h2>
                {resumeData.experience.map((exp, index) => (
                  exp.role && (
                    <div key={index} className="mb-6">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-gray-900">{exp.role}</h3>
                        <span className="text-gray-600 text-sm">{exp.duration}</span>
                      </div>
                      <p className="text-blue-600 font-medium text-sm">{exp.company}</p>
                      <p className="text-gray-700 mt-2 whitespace-pre-line text-sm">{exp.description}</p>
                    </div>
                  )
                ))}
              </div>
              
              {resumeData.projects.some(project => project.name) && (
                <div>
                  <h2 className="text-xl font-semibold text-blue-600 mb-4 border-b border-gray-300 pb-1">Projects</h2>
                  {resumeData.projects.map((project, index) => (
                    project.name && (
                      <div key={index} className="mb-4">
                        <h3 className="font-semibold text-gray-900 text-sm">{project.name}</h3>
                        <p className="text-gray-700 text-sm">{project.description}</p>
                        <p className="text-blue-600 text-xs mt-1">{project.technologies}</p>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 2: // Creative Purple
        return (
          <div className={baseClasses} style={{ fontFamily: 'Arial, sans-serif' }}>
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 -m-8 mb-8">
              <h1 className="text-3xl font-bold mb-2">{resumeData.personalInfo.name}</h1>
              <div className="flex flex-wrap gap-4 text-sm">
                <span>{resumeData.personalInfo.email}</span>
                <span>{resumeData.personalInfo.phone}</span>
                <span>{resumeData.personalInfo.location}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-8">
              <div className="col-span-2">
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-purple-600 mb-3">About Me</h2>
                  <p className="text-gray-700 leading-relaxed">{resumeData.personalInfo.summary}</p>
                </div>
                
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-purple-600 mb-4">Experience</h2>
                  {resumeData.experience.map((exp, index) => (
                    exp.role && (
                      <div key={index} className="mb-6 border-l-4 border-purple-300 pl-4">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-gray-900">{exp.role}</h3>
                          <span className="text-gray-600 text-sm">{exp.duration}</span>
                        </div>
                        <p className="text-purple-600 font-medium">{exp.company}</p>
                        <p className="text-gray-700 mt-2 whitespace-pre-line">{exp.description}</p>
                      </div>
                    )
                  ))}
                </div>
              </div>
              
              <div>
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-purple-600 mb-3">Skills</h2>
                  <div className="space-y-2">
                    {resumeData.skills.filter(skill => skill).map((skill, index) => (
                      <div key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-purple-600 mb-3">Education</h2>
                  {resumeData.education.map((edu, index) => (
                    edu.degree && (
                      <div key={index} className="mb-4">
                        <h3 className="font-semibold text-gray-900 text-sm">{edu.degree}</h3>
                        <p className="text-gray-700 text-sm">{edu.institution}</p>
                        <p className="text-gray-600 text-sm">{edu.year}</p>
                      </div>
                    )
                  ))}
                </div>
                
                {resumeData.projects.some(project => project.name) && (
                  <div>
                    <h2 className="text-lg font-semibold text-purple-600 mb-3">Projects</h2>
                    {resumeData.projects.map((project, index) => (
                      project.name && (
                        <div key={index} className="mb-4">
                          <h3 className="font-semibold text-gray-900 text-sm">{project.name}</h3>
                          <p className="text-gray-700 text-xs">{project.description}</p>
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 3: // Minimalist Gray
        return (
          <div className={baseClasses} style={{ fontFamily: 'Georgia, serif' }}>
            <div className="text-center mb-8 border-b border-gray-300 pb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{resumeData.personalInfo.name}</h1>
              <div className="text-gray-600 space-x-4">
                <span>{resumeData.personalInfo.email}</span>
                <span>•</span>
                <span>{resumeData.personalInfo.phone}</span>
                <span>•</span>
                <span>{resumeData.personalInfo.location}</span>
              </div>
            </div>
            
            <div className="mb-8">
              <p className="text-gray-700 leading-relaxed text-center italic">{resumeData.personalInfo.summary}</p>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">Experience</h2>
              {resumeData.experience.map((exp, index) => (
                exp.role && (
                  <div key={index} className="mb-6 text-center">
                    <h3 className="font-semibold text-gray-900">{exp.role}</h3>
                    <p className="text-gray-600 italic">{exp.company} • {exp.duration}</p>
                    <p className="text-gray-700 mt-2 whitespace-pre-line">{exp.description}</p>
                  </div>
                )
              ))}
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 text-center">Education</h2>
                {resumeData.education.map((edu, index) => (
                  edu.degree && (
                    <div key={index} className="mb-4 text-center">
                      <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                      <p className="text-gray-700">{edu.institution}</p>
                      <p className="text-gray-600">{edu.year}</p>
                    </div>
                  )
                ))}
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 text-center">Skills</h2>
                <div className="text-center">
                  {resumeData.skills.filter(skill => skill).map((skill, index) => (
                    <span key={index} className="inline-block mx-1 mb-1 text-gray-700">
                      {skill}{index < resumeData.skills.filter(s => s).length - 1 ? ' •' : ''}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4: // Executive Dark
        return (
          <div className={`${baseClasses} bg-slate-800 text-white`} style={{ fontFamily: 'Arial, sans-serif' }}>
            <div className="border-b border-slate-600 pb-6 mb-8">
              <h1 className="text-3xl font-bold mb-2">{resumeData.personalInfo.name}</h1>
              <div className="text-slate-300 flex flex-wrap gap-4">
                <span>{resumeData.personalInfo.email}</span>
                <span>{resumeData.personalInfo.phone}</span>
                <span>{resumeData.personalInfo.location}</span>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-yellow-400 mb-3">Executive Summary</h2>
              <p className="text-slate-300 leading-relaxed">{resumeData.personalInfo.summary}</p>
            </div>
            
            <div className="grid grid-cols-3 gap-8">
              <div className="col-span-2">
                <h2 className="text-xl font-semibold text-yellow-400 mb-4">Professional Experience</h2>
                {resumeData.experience.map((exp, index) => (
                  exp.role && (
                    <div key={index} className="mb-6">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-white">{exp.role}</h3>
                        <span className="text-slate-400 text-sm">{exp.duration}</span>
                      </div>
                      <p className="text-yellow-400 font-medium">{exp.company}</p>
                      <p className="text-slate-300 mt-2 whitespace-pre-line">{exp.description}</p>
                    </div>
                  )
                ))}
              </div>
              
              <div>
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-yellow-400 mb-3">Core Competencies</h2>
                  <div className="space-y-1">
                    {resumeData.skills.filter(skill => skill).map((skill, index) => (
                      <div key={index} className="text-slate-300 text-sm">• {skill}</div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h2 className="text-lg font-semibold text-yellow-400 mb-3">Education</h2>
                  {resumeData.education.map((edu, index) => (
                    edu.degree && (
                      <div key={index} className="mb-4">
                        <h3 className="font-semibold text-white text-sm">{edu.degree}</h3>
                        <p className="text-slate-300 text-sm">{edu.institution}</p>
                        <p className="text-slate-400 text-sm">{edu.year}</p>
                      </div>
                    )
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 5: // Modern Green
        return (
          <div className={baseClasses} style={{ fontFamily: 'Arial, sans-serif' }}>
            <div className="bg-green-600 text-white p-6 -m-8 mb-8 rounded-t-lg">
              <h1 className="text-3xl font-bold mb-2">{resumeData.personalInfo.name}</h1>
              <div className="flex flex-wrap gap-4 text-sm">
                <span>{resumeData.personalInfo.email}</span>
                <span>{resumeData.personalInfo.phone}</span>
                <span>{resumeData.personalInfo.location}</span>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-green-600 mb-3 flex items-center">
                <div className="w-4 h-4 bg-green-600 rounded-full mr-2"></div>
                Profile
              </h2>
              <p className="text-gray-700 leading-relaxed">{resumeData.personalInfo.summary}</p>
            </div>
            
            <div className="grid grid-cols-3 gap-8">
              <div className="col-span-2">
                <h2 className="text-xl font-semibold text-green-600 mb-4 flex items-center">
                  <div className="w-4 h-4 bg-green-600 rounded-full mr-2"></div>
                  Experience
                </h2>
                {resumeData.experience.map((exp, index) => (
                  exp.role && (
                    <div key={index} className="mb-6 bg-green-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-gray-900">{exp.role}</h3>
                        <span className="text-gray-600 text-sm bg-white px-2 py-1 rounded">{exp.duration}</span>
                      </div>
                      <p className="text-green-600 font-medium">{exp.company}</p>
                      <p className="text-gray-700 mt-2 whitespace-pre-line">{exp.description}</p>
                    </div>
                  )
                ))}
              </div>
              
              <div>
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-green-600 mb-3 flex items-center">
                    <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
                    Skills
                  </h2>
                  <div className="space-y-2">
                    {resumeData.skills.filter(skill => skill).map((skill, index) => (
                      <div key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm">
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h2 className="text-lg font-semibold text-green-600 mb-3 flex items-center">
                    <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
                    Education
                  </h2>
                  {resumeData.education.map((edu, index) => (
                    edu.degree && (
                      <div key={index} className="mb-4 bg-gray-50 p-3 rounded">
                        <h3 className="font-semibold text-gray-900 text-sm">{edu.degree}</h3>
                        <p className="text-gray-700 text-sm">{edu.institution}</p>
                        <p className="text-gray-600 text-sm">{edu.year}</p>
                      </div>
                    )
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 6: // Academic Red
        return (
          <div className={baseClasses} style={{ fontFamily: 'Times New Roman, serif' }}>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-red-800 mb-2">{resumeData.personalInfo.name}</h1>
              <div className="text-gray-600">
                {resumeData.personalInfo.email} | {resumeData.personalInfo.phone} | {resumeData.personalInfo.location}
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-red-800 mb-2 border-b-2 border-red-800 pb-1">OBJECTIVE</h2>
              <p className="text-gray-700 leading-relaxed">{resumeData.personalInfo.summary}</p>
            </div>
            
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-red-800 mb-2 border-b-2 border-red-800 pb-1">EDUCATION</h2>
              {resumeData.education.map((edu, index) => (
                edu.degree && (
                  <div key={index} className="mb-4">
                    <div className="flex justify-between">
                      <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                      <span className="text-gray-600">{edu.year}</span>
                    </div>
                    <p className="text-gray-700 italic">{edu.institution}</p>
                    {edu.gpa && <p className="text-gray-600">GPA: {edu.gpa}</p>}
                  </div>
                )
              ))}
            </div>
            
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-red-800 mb-2 border-b-2 border-red-800 pb-1">EXPERIENCE</h2>
              {resumeData.experience.map((exp, index) => (
                exp.role && (
                  <div key={index} className="mb-6">
                    <div className="flex justify-between">
                      <h3 className="font-semibold text-gray-900">{exp.role}</h3>
                      <span className="text-gray-600">{exp.duration}</span>
                    </div>
                    <p className="text-gray-700 italic">{exp.company}</p>
                    <p className="text-gray-700 mt-2 whitespace-pre-line">{exp.description}</p>
                  </div>
                )
              ))}
            </div>
            
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-red-800 mb-2 border-b-2 border-red-800 pb-1">SKILLS</h2>
              <p className="text-gray-700">
                {resumeData.skills.filter(skill => skill).join(', ')}
              </p>
            </div>
            
            {resumeData.projects.some(project => project.name) && (
              <div>
                <h2 className="text-lg font-semibold text-red-800 mb-2 border-b-2 border-red-800 pb-1">PROJECTS</h2>
                {resumeData.projects.map((project, index) => (
                  project.name && (
                    <div key={index} className="mb-4">
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      <p className="text-gray-700">{project.description}</p>
                      <p className="text-gray-600 italic">Technologies: {project.technologies}</p>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        );

      default:
        return renderTemplate({ id: 1 });
    }
  };

  // Template Selection View
  if (!selectedTemplate) {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">Resume Builder</h1>
            <p className="mt-4 text-xl text-gray-600">Choose a template to get started</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {templates.map((template) => (
              <div
                key={template.id}
                onClick={() => handleTemplateClick(template)}
                className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className={`h-48 ${template.color} flex items-center justify-center`}>
                  <div className="text-white text-center">
                    <div className="w-16 h-20 bg-white bg-opacity-20 rounded mx-auto mb-4"></div>
                    <h3 className="text-lg font-semibold">{template.name}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">{template.description}</p>
                  <p className="text-sm text-gray-500">{template.preview}</p>
                  <Button variant="primary" className="w-full mt-4">
                    Use This Template
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Template Cover Page View
  if (selectedTemplate && !isEditing) {
    return (
      <div className="bg-gray-100 min-h-screen">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={handleBackToTemplates}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Templates
              </button>
              
              <h1 className="text-xl font-semibold text-gray-900">{selectedTemplate.name}</h1>
              
              <div className="flex space-x-3">
                <Button variant="outline" onClick={handleEditResume} className="flex items-center">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Resume
                </Button>
                <Button variant="primary" onClick={downloadPDF} className="flex items-center">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Resume Preview */}
        <div className="py-8">
          <div id="resume-preview" className="max-w-4xl mx-auto">
            {renderTemplate(selectedTemplate)}
          </div>
        </div>
      </div>
    );
  }

  // Editing View
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Preview
            </button>
            
            <h1 className="text-xl font-semibold text-gray-900">Edit Resume - {selectedTemplate.name}</h1>
            
            <Button variant="primary" onClick={downloadPDF} className="flex items-center">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 h-fit">
              <div className="space-y-8">
                {/* Personal Information */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={resumeData.personalInfo.name}
                        onChange={(e) => handlePersonalInfoChange('name', e.target.value)}
                        className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={resumeData.personalInfo.email}
                        onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                        className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={resumeData.personalInfo.phone}
                        onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                        className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        value={resumeData.personalInfo.location}
                        onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
                        className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Professional Summary</label>
                      <textarea
                        value={resumeData.personalInfo.summary}
                        onChange={(e) => handlePersonalInfoChange('summary', e.target.value)}
                        rows={4}
                        className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Education */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Education</h2>
                    <Button variant="outline" size="sm" onClick={addEducation} className="flex items-center">
                      <Plus className="h-4 w-4 mr-1" /> Add Education
                    </Button>
                  </div>
                  {resumeData.education.map((edu, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-4 mb-4">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Education #{index + 1}</h3>
                        {resumeData.education.length > 1 && (
                          <button
                            onClick={() => removeEducation(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                            className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                            className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                            <input
                              type="text"
                              value={edu.year}
                              onChange={(e) => handleEducationChange(index, 'year', e.target.value)}
                              className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">GPA (Optional)</label>
                            <input
                              type="text"
                              value={edu.gpa}
                              onChange={(e) => handleEducationChange(index, 'gpa', e.target.value)}
                              className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Experience */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Experience</h2>
                    <Button variant="outline" size="sm" onClick={addExperience} className="flex items-center">
                      <Plus className="h-4 w-4 mr-1" /> Add Experience
                    </Button>
                  </div>
                  {resumeData.experience.map((exp, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-4 mb-4">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Experience #{index + 1}</h3>
                        {resumeData.experience.length > 1 && (
                          <button
                            onClick={() => removeExperience(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                          <input
                            type="text"
                            value={exp.role}
                            onChange={(e) => handleExperienceChange(index, 'role', e.target.value)}
                            className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                            className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                          <input
                            type="text"
                            value={exp.duration}
                            onChange={(e) => handleExperienceChange(index, 'duration', e.target.value)}
                            className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., Jan 2020 - Present"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea
                            value={exp.description}
                            onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                            rows={3}
                            className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Skills */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Skills</h2>
                    <Button variant="outline" size="sm" onClick={addSkill} className="flex items-center">
                      <Plus className="h-4 w-4 mr-1" /> Add Skill
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {resumeData.skills.map((skill, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={skill}
                          onChange={(e) => handleSkillChange(index, e.target.value)}
                          className="flex-1 border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., JavaScript, Project Management, etc."
                        />
                        {resumeData.skills.length > 1 && (
                          <button
                            onClick={() => removeSkill(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Projects */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
                    <Button variant="outline" size="sm" onClick={addProject} className="flex items-center">
                      <Plus className="h-4 w-4 mr-1" /> Add Project
                    </Button>
                  </div>
                  {resumeData.projects.map((project, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-4 mb-4">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Project #{index + 1}</h3>
                        {resumeData.projects.length > 1 && (
                          <button
                            onClick={() => removeProject(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                          <input
                            type="text"
                            value={project.name}
                            onChange={(e) => handleProjectChange(index, 'name', e.target.value)}
                            className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea
                            value={project.description}
                            onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                            rows={2}
                            className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Technologies Used</label>
                          <input
                            type="text"
                            value={project.technologies}
                            onChange={(e) => handleProjectChange(index, 'technologies', e.target.value)}
                            className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., React, Node.js, MongoDB"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 sticky top-24 h-fit">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Live Preview</h2>
                <Button variant="primary" onClick={downloadPDF} className="flex items-center">
                  <Download className="h-4 w-4 mr-2" /> Download PDF
                </Button>
              </div>

              <div 
                id="resume-preview" 
                className="transform scale-50 origin-top-left w-[200%] h-[200%] overflow-hidden"
              >
                {renderTemplate(selectedTemplate)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilderPage;