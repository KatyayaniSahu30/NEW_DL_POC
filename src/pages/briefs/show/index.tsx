import React from 'react';
import Link from 'next/link';
import { trpc } from '@/utils';

const Test = () => {
    // Fetch brief data using TRPC
    const { data: briefData, error } = trpc.edit.getAll.useQuery();

    return (
        <div className="flex justify-center items-center h-screen w-full">
            <div>
                <h1>Briefs Listing</h1>

                {/* Use Link to navigate to the add-data page */}
                <Link href="/briefs/add">
                    <button
                        className="border border-black px-4 py-2 rounded bg-green-500 text-white mt-10"
                    >
                        Add New Brief
                    </button>
                </Link>
                <br /><br />

                {/* Check if there is an error fetching data */}
                {error && <p>Error fetching briefs: {error.message}</p>}
                {/* Check if data is loading */}
                {briefData ? (
                     <div className="overflow-x-auto">
                    <table className="border-collapse border border-black mt-10">
                        <thead>
                            <tr>
                                <th className="border border-black px-4 py-2">ID</th>
                                <th className="border border-black px-4 py-2">Brief Title</th>
                                <th className="border border-black px-4 py-2">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Map through briefData to render table rows */}
                            {briefData.fetchAllBriefs.map(brief => (
                                <tr key={brief.id} className="border border-black">
                                    <td className="border border-black px-4 py-2">{brief.id}</td>
                                    <td className="border border-black px-4 py-2">{brief.title}</td>
                                    {/* Add buttons for View and Edit */}
                                    <td className="border border-black px-4 py-2">
                                        {/* View Button */}
                                        <Link href={`/briefs/view/${brief.id}`}>
                                            <button className="border border-black px-2 py-1 rounded bg-blue-500 text-white mr-2">
                                                View
                                            </button>
                                        </Link>
                                        {/* Edit Button */}
                                        <Link href={`/briefs/edit/${brief.id}`}>
                                            <button className="border border-black px-2 py-1 rounded bg-green-500 text-white">
                                                Edit
                                            </button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                ) : (
                    <p>Loading briefs...</p>
                )}
            </div>
        </div>
    );
};

export default Test;
