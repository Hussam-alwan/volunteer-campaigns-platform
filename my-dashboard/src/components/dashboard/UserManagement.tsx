"use client";

import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Ban,
  CheckCircle2,
  Users,
  UserCheck,
  UserX,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/pages/lib/utils";

import { getUsers, createUser, updateUser, banUser } from "@/API/User/user.api";

interface IUser {
  userId: string;
  studentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  academicYear: number;
  college: number;
  isBanned: boolean;
}

const getFullName = (u: IUser) => `${u.firstName} ${u.lastName}`;

function UserManagement() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    studentNumber: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    academicYear: 1,
    college: 1,
  });

  // FETCH USERS
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await getUsers();
        setUsers(res.content);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // FILTER
  const filteredUsers = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();

    if (!q) return users;

    return users.filter((u) => {
      return (
        u.studentNumber.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        getFullName(u).toLowerCase().includes(q)
      );
    });
  }, [users, searchTerm]);

  // PAGINATION
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const safePage = Math.min(currentPage, totalPages || 1);

  const paginated = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, safePage]);

  // STATS
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => !u.isBanned).length;
  const bannedUsers = users.filter((u) => u.isBanned).length;

  // CREATE USER
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = {
        ...formData,
      };

      const newUser = await createUser(payload);

      setUsers((prev) => [newUser, ...prev]);
      setShowModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // BAN / UNBAN
  const toggleBan = async (user: IUser) => {
    try {
      const updated = await banUser(user.userId);

      setUsers((prev) =>
        prev.map((u) => (u.userId === user.userId ? updated : u)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#5D3FD3] text-white rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Add New User
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border">
          <div className="flex items-center gap-3">
            <Users className="text-indigo-600" />
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-xl font-bold">{totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border">
          <div className="flex items-center gap-3">
            <UserCheck className="text-green-600" />
            <div>
              <p className="text-sm text-gray-500">Active Users</p>
              <p className="text-xl font-bold">{activeUsers}</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border">
          <div className="flex items-center gap-3">
            <UserX className="text-red-600" />
            <div>
              <p className="text-sm text-gray-500">Banned Users</p>
              <p className="text-xl font-bold">{bannedUsers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button
          onClick={() => setSearchTerm(searchQuery)}
          className="px-4 py-2 bg-[#5D3FD3] text-white rounded-lg"
        >
          Search
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Student</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Year</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((u) => (
              <tr key={u.userId} className="border-t">
                <td className="p-3">{getFullName(u)}</td>
                <td>{u.email}</td>
                <td>{u.phone}</td>
                <td>{u.academicYear}</td>

                <td>
                  <span
                    className={cn(
                      "px-2 py-1 rounded-full text-xs",
                      u.isBanned
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600",
                    )}
                  >
                    {u.isBanned ? "Banned" : "Active"}
                  </span>
                </td>

                <td className="flex gap-2 p-2">
                  <button
                    onClick={() => toggleBan(u)}
                    className="p-2 bg-gray-100 rounded"
                  >
                    <Ban className="w-4 h-4" />
                  </button>

                  <button className="p-2 bg-gray-100 rounded">
                    <Edit className="w-4 h-4" />
                  </button>

                  <button className="p-2 bg-red-100 text-red-600 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Page {safePage} of {totalPages}
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-2 border rounded"
          >
            <ChevronLeft />
          </button>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-2 border rounded"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <form
            onSubmit={handleCreate}
            className="bg-white p-6 rounded-xl w-400px space-y-3"
          >
            <input
              placeholder="Student Number"
              className="w-full border p-2 rounded"
              onChange={(e) =>
                setFormData({ ...formData, studentNumber: e.target.value })
              }
            />

            <input
              placeholder="First Name"
              className="w-full border p-2 rounded"
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
            />

            <input
              placeholder="Last Name"
              className="w-full border p-2 rounded"
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
            />

            <input
              placeholder="Email"
              className="w-full border p-2 rounded"
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />

            <input
              placeholder="Phone"
              className="w-full border p-2 rounded"
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />

            <button
              type="submit"
              className="w-full bg-[#5D3FD3] text-white p-2 rounded"
            >
              Create
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
