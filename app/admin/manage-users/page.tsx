/* eslint-disable @typescript-eslint/no-explicit-any */
// app/admin/manage-users/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton'; // Assuming you have a skeleton component
import { toast } from 'sonner'; // Assuming you use a toast notification library like sonner
import Link from 'next/link';

interface UserData {
  _id: string;
  name: string;
  email: string;
  isProfileComplete: boolean;
  isApproved: boolean;
  committee?: string;
  portfolio?: string;
  class?: string;
  school?: string;
}

export default function ManageUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simple admin check: This should ideally be based on a 'role' field in your User model
  // For now, it checks if the email matches a specific admin email (e.g., from .env)
  const isAdmin = session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL || session?.user?.email === 'admin@example.com';

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || !isAdmin) {
      toast.error("You don't have permission to access this page.");
      router.push('/dashboard'); // Redirect unauthorized users
      return;
    }

    fetchUsers();
  }, [session, status, router, isAdmin]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/users'); // You'll need to create this API endpoint too
      if (!res.ok) {
        throw new Error('Failed to fetch users');
      }
      const data: UserData[] = await res.json();
      setUsers(data);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to load users.');
      toast.error('Failed to load users: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleApproval = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/toggle-approval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, isApproved: !currentStatus }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to toggle approval status');
      }

      toast.success(`User approval status updated!`);
      // Update the local state immediately for a snappier UI
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === userId ? { ...user, isApproved: !currentStatus } : user
        )
      );
    } catch (err: any) {
      console.error('Error toggling approval:', err);
      toast.error('Failed to update approval status: ' + (err.message || 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8 pt-24 min-h-screen bg-gray-100">
        <h1 className="text-4xl font-bold mb-8 text-[#1A522A]">Manage Users</h1>
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-20 w-full mb-4" />
        <Skeleton className="h-20 w-full mb-4" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 pt-24 min-h-screen bg-gray-100 text-red-600">
        <h1 className="text-4xl font-bold mb-8 text-[#1A522A]">Manage Users</h1>
        <p>Error: {error}</p>
        <Button onClick={fetchUsers} className="mt-4 bg-[#1A522A] hover:bg-[#2E8B57] text-white">
          Retry
        </Button>
      </div>
    );
  }

  if (!isAdmin) {
      return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
              <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full text-[#1A522A]">
                  <h2 className="text-3xl font-bold mb-4">Access Denied</h2>
                  <p className="text-gray-700 mb-6">You do not have the necessary permissions to view this page.</p>
                  <Link href="/dashboard" passHref>
                      <Button className="bg-[#1A522A] hover:bg-[#2E8B57] text-white px-6 py-3 rounded-md">
                          Go to Dashboard
                      </Button>
                  </Link>
              </div>
          </div>
      );
  }

  return (
    <div className="container mx-auto p-8 pt-24 min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8 text-[#1A522A]">Manage Users</h1>

      {users.length === 0 ? (
        <p className="text-gray-600">No users found.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profile Complete
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approved
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.isProfileComplete ? 'Yes' : 'No'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Switch
                        id={`approve-switch-${user._id}`}
                        checked={user.isApproved}
                        onCheckedChange={() => handleToggleApproval(user._id, user.isApproved)}
                        disabled={!user.isProfileComplete} // Can only approve if profile is complete
                        className={`${user.isApproved ? 'bg-[#2E8B57]' : 'bg-gray-300'}`}
                      />
                      <Label htmlFor={`approve-switch-${user._id}`} className="ml-2">
                        {user.isApproved ? 'Approved' : 'Not Approved'}
                      </Label>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.committee && <p>Comm: {user.committee}</p>}
                    {user.portfolio && <p>Port: {user.portfolio}</p>}
                    {user.class && <p>Class: {user.class}</p>}
                    {user.school && <p>School: {user.school}</p>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}