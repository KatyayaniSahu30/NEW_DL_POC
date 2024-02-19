import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { trpc } from '@/utils';
import Link from 'next/link';

const BriefPage: React.FC = () => {
  const router = useRouter();
  //const id = router.query.id as string; 
  const id = parseInt(router.query.id as string); // Parse the id from router.query

  const { data: briefData, error } = trpc.edit.getBriefById.useQuery({ id });


  useEffect(() => {
    if (error) {
      console.error('Error fetching brief data:', error);
    }
  }, [error]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      {briefData ? (
        <div>
          <h1>{briefData.title}</h1>
          {/*dangerouslySetInnerHTML attribute in React is used to render raw HTML content directly into the DOM. It's called "dangerous" because it poses a security risk if used improperly. */}
          <div dangerouslySetInnerHTML={{ __html: briefData.content }} />
        </div>
      ) : (
        <p>Loading brief data...</p>
      )}
      <Link href="/briefs/show">
        <button className="border border-black px-4 py-2 rounded bg-gray-300 mt-6">
          Back to brief list
        </button>
      </Link>
    </div>
  );

};

export default BriefPage;
