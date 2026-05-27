import { useState, type FormEvent } from "react";
import { Plus, Search, Edit2, Trash2, X, Tag, Calendar } from "lucide-react";
import {
  useGetCategories,
  useAddCategory,
  useUpdateCategory,
  useDeleteCategory,
  type ICategory,
} from "@/API/Categories/Categories.apis";

const Categories = () => {
  const primaryBlue = "#0066cc";
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ICategory | null>(null);
  const [name, setName] = useState("");
  const [pageIndex, setPageIndex] = useState(0);

  const { data, isLoading, isError } = useGetCategories(pageIndex, 10);
  const addMutation = useAddCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const categories = data?.content || [];
  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase().trim()),
  );

  const openCreate = () => {
    setEditing(null);
    setName("");
    setShowModal(true);
  };
  const openEdit = (cat: ICategory) => {
    setEditing(cat);
    setName(cat.name);
    setShowModal(true);
  };
  const close = () => {
    setShowModal(false);
    setEditing(null);
    setName("");
  };

  const describeError = (err: unknown, fallback: string) => {
    const e = err as {
      response?: { status?: number; data?: { message?: string; error?: string } };
      message?: string;
    };
    const s = e?.response?.status;
    const d = e?.response?.data;
    const detail = d?.message || d?.error || e?.message || fallback;
    return s ? `[${s}] ${detail}` : detail;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      if (editing) {
        await updateMutation.mutateAsync({
          id: editing.categoryId,
          payload: { name: name.trim() },
        });
      } else {
        await addMutation.mutateAsync({ name: name.trim() });
      }
      close();
    } catch (err) {
      console.error("Category save failed:", err);
      alert(describeError(err, "Failed to save category."));
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err) {
      alert(describeError(err, "Failed to delete category."));
    }
  };

  const formatDate = (iso: string) => {
    if (!iso) return "—";
    return iso.split("T")[0];
  };

  const submitting = addMutation.isPending || updateMutation.isPending;

  if (isError) {
    return (
      <div className="w-full p-8 text-center bg-red-50 text-red-600 rounded-2xl border border-red-100">
        <p className="font-bold">Failed to fetch categories from the server</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-[34px] font-semibold text-[#1d1d1f] tracking-tight leading-tight">
            Campaign{" "}
            <span style={{ color: primaryBlue }}>Categories</span>
          </h1>
          <p className="text-[#6e6e73] mt-2 text-[17px]">
            Manage the categories campaigns can be classified under.
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{ backgroundColor: primaryBlue }}
          className="flex items-center gap-2 text-white px-6 py-2.5 rounded-full font-semibold text-[15px] hover:bg-[#004999] transition-colors"
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-[#e0e0e0] flex items-center gap-4">
        <div className="relative max-w-md flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name..."
            className="w-full pl-12 pr-4 py-2.5 bg-[#f5f5f7] border-none rounded-xl outline-none focus:ring-2 focus:ring-[#0066cc]/20 text-[15px]"
          />
        </div>
        {isLoading && (
          <div
            className="animate-spin rounded-full h-5 w-5 border-b-2"
            style={{ borderColor: primaryBlue }}
          ></div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[#e0e0e0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#fafafc] border-b border-[#e0e0e0]">
                <th className="px-6 py-4 font-medium text-[#6e6e73] text-[12px] uppercase tracking-[0.06em]">
                  Name
                </th>
                <th className="px-6 py-4 font-medium text-[#6e6e73] text-[12px] uppercase tracking-[0.06em]">
                  Created
                </th>
                <th className="px-6 py-4 font-medium text-[#6e6e73] text-[12px] uppercase tracking-[0.06em]">
                  Updated
                </th>
                <th className="px-6 py-4 font-medium text-[#6e6e73] text-[12px] uppercase tracking-[0.06em] text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0f0]">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-10 text-[#6e6e73] text-[15px]"
                  >
                    {isLoading ? "Loading…" : "No categories yet."}
                  </td>
                </tr>
              ) : (
                filtered.map((cat) => (
                  <tr
                    key={cat.categoryId}
                    className="hover:bg-[#fafafc] transition-colors"
                  >
                    <td className="px-6 py-5">
                      <span className="font-semibold text-[#1d1d1f] text-[15px]">
                        {cat.name}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-[#6e6e73] text-[13px]">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} />
                        {formatDate(cat.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-[#6e6e73] text-[13px]">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} />
                        {formatDate(cat.updatedAt)}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEdit(cat)}
                          title="Edit"
                          className="p-2 text-[#6e6e73] hover:text-[#0066cc] hover:bg-[#f5f5f7] rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.categoryId)}
                          title="Delete"
                          className="p-2 text-[#6e6e73] hover:text-[#ff3b30] hover:bg-[#f5f5f7] rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {data && data.totalPages > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#e0e0e0] text-[13px] text-[#6e6e73]">
            <span>
              Page {pageIndex + 1} of {data.totalPages || 1} ·{" "}
              {data.totalElements} total
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                disabled={pageIndex === 0}
                className="px-4 py-1.5 rounded-full border border-[#e0e0e0] hover:bg-[#fafafc] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setPageIndex((p) =>
                    Math.min((data.totalPages || 1) - 1, p + 1),
                  )
                }
                disabled={pageIndex >= (data.totalPages || 1) - 1}
                className="px-4 py-1.5 rounded-full border border-[#e0e0e0] hover:bg-[#fafafc] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl border border-[#e0e0e0] overflow-hidden animate-in zoom-in-95">
            <div
              style={{ backgroundColor: primaryBlue }}
              className="p-6 flex justify-between items-center text-white"
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Tag size={20} />
                </div>
                <h2 className="text-lg font-semibold tracking-tight">
                  {editing ? "Edit Category" : "Add Category"}
                </h2>
              </div>
              <button
                onClick={close}
                className="hover:bg-white/10 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#6e6e73] uppercase tracking-wider mb-2">
                  Name
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Environment"
                  className="w-full px-4 py-3 bg-[#f5f5f7] border border-transparent rounded-xl text-[15px] outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:bg-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={close}
                  className="flex-1 py-2.5 bg-[#f5f5f7] text-[#1d1d1f] font-medium rounded-full text-[15px] hover:bg-[#e0e0e0] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ backgroundColor: primaryBlue }}
                  className="flex-1 py-2.5 text-white font-semibold rounded-full text-[15px] hover:bg-[#004999] disabled:opacity-50 transition-colors"
                >
                  {submitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
