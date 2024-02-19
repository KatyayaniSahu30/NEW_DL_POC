import React, { useState, useEffect } from 'react';
import { trpc } from '../../src/utils';

export default function IndexPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nameToUpdate, setNameToUpdate] = useState('');
  const [emailToUpdate, setEmailToUpdate] = useState('');
  const [userIdToUpdate, setUserIdToUpdate] = useState('');
  const [userIdToDelete, setUserIdToDelete] = useState('');

  // Assuming trpc is your tRPC client instance
  const displayTextResult = trpc.example.displayText.useQuery({ text: "Sample Text" });

  console.log(displayTextResult.data?.displayedText);

  const createUserTask = trpc.example.createUser.useMutation();
  const fetchAllUsersTask = trpc.example.getAll.useQuery();
  const updateUserMutation = trpc.example.updateUser.useMutation();
  const deleteUserMutation = trpc.example.deleteUser.useMutation();

  const handleCreateUser = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    if (!name || !email) {
      alert('Name and Email are required!');
      return;
    }
    
    if (!/^[a-zA-Z\s]*$/.test(name)) {
      alert('Name should contain only alphabets and spaces!');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address!');
      return;
    }


    await createUserTask.mutate({ name, email });
    setName('');
    setEmail('');
    alert('User is created')
  };

  useEffect(() => {
    fetchAllUsersTask.refetch();
  }, [fetchAllUsersTask]);

  if (fetchAllUsersTask.error) {
    return <div>Error fetching data</div>;
  }

  if (fetchAllUsersTask.isLoading) {
    return <div>Loading...</div>;
  }

  const handleUpdateUser = async () => {
    try {
      if (!userIdToUpdate || !nameToUpdate || !emailToUpdate) {
        alert('User ID, Name, and Email are required!');
        return;
      }

      await updateUserMutation.mutateAsync({
        id: parseInt(userIdToUpdate),
        name: nameToUpdate,
        email: emailToUpdate,
      });

      setNameToUpdate('');
      setEmailToUpdate('');
      setUserIdToUpdate('');
      fetchAllUsersTask.refetch();
      alert('Updated!');
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteUser = async () => {
    try {
      if (!userIdToDelete) {
        alert('User ID is required!');
        return;
      }

      await deleteUserMutation.mutateAsync({
        id: parseInt(userIdToDelete),
      });

      setUserIdToDelete('');
      fetchAllUsersTask.refetch();
      alert('Deleted!');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-1/2 mx-auto">
      {/* Add User */}
      <h2 className="mb-4 text-2xl font-bold">Add User Data</h2>
      <form onSubmit={handleCreateUser} className="rounded-lg p-8 shadow-md border border-black mb-10">
        <div className="mb-4">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-1/2 p-2 ml-5 mb-2 border border-gray-300"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="text"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-1/2 p-2 ml-6 mb-2 border border-gray-300"
          />
        </div>
        <button type="submit" className="p-2 bg-blue-500 text-white rounded">
          Create User
        </button>
      </form>
      
      {/* Display All Users */}
      <div>
        <h2 className="mb-4 text-2xl font-bold">List of All Users</h2>
        {/* <div className="rounded-lg p-8 shadow-md border border-black"> */}
        <table className="w-full border border-black">
          <thead>
            <tr className="bg-pink-400 text-white">
              <th className="border border-black px-4 py-2">ID</th>
              <th className="border border-black px-4 py-2">Name</th>
              <th className="border border-black px-4 py-2">Email</th>
            </tr>
          </thead>
          <tbody>
          {fetchAllUsersTask.data.fetchAllUsers.map((user: any) => (
              <tr key={user.id} className="border-b border-black">
                <td className="border border-black px-4 py-2">{user.id}</td>
                <td className="border border-black px-4 py-2">{user.name}</td>
                <td className="border border-black px-4 py-2">{user.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* </div> */}

         {/* Update User  */}
        <div className="mb-8 mt-8">
          <h2 className="mb-4 text-2xl font-bold">Update User</h2>
          <div className="mb-4 flex">
            <input
              placeholder="Enter user id to update"
              className="mr-2 border border-gray-300 p-2"
              value={userIdToUpdate}
              onChange={(e) => setUserIdToUpdate(e.target.value)}
            />
            <input
              className=" ml-5 mr-2 border border-gray-300 p-2"
              placeholder="Name to update"
              value={nameToUpdate}
              onChange={(e) => setNameToUpdate(e.target.value)}
            />
            <input
              className="ml-5 border border-gray-300 p-2"
              placeholder="Email to update"
              value={emailToUpdate}
              onChange={(e) => setEmailToUpdate(e.target.value)}
            />
          </div>

          <button
            className="mt-2 rounded bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
            onClick={handleUpdateUser}
          >
            Update User
          </button>
        </div>

        {/* Delete User  */} 
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-bold">Delete User</h2>
          <input
            placeholder="Enter user id to delete"
            className="mr-2 border border-gray-300 p-2"
            value={userIdToDelete}
            onChange={(e) => setUserIdToDelete(e.target.value)}
          />
          <button
            className="mt-2 ml-2 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            onClick={handleDeleteUser}
          >
            Delete User
          </button>
        </div>
      </div>
    </div>
  );
}
