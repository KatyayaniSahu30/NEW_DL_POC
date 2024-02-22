import React from 'react';
import Link from 'next/link';
import { trpc } from '@/utils';
import { IoIosEye } from "react-icons/io";
import { CiEdit } from "react-icons/ci";

const Test = () => {
    // Fetch brief data using TRPC
    const { data: briefData, error } = trpc.edit.getAll.useQuery();
    // const { data: briefData, error } = useQuery(['getAll', { input: { sortField: 'title', sortOrder: 'asc' } }]);

    return (
        <div className="p-20  mx-auto h-screen">
            <div>
                <h1 className="text-4xl font-bold mb-2"> List of Briefs</h1>

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

                    <div className="overflow-x-auto w-full">
                        <table className="border-collapse border border-black mt-10 w-full max-w-xxl">
                            <thead>
                                <tr>
                                    <th className="border border-black px-4 py-2">Seq No.</th>
                                    <th className="border border-black px-4 py-2">Brief Title</th>
                                    <th className="border border-black px-4 py-2">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Map through briefData to render table rows */}
                                {briefData.fetchAllBriefs.map((brief, index) => (
                                    brief.publishedOn !== null ? (
                                        <tr key={brief.id} className="border border-black  hover:bg-gray-200">
                                            <td className="border border-black px-4 py-2 text-center">{index + 0}</td>
                                            {/* <td className="border border-black px-4 py-2">{brief.id}</td> */}
                                            <td className="border border-black px-4 py-2 text-center">{brief.title}</td>
                                            {/* Add buttons for View and Edit */}
                                            <td className="px-4 py-2 text-center flex justify-center items-center">
                                                {/* View Button */}
                                                <Link href={`/briefs/view/${brief.id}`} className="mr-2">
                                                    <IoIosEye className="text-blue-500 text-lg" />
                                                </Link>
                                                {/* Edit Button */}
                                                <Link href={`/briefs/edit/${brief.id}`}>
                                                    <CiEdit  className="text-pink-500 text-lg" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ) : null
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
