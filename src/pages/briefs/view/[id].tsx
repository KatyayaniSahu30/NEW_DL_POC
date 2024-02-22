import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { trpc } from '@/utils';
import Link from 'next/link';
import { ToastContainer, toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const BriefPage: React.FC = () => {
  const router = useRouter();
  const id = parseInt(router.query.id as string); // Parse the id from router.query

  const { data: briefData, error } = trpc.edit.getBriefById.useQuery({ id });
  const publishBriefMutation = trpc.edit.publishBriefById.useMutation();
  const publishLaterBriefMutation = trpc.edit.schedulePublishing.useMutation();

  const [publishedDate, setPublishedDate] = useState(new Date());
  // console.log(typeof publishedDate); 

  const [isPublishButtonActive, setIsPublishButtonActive] = useState(false);

  const indianStandardTimeOffset = 5.5 * 60 * 60 * 1000; // Offset for Indian Standard Time (IST) in milliseconds (5.5 hours ahead of UTC)

  const handlePublishNow = async () => {
    try {
      if (!briefData || briefData.id === null) {
        console.error('Error publishing brief: No brief ID available');
        return;
      }
      const result = await publishBriefMutation.mutateAsync({ id: briefData.id });
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

  const handlePublishLater = async () => {
    try {
      if (!briefData || briefData.id === null) {
        console.error('Error publishing brief later: No brief ID available');
        return;
      }

      // Assuming publishedDate represents the future date and time for scheduling
      const futureDate = new Date(publishedDate);
      console.log(futureDate);

      // Check if the futureDate is valid
      if (isNaN(futureDate.getTime()) || futureDate <= new Date()) {
        console.error('Error publishing brief later: Invalid future date');
        window.alert('Invalid future date');
        return;
      }


      const publishLaterString = publishedDate.toISOString(); // Convert publishedDate to a string
      const result = await publishLaterBriefMutation.mutateAsync({
        id: briefData.id,
        publishedLater: futureDate.toISOString() // Convert futureDate to a string
      });

      console.log('testpublish', result);

      if (result) {
        window.alert('Publish Date Saved for Later');
      }
    } catch (error) {
      console.error('Error saving publish date for later:', error);
      window.alert('Failed to save publish date for later');
      console.log(error);
    }
  };



  useEffect(() => {
    if (briefData && briefData.id !== null) {
      setIsPublishButtonActive(true);
    } else {
      setIsPublishButtonActive(false);
    }
  }, [briefData]);

  useEffect(() => {
    if (error) {
      console.error('Error fetching brief data:', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen p-20">
      {briefData ? (
        <div>
          <div className="flex items-center mb-5">
            <h1 className="mr-4 mt-4 text-3xl">{briefData.title}</h1>
            <div className="ml-auto rounded p-0">
              <DatePicker
                className="input outline-none mr-5  pl-5 border-5 border-black-500 rounded bg-blue-200 px-0 py-0 font-bold"
                showTimeSelect
                selected={publishedDate}
                onChange={(date: Date) => setPublishedDate(date)}
                timeClassName={handleColor}
                dateFormat="MMM d, yyyy h:mm aa"
                minDate={new Date()}
              />
            </div>
          </div>


          <div className="border border-black p-4 h-full">
            <div dangerouslySetInnerHTML={{ __html: briefData.draftContent }} />


          </div>
        </div>
      ) : (
        <p>Loading brief data...</p>
      )}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <button
          className={`border border-black px-4 py-2 rounded mr-2 mt-5 mb-5 ${isPublishButtonActive ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}
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
      <Link href="/briefs/show">
        <button className="border border-black px-4 py-2 rounded bg-gray-300">
          Back to brief list
        </button>
      </Link>
    </div>
  );
};

export default BriefPage;
