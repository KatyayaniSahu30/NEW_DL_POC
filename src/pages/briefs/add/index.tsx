import React, { useState } from 'react';
import RichTextEditor from '@/components/rich-text-editor';
import router, { useRouter } from 'next/router';
import { trpc } from '@/utils';
import DatePicker from 'react-datepicker';
import toast, { Toaster } from 'react-hot-toast';
import "react-datepicker/dist/react-datepicker.css";

const RichTextPage: React.FC = () => {
  const createBriefMutation = trpc.edit.saveAndDraftBrief.useMutation();
  const [richText, setRichText] = useState('');
  const [briefTitle, setBriefTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleChange = (value: string) => {
    setRichText(value);
  };

  const handleSave = async () => {
    setError(null);
    // Check if the title or brief content is empty
    if (!briefTitle.trim() || !richText.trim()) {
      toast.success('Please fill in the title and brief content');
      return;
    }
    try {
      const result = await createBriefMutation.mutateAsync({
        draftContent: richText,
        title: briefTitle
      });

      if (result?.id) {
        toast.success('Draft saved successfully');
        router.push(`/briefs/view/${result.id}`);
      } else {
        setError('Invalid response from server');
      }
    } catch (error) {
      console.error('Error saving draftContent:', error);
      setError('Failed to save draftContent');
    }
  };

  return (
    <div className="flex flex-col justify-center items-center mt-20">
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <h1 className="text-4xl font-bold mb-6">Add Brief</h1>

      <div className="flex justify-center mb-4">
        <label htmlFor="briefTitle" className="text-lg font-bold mr-3 mt-5">Brief Title</label>
        <input
          type="text"
          id="briefTitle"
          className="border border-gray-300 rounded px-3 py-2 mt-3 mr-2"
          placeholder="Enter Brief Title"
          value={briefTitle}
          onChange={(e) => setBriefTitle(e.target.value)}
        />
      </div>

      <div className="flex justify-center mt-4 w-full mb-4">
        <div  className="w-2/3 h-[200px] p-6 bg-gray-100 rounded-lg shadow-lg">
          <RichTextEditor 
            value={richText}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="flex justify-center">
        <button className="border border-black px-4 py-2 rounded bg-green-500 text-white font-bold mr-2" onClick={handleSave}>
          Save & Draft
        </button>
      </div>
    </div>
  );
};

export default RichTextPage;
