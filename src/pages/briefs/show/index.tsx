import React, { useState } from 'react';
import Link from 'next/link';
import { trpc } from '@/utils';
import { IoIosEye } from "react-icons/io";
import { CiEdit } from "react-icons/ci";
import { FaPlusCircle } from "react-icons/fa";

const Test = () => {
    // Fetch brief data using TRPC
    const { data: briefData, error } = trpc.edit.getAll.useQuery();
    // State variables
    const [selectedOption, setSelectedOption] = useState('Published Content');

    // Function to filter brief data based on the selected option
    const filterBriefData = (option: string) => {
        if (option === 'Draft Content') {
            return briefData?.fetchAllBriefs.filter(brief => brief.isDraft === true);
        } else if (option === 'Published Content') {
            return briefData?.fetchAllBriefs.filter(brief => brief.isPublished === true);
        }
        else if (option === 'Upcoming Content') {
            return briefData?.fetchAllBriefs.filter(brief => brief.publishedLater !== null);
        }
        return [];
    };


    // Render table rows based on the filtered brief data
    const renderTableRows = () => {
        const filteredData = filterBriefData(selectedOption);

        // Check if filteredData is not undefined
        if (filteredData) {
            return filteredData.map((brief, index) => (
                <tr key={brief.id} className="border border-black hover:bg-gray-200">
                    <td className="border border-black px-4 py-2 text-center">{index + 1}</td>
                    <td className="border border-black px-4 py-2 text-center">{brief.title}</td>
                    <td className="px-4 py-2 text-center flex justify-center items-center">
                        {/* View Button */}
                        <Link href={`/briefs/view/${brief.id}`} className="mr-2">
                            <IoIosEye className="text-blue-500 text-lg" />
                        </Link>
                        {/* Edit Button */}
                        <Link href={`/briefs/edit/${brief.id}`}>
                            <CiEdit className="text-pink-500 text-lg" />
                        </Link>
                    </td>
                </tr>
            ));
        } else {
            // Return null or a placeholder if filteredData is undefined
            return null;
        }
    };

    return (
        <div className="p-20 mx-auto h-screen">
            <div>
                <h1 className="text-4xl font-bold mb-6 text-center">Briefs List</h1>

                {/* "Add New Brief" Button */}
                <Link href="/briefs/add">
                    <div className="flex items-center mb-4">
                        <FaPlusCircle className="w-6 h-6 mr-3 text-blue-700" />
                        <span className="text-blue-700 font-semibold text-lg">Add New Brief</span>
                    </div>
                </Link>

                {/* Select Field */}
                <div className="flex items-center mb-4 bg-gray-100 rounded p-2">
                    <label className="text-lg font-semibold mr-3">Choose content:</label>
                    <select
                        className="border border-gray-300 rounded px-3 py-2 bg-white"
                        value={selectedOption}
                        onChange={(e) => setSelectedOption(e.target.value)}
                    >
                        <option value="Published Content">Published Content</option>
                        <option value="Draft Content">Draft Content</option>
                        <option value="Upcoming Content">Upcoming Content</option>
                    </select>
                </div>

                {/* Check if there is an error fetching data */}
                {error && <p>Error fetching briefs: {error.message}</p>}
                {/* Check if data is loading */}
                {briefData ? (
                    <div className="overflow-x-auto w-full">
                        <table className="border-collapse border border-black mt-10 w-full max-w-xxl bg-white">
                            {/* Table headers */}
                            <thead className="bg-blue-400 text-white">
                                <tr>
                                    <th className="border border-black px-4 py-2">Seq No.</th>
                                    <th className="border border-black px-4 py-2">Brief Title</th>
                                    <th className="border border-black px-4 py-2">Action</th>
                                </tr>
                            </thead>
                            {/* Table body with rows */}
                            <tbody>
                                {renderTableRows()}
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
