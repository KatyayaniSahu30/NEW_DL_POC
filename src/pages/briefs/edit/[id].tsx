import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { trpc } from '@/utils';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Link from 'next/link';
import RichTextEditor from '@/components/rich-text-editor';

const BriefPage: React.FC = () => {
  const router = useRouter();
  const id = parseInt(router.query.id as string); // Parse the id from router.query
  const [richText, setRichText] = useState('');
  const [briefTitle, setBriefTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const updateBriefMutation = trpc.edit.updateBrief.useMutation();
  const publishBriefMutation = trpc.edit.publishBriefById.useMutation();
  const publishLaterBriefMutation = trpc.edit.schedulePublishing.useMutation();

  const [publishedDate, setPublishedDate] = useState(new Date());
  const [isPublishButtonActive, setIsPublishButtonActive] = useState(false);

  const indianStandardTimeOffset = 5.5 * 60 * 60 * 1000; // Offset for Indian Standard Time (IST) in milliseconds (5.5 hours ahead of UTC)

  const handlePublishNow = async () => {
    try {
      const result = await publishBriefMutation.mutateAsync({ id });
      if (result) {
        const currentDateIST = new Date(Date.now() + indianStandardTimeOffset).toISOString(); // Get current date/time in IST
        window.alert(`Brief published successfully on ${currentDateIST}`);
      }
    } catch (error) {
      window.alert('Failed to publish brief');
    }
  };

  const handleColor = (time: Date) => {
    return time.getHours() > 12 ? "text-success" : "text-error";
  };

  const handleSave = async () => {
    // Send the updated draftContent to your API
    try {
      // Perform update operation 
      await updateBriefMutation.mutateAsync({
        id,
        title: briefTitle,
        draftContent: richText,
      });
      window.alert('Data saved successfully');
      // Redirect to the view page after update
      router.push(`/briefs/view/${id}`);
    } catch (error) {
      console.error('Error updating draftContent:', error);
    }
  };

  const handlePublishLater = async () => {
    try {
      const futureDate = new Date(publishedDate);
      if (isNaN(futureDate.getTime()) || futureDate <= new Date()) {
        console.error('Error publishing brief later: Invalid future date');
        window.alert('Invalid future date');
        return;
      }

      const result = await publishLaterBriefMutation.mutateAsync({
        id,
        publishedLater: futureDate.toISOString()
      });

      if (result) {
        window.alert('Publish Date Saved for Later');
      }
    } catch (error) {
      console.error('Error saving publish date for later:', error);
      window.alert('Failed to save publish date for later');
    }
  };

  const { data: briefData, error } = trpc.edit.getBriefById.useQuery({ id });

  useEffect(() => {
    if (briefData && briefData.id !== null) {
      setIsPublishButtonActive(true);
      setBriefTitle(briefData.title);
      setRichText(briefData.draftContent);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [briefData, error]);
  return (
    <div className="min-h-screen p-5 flex flex-col items-center">
      <h1 className="text-4xl font-bold">Edit Brief</h1>
      <div className="w-full flex justify-between items-center">
        <Link href="/briefs/show">
          <button className="border border-black px-4 py-2 rounded bg-gray-300">
            Back
          </button>
        </Link>
        <div className="w-full flex justify-end">
          <DatePicker
            className="input outline-none pl-5 px-4 py-2 mr-5 border-5 border-black-500 rounded bg-blue-200 px-0 py-0 font-bold"
            showTimeSelect
            selected={publishedDate}
            onChange={(date: Date) => setPublishedDate(date)}
            timeClassName={handleColor}
            dateFormat="MMM d, yyyy h:mm aa"
            minDate={new Date()}
          />

          <button
            className={`border border-black px-4 py-2 rounded mr-2 ${isPublishButtonActive ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}
            onClick={handlePublishNow}
            disabled={!isPublishButtonActive}
          >
            Publish Now
          </button>

          <button
            className={`border border-black px-4 py-2 rounded mr-2 ${isPublishButtonActive ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}`}
            onClick={handlePublishLater}
            disabled={!isPublishButtonActive}
          >
            Publish Later
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center">
          <p>Loading brief data...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="h-full max-w-xxl p-8">
            <div className="mb-4">
              <label htmlFor="briefTitle" className="text-lg font-semibold mr-3">
                Brief Title
              </label>
              <input
                type="text"
                id="briefTitle"
                className="border border-gray-300 rounded px-3 py-2 mt-2 w-50"
                placeholder="Enter Brief Title"
                value={briefTitle}
                onChange={(e) => setBriefTitle(e.target.value)}
              />
            </div>

            <div className="w-full p-6">
              <RichTextEditor
                value={richText}
                onChange={setRichText}
              />
            </div>

            <button className="border border-black px-4 py-2 rounded bg-green-500 text-white mt-4" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );




};

export default BriefPage;
