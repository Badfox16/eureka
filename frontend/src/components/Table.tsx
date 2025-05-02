import React from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

const Table: React.FC = () => {
  const dummyData: User[] = [
    { id: 1, name: 'John Doe', email: 'john.doe@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com' },
    { id: 3, name: 'Peter Jones', email: 'peter.jones@example.com' },
  ];

  return (
    <table className="min-w-full border border-gray-300">
      <thead className="bg-gray-100">
        <tr>
          <th className="py-2 px-4 border-b border-gray-300 text-left">ID</th>
          <th className="py-2 px-4 border-b border-gray-300 text-left">Name</th>
          <th className="py-2 px-4 border-b border-gray-300 text-left">Email</th>
        </tr>
      </thead>
      <tbody>
        {dummyData.map((user) => (
          <tr key={user.id} className="hover:bg-gray-50">
            <td className="py-2 px-4 border-b border-gray-300">{user.id}</td>
            <td className="py-2 px-4 border-b border-gray-300">{user.name}</td>
            <td className="py-2 px-4 border-b border-gray-300">{user.email}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;