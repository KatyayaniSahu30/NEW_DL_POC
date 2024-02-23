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

  return (
    <div className="p-10 flex flex-col items-center justify-center">
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
        <div className="border border-black p-4">
          <div dangerouslySetInnerHTML={{ __html: briefData?.draftContent ?? '' }} />
        </div>
      </div>
    </div>
  );
};

export default BriefPage;
