import axios from "axios";

const BASE_URL = "https://sbc-production.up.railway.app";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * GET ALL USERS (paginated)
 */
export const getUsers = async (page = 0, size = 20) => {
  const res = await api.get(`/api/v1/users`, {
    params: { page, size },
  });

  return res.data;
};

/**
 * CREATE USER
 */
export const createUser = async (data: {
  studentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  academicYear: number;
  college: number;
}) => {
  const res = await api.post(`/api/v1/users`, data);
  return res.data;
};

/**
 * UPDATE USER (full update)
 */
export const updateUser = async (
  id: number,
  data: {
    studentNumber: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    academicYear: number;
    college: number;
  }
) => {
  const res = await api.put(`/api/v1/users/${id}`, data);
  return res.data;
};

/**
 * BAN / UNBAN USER
 * (backend uses PATCH /users/{id}/ban)
 */
export const banUser = async (id: number) => {
  const res = await api.patch(`/api/v1/users/${id}/ban`);
  return res.data;
};

/**
 * DELETE USER (optional but موجود في Swagger)
 */
export const deleteUser = async (id: number) => {
  const res = await api.delete(`/api/v1/users/${id}`);
  return res.data;
};
