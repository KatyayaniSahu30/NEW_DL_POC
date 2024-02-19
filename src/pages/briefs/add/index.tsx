import React, { useState } from 'react';
import RichTextEditor from '@/components/rich-text-editor';
import { useRouter } from 'next/router'; 
import { trpc } from '@/utils';
// import DOMPurify from 'dompurify';
// import sanitizeHtml from 'sanitize-html';

const RichTextPage: React.FC = () => {
    const createBriefMutation = trpc.edit.addBrief.useMutation();
    const [richText, setRichText] = useState('');
    const [briefTitle, setBriefTitle] = useState('');
    const [error, setError] = useState<string | null>(null); // State to store error message
    const router = useRouter();

    const handleChange = (value: string) => {
        setRichText(value);
    };

    const handleSave = async () => {
        setError(null); // Reset error state
        try {
            
           // Sanitize HTML content using DOMPurify
          //  const sanitizedContent = DOMPurify.sanitize(richText);
          // const sanitizedContent = sanitizeHtml(richText);

            const result = await createBriefMutation.mutateAsync({
              content: richText,
              title: briefTitle
            });

            if (result?.id) {
                router.push(`/briefs/view/${result.id}`);
            } else {
                setError('Invalid response from server'); // Handle unexpected response from server
            }
        } catch (error) {
            console.error('Error saving content:', error);
            setError('Failed to save content'); // Handle error when saving content
        }
    };

    return (
        <div className="flex flex-col justify-center items-center mt-20">
          {error && <p className="text-red-500 mb-4">{error}</p>} {/* Display error message */}
          <div className="mb-4">
            <label htmlFor="briefTitle" className="text-lg font-semibold">
              Brief Title
            </label>
            <input
              type="text"
              id="briefTitle"
              className="border border-gray-300 rounded px-3 py-2 mt-2 w-full"
              placeholder="Enter Brief Title"
              value={briefTitle}
              onChange={(e) => setBriefTitle(e.target.value)}
            />
          </div>
      
          <div className="flex justify-center mb-4"> 
            <div className="max-w-4xl w-full p-6 bg-white rounded-lg shadow-lg">
              <RichTextEditor
                value={richText}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <button className="border border-black px-4 py-2 rounded bg-green-500 text-white" onClick={handleSave}>
            Save
          </button>
        </div>
      );
};

export default RichTextPage;
