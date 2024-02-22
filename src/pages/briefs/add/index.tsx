import React, { useState, useEffect } from 'react';
import RichTextEditor from '@/components/rich-text-editor';
import router, { useRouter } from 'next/router';
import { trpc } from '@/utils';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const RichTextPage: React.FC = () => {
  const createBriefMutation = trpc.edit.saveAndDraftBrief.useMutation();
  const [richText, setRichText] = useState('');
  const [briefTitle, setBriefTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  // const [publishedDate, setPublishedDate] = useState(new Date());
  // const [isIdFetched, setIsIdFetched] = useState(false);
  // const [briefId, setBriefId] = useState<string | null>(null);



  const handleChange = (value: string) => {
    setRichText(value);
  };

  // const handleColor = (time: Date) => {
  //   return time.getHours() > 12 ? "text-success" : "text-error";
  // };

  const handleSave = async () => {
    setError(null);
    // Check if the title or brief content is empty
    if (!briefTitle.trim() || !richText.trim()) {
      window.alert('Please fill in the title and brief content');
      return;
    }
    try {
      const result = await createBriefMutation.mutateAsync({
        draftContent: richText,
        title: briefTitle
      });


      if (result?.id) {
        window.alert('Draft saved successfully');
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
      <div className="flex justify-center mb-4">
        <h1 className="mt-5 mr-2">Brief Title</h1>
        <input
          type="text"
          id="briefTitle"
          className="border border-gray-300 rounded px-3 py-2 mt-3 mr-2"
          placeholder="Enter Brief Title"
          value={briefTitle}
          onChange={(e) => setBriefTitle(e.target.value)}
        />
        {/* <DatePicker
          className="input mt-3 ml-3"
          showTimeSelect
          selected={publishedDate}
          onChange={(date: Date) => setPublishedDate(date)}
          timeClassName={handleColor}
          dateFormat="MMM d, yyyy h:mm aa"
        /> */}
      </div>

      <div className="flex justify-center mb-4 w-full">
        <div className="w-50 p-6 bg-white rounded-lg shadow-lg">
          <RichTextEditor
            value={richText}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="flex justify-center">
        <button className="border border-black px-4 py-2 rounded bg-green-500 text-white mr-2" onClick={handleSave}>
          Save & Draft
        </button>
      </div>
    </div>
  );
};

export default RichTextPage;
