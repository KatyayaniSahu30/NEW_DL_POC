import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { trpc } from '@/utils';
import RichTextEditor from '@/components/rich-text-editor';
import Link from 'next/link';

const BriefPage: React.FC = () => {
  const router = useRouter();
  const id = parseInt(router.query.id as string); // Parse the id from router.query
  const [richText, setRichText] = useState('');
  const [briefTitle, setBriefTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const updateBriefMutation = trpc.edit.updateBrief.useMutation();

  const { data: briefData, error } = trpc.edit.getBriefById.useQuery({ id });

  useEffect(() => {
    if (briefData) {
      setBriefTitle(briefData.title); // Set the brief title
      setRichText(briefData.draftContent);
      setIsLoading(false);
    }
    if (error) {
      console.error('Error fetching brief data:', error);
      setIsLoading(true);
    }
  }, [briefData, error]);

  const handleSave = async () => {
    // Send the updated draftContent to your API
    try {
      // Perform update operation 
      await updateBriefMutation.mutateAsync({
        id,
        title: briefTitle,
        draftContent: richText,
      });
      // Redirect to the view page after update
      router.push(`/briefs/view/${id}`);
    } catch (error) {
      console.error('Error updating draftContent:', error);
    }
  };

  return (
    <div>
      {isLoading ? (
        <p>Loading brief data...</p>
      ) : (
        <div className="min-h-screen p-20">
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
