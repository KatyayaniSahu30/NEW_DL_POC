import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { trpc } from '@/utils';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Link from 'next/link';
import RichTextEditor from '@/components/rich-text-editor';
import toast from 'react-hot-toast';

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

  const handlePublishNow = async () => {
    try {
      const currentDate = new Date(); // Get the current date and time
      console.log('Date', currentDate)
      // currentDate.setHours(hours, minutes, 0, 0);

      setPublishedDate(currentDate); // Update the publishedDate state     
      const result = await publishBriefMutation.mutateAsync({ id, publishedOn: currentDate });
      if (result) {
        toast.success(`Brief published successfully on ${currentDate}`);
      }
    } catch (error) {
      toast.success('Failed to publish brief');
    }
  };

  //const indianStandardTimeOffset = 5.5 * 60 * 60 * 1000; // Offset for Indian Standard Time (IST) in milliseconds (5.5 hours ahead of UTC)

  // const handlePublishNow = async () => {
  //   try {
  //     const currentDateIST = new Date(Date.now() + indianStandardTimeOffset).toISOString(); // Get current date/time in IST
  //     const result = await publishBriefMutation.mutateAsync({ id, publishedOn: currentDateIST });
  //     if (result) {
  //       toast.success(`Brief published successfully on ${currentDateIST}`);
  //     }
  //   } catch (error) {
  //     toast.success('Failed to publish brief');
  //   }
  // };


  const handleColor = (time: Date) => {
    return time.getHours() > 12 ? "text-success" : "text-error";
  };

  const handleSave = async () => {
    try {
      // Perform update operation 
      await updateBriefMutation.mutateAsync({
        id,
        title: briefTitle,
        draftContent: richText,
      });
      toast.success('Data saved successfully');

      // Check if briefData exists and if it is scheduled for publishing later
      if (briefData && briefData.publishedLater !== null) {
        toast.success('Brief is scheduled to publish later');
        return; // Do not navigate to view page
      }


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
        toast.error('Invalid future date');
        return;
      }

      const result = await publishLaterBriefMutation.mutateAsync({
        id,
        publishedLater: futureDate.toISOString()
      });

      if (result) {
        toast.success('Publish Date Saved for Later');
      }
    } catch (error) {
      console.error('Error saving publish date for later:', error);
      toast.error('Failed to save publish date for later');
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
          {/* <div className="relative"> */}
          <span className="top-full left-0 text-red-600 text-md mt-1 mr-2">Please select a date</span>
          <DatePicker
            className="input outline-none pl-5 px-4 py-2 mr-5 border-5 border-black-500 rounded bg-blue-200 px-0 py-0 font-bold"
            showTimeSelect
            selected={publishedDate}
            onChange={(date: Date) => setPublishedDate(date)}
            dateFormat="MMM d, yyyy h:mm aa"
            minDate={new Date()}
          />
          {/* Adjust the positioning of the tooltip message */}

          {/* </div> */}

          <button
            className={`border border-black px-4 py-2 rounded mr-2 ${isPublishButtonActive ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}`}
            onClick={handlePublishLater}
            disabled={!isPublishButtonActive}
          >
            Publish Later
          </button>

          <button
            className={`border border-black px-4 py-2 rounded mr-2 ${isPublishButtonActive ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}
            onClick={handlePublishNow}
            disabled={!isPublishButtonActive}
          >
            Publish Now
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
              Save & Draft
            </button>
          </div>
        </div>
      )}
    </div>
  );

};

export default BriefPage;
