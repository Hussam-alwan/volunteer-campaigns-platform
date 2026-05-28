"use client";

import {
  Search,
  Plus,
  Edit,
  Trash2,
  Ban,
  X,
  // CheckCircle2,
  Users,
  UserCheck,
  UserX,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/pages/lib/utils";

import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "@/API/User/user.api";
import collegesQueries from "@/API/Colleges/Collegesqueries";
import Pagination from "@/components/layout/Pagination";
import Select from "@/components/layout/Select";
import SegmentedToggle from "@/components/layout/SegmentedToggle";
import useAuthStore from "@/store/auth.store";

import type { IUser } from "@/API/User/User.interfaces";
import type { ICollege } from "@/API/Colleges/Colleges.interfaces";

const getFullName = (u: IUser) => `${u.firstName} ${u.lastName}`;

const initialFormData = {
  studentNumber: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  academicYear: 1,
  college: 1,
  isBanned: false,
};

function UserManagement() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "banned">(
    "all",
  );
  const [collegeFilter, setCollegeFilter] = useState<number | "all">("all");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: collegesResponse } = collegesQueries.useGetColleges({
    page: 0,
    size: 100,
  });
  const colleges: ICollege[] = collegesResponse?.content ?? [];

  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState("");
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  const [formData, setFormData] = useState(initialFormData);

  // FETCH USERS
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await getUsers();
        setUsers(res.content);
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response
          ?.status;

        if (status === 401) {
          logout();
          navigate("/login", { replace: true });
          return;
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [logout, navigate]);

  // FILTER (search + status + college)
  const filteredUsers = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();

    return users.filter((u) => {
      const matchesSearch =
        !q ||
        u.studentNumber.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        getFullName(u).toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && !u.isBanned) ||
        (statusFilter === "banned" && u.isBanned);

      const matchesCollege =
        collegeFilter === "all" || u.college === collegeFilter;

      return matchesSearch && matchesStatus && matchesCollege;
    });
  }, [users, searchTerm, statusFilter, collegeFilter]);

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
      setFormError("");

      const firstName = formData.firstName.trim();
      const lastName = formData.lastName.trim();
      const email = formData.email.trim().toLowerCase();
      const phone = formData.phone.trim();
      const password = formData.password.trim();

      if (!firstName || !lastName || !email || !password) {
        setFormError("Please fill in all required fields.");
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setFormError("Please enter a valid email address.");
        return;
      }

      if (users.some((user) => user.email.toLowerCase() === email)) {
        setFormError("This email is already in use.");
        return;
      }

      if (password.length < 8) {
        setFormError("Password must be at least 8 characters long.");
        return;
      }

      if (!/^\d{10}$/.test(phone)) {
        setFormError("Phone must be exactly 10 digits.");
        return;
      }

      const payload = {
        ...formData,
        firstName,
        lastName,
        email,
        phone,
        password,
        academicYear: Number(formData.academicYear) || 1,
        college: Number(formData.college) || 1,
        isBanned: false,
      };

      const newUser = await createUser(payload);

      setUsers((prev) => [newUser, ...prev]);
      closeModal();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        (err as Error)?.message ||
        "Unable to create user right now.";

      setFormError(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setFormError("");
    setEditingUserId(null);
    setFormData(initialFormData);
  };

  const openCreateModal = () => {
    setEditingUserId(null);
    setFormData(initialFormData);
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (user: IUser) => {
    setEditingUserId(user.userId);
    setFormData({
      studentNumber: user.studentNumber,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      password: "",
      academicYear: user.academicYear,
      college: user.college,
      isBanned: user.isBanned,
    });
    setFormError("");
    setShowModal(true);
  };

  // UPDATE USER
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUserId == null) return;

    try {
      setLoading(true);
      setFormError("");

      const firstName = formData.firstName.trim();
      const lastName = formData.lastName.trim();
      const email = formData.email.trim().toLowerCase();
      const phone = formData.phone.trim();

      if (!firstName || !lastName || !email) {
        setFormError("Please fill in all required fields.");
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setFormError("Please enter a valid email address.");
        return;
      }

      if (
        users.some(
          (user) =>
            user.email.toLowerCase() === email &&
            user.userId !== editingUserId,
        )
      ) {
        setFormError("This email is already in use.");
        return;
      }

      if (!/^\d{10}$/.test(phone)) {
        setFormError("Phone must be exactly 10 digits.");
        return;
      }

      const payload = {
        studentNumber: formData.studentNumber.trim(),
        firstName,
        lastName,
        email,
        phone,
        academicYear: Number(formData.academicYear) || 1,
        college: Number(formData.college) || 1,
        isBanned: formData.isBanned,
      };

      const updated = await updateUser(editingUserId, payload);

      setUsers((prev) =>
        prev.map((u) =>
          u.userId === editingUserId ? { ...u, ...updated } : u,
        ),
      );
      closeModal();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        (err as Error)?.message ||
        "Unable to update user right now.";

      setFormError(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (user: IUser) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${getFullName(user)}?`,
    );

    if (!confirmed) return;

    try {
      await deleteUser(user.userId);
      setUsers((prev) => prev.filter((u) => u.userId !== user.userId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete user.");
    }
  };

  // BAN / UNBAN
  // الباك إند فيه endpoint للحظر فقط (idempotent) ولا يلغي الحظر،
  // لذلك نستخدم تحديث المستخدم (PUT) لقلب حالة isBanned في الاتجاهين.
  const toggleBan = async (user: IUser) => {
    try {
      const updated = await updateUser(user.userId, {
        studentNumber: user.studentNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        academicYear: user.academicYear,
        college: user.college,
        isBanned: !user.isBanned,
      });

      setUsers((prev) =>
        prev.map((u) => (u.userId === user.userId ? { ...u, ...updated } : u)),
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update ban status.");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#5D3FD3] text-white rounded-2xl"
        >
          <Plus className="w-4 h-4" />
          Add New User
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-6 bg-white rounded-2xl border border-gray-300">
          <div className="flex items-center gap-3">
            <Users className="text-indigo-600" />
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-xl font-bold">{totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-300">
          <div className="flex items-center gap-3">
            <UserCheck className="text-green-600" />
            <div>
              <p className="text-sm text-gray-500">Active Users</p>
              <p className="text-xl font-bold">{activeUsers}</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-300">
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
      <div className="flex flex-wrap gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="relative flex-1 min-w-70 flex items-center gap-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setSearchTerm(searchQuery.trim());
                setCurrentPage(1);
              }
            }}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded2xl outline-none focus:ring-2 focus:ring-[#5D3FD3]/10 text-sm"
          />
          <button
            type="button"
            onClick={() => {
              setSearchTerm(searchQuery.trim());
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-[#5D3FD3] text-white rounded-2xl text-sm hover:opacity-90"
            title="Search"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSearchTerm("");
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-white border border-gray-200 text-gray-600 rounded-2xl text-sm hover:bg-gray-50"
            title="Clear"
          >
            Clear
          </button>
        </div>

        <SegmentedToggle
          className="w-72"
          value={statusFilter}
          onChange={(v) => {
            setStatusFilter(v as "all" | "active" | "banned");
            setCurrentPage(1);
          }}
          options={[
            { value: "all", label: "All" },
            { value: "active", label: "Active" },
            { value: "banned", label: "Banned" },
          ]}
        />

        <Select
          value={collegeFilter}
          onChange={(e) => {
            setCollegeFilter(
              e.target.value === "all" ? "all" : Number(e.target.value),
            );
            setCurrentPage(1);
          }}
          title="Filter by college"
        >
          <option value="all">All colleges</option>
          {colleges.map((c) => (
            <option key={c.collegeId} value={c.collegeId}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      {/* TABLE */}

      <div className="bg-white rounded-xl border border-gray-300 overflow-hidden ">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Users</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-white">
            <tr>
              <th className="p-3 text-left text-xs text-gray-500 ">Student</th>
              <th className="p-3 text-left text-gray-500 text-xs ">Email</th>
              <th className="p-3 text-left text-xs text-gray-500">Phone</th>
              <th className=" p-3 text-left text-xs text-gray-500">Year</th>
              <th className="text-xs text-gray-500">Status</th>
              <th className=" p-3 text-left text-xs text-gray-500">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((u) => (
              <tr key={u.userId} className="border-t border-gray-300">
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
                    type="button"
                    onClick={() => toggleBan(u)}
                    className="p-2 bg-gray-100 rounded"
                    title={u.isBanned ? "Unban user" : "Ban user"}
                  >
                    <Ban className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditModal(u)}
                    className="p-2 bg-gray-100 rounded"
                    title="Edit user"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteUser(u)}
                    className="p-2 bg-red-100 text-red-600 rounded"
                    title="Delete user"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PAGINATION */}
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredUsers.length}
          pageSize={itemsPerPage}
          itemLabel="users"
        />
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <form
            onSubmit={editingUserId ? handleUpdate : handleCreate}
            className="bg-white p-6 rounded-xl w-full max-w-md space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingUserId ? "Edit User" : "Add New User"}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
                aria-label="Close user dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                {formError}
              </p>
            )}

            <input
              placeholder="Student Number"
              value={formData.studentNumber}
              className="w-full border border-gray-300 p-2 rounded"
              onChange={(e) =>
                setFormData({ ...formData, studentNumber: e.target.value })
              }
            />

            <input
              placeholder="First Name"
              value={formData.firstName}
              className="w-full border border-gray-300 p-2 rounded"
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
            />

            <input
              placeholder="Last Name"
              value={formData.lastName}
              className="w-full border border-gray-300 p-2 rounded"
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
            />

            <input
              placeholder="Email"
              type="email"
              value={formData.email}
              className="w-full border p-2 rounded"
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />

            {!editingUserId && (
              <input
                placeholder="Password"
                type="password"
                value={formData.password}
                className="w-full border border-gray-300 p-2 rounded"
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            )}

            <input
              placeholder="Phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={formData.phone}
              className="w-full border border-gray-300 p-2 rounded"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  phone: e.target.value.replace(/\D/g, ""),
                })
              }
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5D3FD3] text-white p-2 rounded disabled:opacity-60"
            >
              {loading
                ? editingUserId
                  ? "Saving..."
                  : "Creating..."
                : editingUserId
                  ? "Save Changes"
                  : "Create"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
