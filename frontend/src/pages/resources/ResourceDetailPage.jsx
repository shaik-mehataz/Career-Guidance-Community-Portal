import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bookmark, BookmarkCheck, Share2, FileText, Twitter, Facebook, Linkedin, Link as LinkIcon, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { resources } from '../../data/resources';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';

const ResourceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, saveResource, unsaveResource, addToViewed } = useAuth();
  const [resource, setResource] = useState(resources.find((r) => r.id === Number(id)));
  const [showShareOptions, setShowShareOptions] = useState(false);

  useEffect(() => {
    if (!resource) {
      navigate('/resources');
      return;
    }
    
    // Add to viewed resources when viewing details
    if (user) {
      addToViewed('resources', resource.id);
    }
  }, [id, navigate, resource, user, addToViewed]);

  if (!resource) {
    return null;
  }

  const handleSaveResource = () => {
    if (user?.savedResources.includes(resource.id)) {
      unsaveResource(resource.id);
    } else {
      saveResource(resource.id);
    }
  };

  const shareOnTwitter = () => {
    const text = `Check out this resource: ${resource.title}`;
    const url = window.location.href;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareOnFacebook = () => {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    const url = window.location.href;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    const text = `Check out this resource: ${resource.title}`;
    const url = window.location.href;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n\n' + url)}`, '_blank');
    setShowShareOptions(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
    setShowShareOptions(false);
  };

  const openWikipedia = () => {
    if (resource.wikiLink) {
      // Open Wikipedia in a new tab so users can easily return to our site
      window.open(resource.wikiLink, '_blank', 'noopener,noreferrer');
    }
  };

  // Convert markdown-like content to HTML (simple version)
  const formatContent = (content) => {
    const contentWithHeadings = content
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold my-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold my-3">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium my-2">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    const contentWithLists = contentWithHeadings.replace(
      /^\d+\. (.*$)/gm,
      '<li class="ml-6 list-decimal my-1">$1</li>'
    ).replace(/^- (.*$)/gm, '<li class="ml-6 list-disc my-1">$1</li>');

    // Wrap adjacent list items in <ul> or <ol>
    let formattedContent = contentWithLists;
    formattedContent = formattedContent.replace(
      /<li class="ml-6 list-decimal my-1">([\s\S]*?)(?=<\/li>)<\/li>/g,
      '<ol class="my-2">$&</ol>'
    );
    formattedContent = formattedContent.replace(
      /<li class="ml-6 list-disc my-1">([\s\S]*?)(?=<\/li>)<\/li>/g,
      '<ul class="my-2">$&</ul>'
    );

    return formattedContent;
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero section with image */}
      <div className="relative h-64 md:h-96 bg-gray-900">
        <img
          src={resource.imageUrl}
          alt={resource.title}
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-6 md:p-10">
          <button
            onClick={() => navigate('/resources')}
            className="mb-4 flex items-center text-white hover:text-blue-200 transition-colors"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Resources
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{resource.title}</h1>
          <div className="flex items-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {resource.category}
            </span>
          </div>
        </div>
      </div>

      {/* Content section */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <p className="text-lg text-gray-600">{resource.description}</p>
          <div className="flex items-center gap-4">
            <div className="flex gap-4">
              {resource.wikiLink && (
                <Button
                  variant="outline"
                  onClick={openWikipedia}
                  className="w-32 h-10 flex items-center justify-center"
                  title="Opens Wikipedia in a new tab"
                >
                  <FileText className="mr-2 h-5 w-5" /> 
                  <span className="whitespace-nowrap">Learn More</span>
                </Button>
              )}
              <div className="relative">
                <Button 
                  variant="outline"
                  onClick={() => setShowShareOptions(!showShareOptions)}
                  className="w-32 h-10 flex items-center justify-center"
                >
                  <Share2 className="mr-2 h-5 w-5" /> 
                  <span className="whitespace-nowrap">Share</span>
                </Button>
                {showShareOptions && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                    <div className="py-1">
                      <button
                        onClick={shareOnTwitter}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Twitter className="h-4 w-4 mr-3" /> Share on Twitter
                      </button>
                      <button
                        onClick={shareOnFacebook}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Facebook className="h-4 w-4 mr-3" /> Share on Facebook
                      </button>
                      <button
                        onClick={shareOnLinkedIn}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Linkedin className="h-4 w-4 mr-3" /> Share on LinkedIn
                      </button>
                      <button
                        onClick={shareOnWhatsApp}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <MessageSquare className="h-4 w-4 mr-3" /> Share on WhatsApp
                      </button>
                      <button
                        onClick={copyLink}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LinkIcon className="h-4 w-4 mr-3" /> Copy Link
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {user && (
              <Button
                variant="outline"
                onClick={handleSaveResource}
                className="w-32 h-10 flex items-center justify-center"
              >
                {user.savedResources.includes(resource.id) ? (
                  <>
                    <BookmarkCheck className="mr-2 h-5 w-5" /> 
                    <span className="whitespace-nowrap">Saved</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="mr-2 h-5 w-5" /> 
                    <span className="whitespace-nowrap">Save</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        <div className="prose prose-blue max-w-none">
          <div dangerouslySetInnerHTML={{ __html: formatContent(resource.content) }} />
        </div>

        {/* Related resources */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resources
              .filter(
                (r) => r.category === resource.category && r.id !== resource.id
              )
              .slice(0, 2)
              .map((relatedResource) => (
                <div
                  key={relatedResource.id}
                  className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <img
                    src={relatedResource.imageUrl}
                    alt={relatedResource.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">{relatedResource.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{relatedResource.description}</p>
                    <Button
                      variant="primary"
                      onClick={() => navigate(`/resources/${relatedResource.id}`)}
                      size="sm"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetailPage;