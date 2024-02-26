import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { trpc } from '@/utils';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const BriefPage: React.FC = () => {
  const router = useRouter();
  const id = parseInt(router.query.id as string); // Parse the id from router.query
  const [isContentVisible, setIsContentVisible] = useState(false); // State to manage content visibility
  const [isAlertShown, setIsAlertShown] = useState(false);

  const { data: briefData, error } = trpc.edit.getBriefById.useQuery({ id });

  useEffect(() => {
    if (briefData && !isAlertShown) {
      // Check if the content is scheduled for later publishing
      if (briefData.publishedLater && new Date(briefData.publishedLater) > new Date()) {
        setIsContentVisible(false); // Set content visibility to false if it's scheduled for later publishing
        toast.success('Content is scheduled for later publishing.');
      } else {
        setIsContentVisible(true); // Set content visibility to true if it's published or not scheduled
        if (briefData.isPublished) {
          toast.success('Content is already published.');
        }
      }
      setIsAlertShown(true); // Set isAlertShown to true after showing the alert
    }
  }, [briefData]); // Remove isAlertShown from the dependency array


  return (
 
    <div className="p-10 flex flex-col items-center justify-center">
         <Toaster position="bottom-center" />
      <h1 className="text-4xl font-bold">Brief Overview</h1>
      <div className="w-full">
        {/* Title and Back Button */}
        <div className="flex justify-between items-center mb-5">

          <div className="flex items-center">
            <Link href="/briefs/show">
              <button className="border border-black px-4 py-2 rounded bg-gray-300">
                Back
              </button>
            </Link>
          </div>
        </div>

        {/* Brief Title */}
        <div className="flex justify-left items-center mb-5">
          <h1 className="text-3xl font-bold">{briefData?.title}</h1>
        </div>

        {/* Brief Content */}
        {isContentVisible && ( // Check if the content should be displayed
          <div className="border border-black p-4">
            <div dangerouslySetInnerHTML={{ __html: briefData?.draftContent ?? '' }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default BriefPage;



// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';
// import { trpc } from '@/utils';
// import Link from 'next/link';
// import { ToastContainer, toast } from 'react-toastify';
// import DatePicker from 'react-datepicker';
// import "react-datepicker/dist/react-datepicker.css";

// const BriefPage: React.FC = () => {
//   const router = useRouter();
//   const id = parseInt(router.query.id as string); // Parse the id from router.query

//   const { data: briefData, error } = trpc.edit.getBriefById.useQuery({ id });

//   return (
//     <div className="p-10 flex flex-col items-center justify-center">
//       <h1 className="text-4xl font-bold">Brief Overview</h1>
//       <div className="w-full">
//         {/* Title and Back Button */}
//         <div className="flex justify-between items-center mb-5">

//           <div className="flex items-center">
//             <Link href="/briefs/show">
//               <button className="border border-black px-4 py-2 rounded bg-gray-300">
//                 Back
//               </button>
//             </Link>
//           </div>
//         </div>

//         {/* Brief Title */}
//         <div className="flex justify-left items-center mb-5">
//           <h1 className="text-3xl font-bold">{briefData?.title}</h1>
//         </div>

//         {/* Brief Content */}
//         <div className="border border-black p-4">
//           <div dangerouslySetInnerHTML={{ __html: briefData?.draftContent ?? '' }} />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BriefPage;
