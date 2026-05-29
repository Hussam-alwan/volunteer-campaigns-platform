import ApiInstance from "../api.instance";

/**
 * GET ALL USERS (paginated)
 */
export const getUsers = async (page = 0, size = 20) => {
  const res = await ApiInstance.get(`/users`, {
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
  isBanned?: boolean;
}) => {
  const res = await ApiInstance.post(`/users`, data);
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
    isBanned: boolean;
  },
) => {
  const res = await ApiInstance.put(`/users/${id}`, data);
  return res.data;
};

/**
 * BAN / UNBAN USER
 * (backend uses PATCH /users/{id}/ban)
 */
export const banUser = async (id: number) => {
  const res = await ApiInstance.patch(`/users/${id}/ban`);
  return res.data;
};

/**
 * DELETE USER (optional but موجود في Swagger)
 */
export const deleteUser = async (id: number) => {
  const res = await ApiInstance.delete(`/users/${id}`);
  return res.data;
};
