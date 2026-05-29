import { useEffect, useMemo, useState } from "react";
import { Search, Plus, SquarePen, Trash2, X, Tags } from "lucide-react";
import Pagination from "@/components/layout/Pagination";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type ICategory,
} from "@/API/Category/Category.apis";

function Categories() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(false);

  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [formError, setFormError] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories(0, 200);
      setCategories(data.content ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, searchTerm]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const paginated = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, safePage]);

  const openCreate = () => {
    setEditingId(null);
    setName("");
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (category: ICategory) => {
    setEditingId(category.categoryId);
    setName(category.name);
    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setName("");
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setFormError("Please enter a category name.");
      return;
    }
    try {
      setLoading(true);
      setFormError("");
      if (editingId) {
        const updated = await updateCategory(editingId, { name: trimmed });
        setCategories((prev) =>
          prev.map((c) =>
            c.categoryId === editingId ? { ...c, ...updated } : c,
          ),
        );
      } else {
        const created = await createCategory({ name: trimmed });
        setCategories((prev) => [created, ...prev]);
      }
      closeModal();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        (err as Error)?.message ||
        "Unable to save category.";
      setFormError(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (category: ICategory) => {
    if (!window.confirm(`Delete category "${category.name}"?`)) return;
    try {
      await deleteCategory(category.categoryId);
      setCategories((prev) =>
        prev.filter((c) => c.categoryId !== category.categoryId),
      );
    } catch (err) {
      console.error(err);
      alert("Failed to delete category. It may be used by a campaign.");
    }
  };

  return (
    <div className="w-full space-y-8 px-6 md:px-10 py-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">
            Campaign <span className="text-[#5D3FD3]">Categories</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Manage the categories campaigns can belong to.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#5D3FD3] text-white px-6 py-3 rounded-full font-medium hover:opacity-90 active:scale-95 transition-all"
        >
          <Plus size={20} />
          Add New Category
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-wrap gap-4 bg-white p-4 rounded-[18px] border border-gray-200">
        <div className="relative flex-1 min-w-70 flex items-center gap-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setSearchTerm(query.trim());
                setCurrentPage(1);
              }
            }}
            placeholder="Search categories..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-full outline-none focus:ring-2 focus:ring-[#5D3FD3]/10 text-sm"
          />
          <button
            type="button"
            onClick={() => {
              setSearchTerm(query.trim());
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-[#5D3FD3] text-white rounded-full text-sm hover:opacity-90 active:scale-95 transition-all"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSearchTerm("");
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-full text-sm hover:bg-slate-50 active:scale-95 transition-all"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[18px] border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-medium">Category Name</th>
              <th className="px-6 py-4 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={2}
                  className="px-6 py-10 text-center text-slate-400 font-medium"
                >
                  {loading ? "Loading…" : "No categories found."}
                </td>
              </tr>
            ) : (
              paginated.map((category) => (
                <tr
                  key={category.categoryId}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4 font-semibold text-slate-800 text-sm">
                    {category.name}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(category)}
                        title="Edit category"
                        className="p-2 text-slate-400 hover:text-[#5D3FD3] hover:bg-slate-100 rounded-lg transition-all active:scale-95"
                      >
                        <SquarePen className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(category)}
                        title="Delete category"
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-95"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filtered.length}
          pageSize={itemsPerPage}
          itemLabel="categories"
        />
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="bg-white w-full max-w-md rounded-[18px] shadow-2xl overflow-hidden"
          >
            <div className="bg-[#5D3FD3] p-6 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2.5 rounded-2xl">
                  <Tags size={20} />
                </div>
                <h2 className="text-lg font-semibold">
                  {editingId ? "Edit Category" : "Add New Category"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="hover:bg-white/10 p-2 rounded-full transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {formError && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                  {formError}
                </p>
              )}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Category Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Environment"
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#5D3FD3]/20 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 border border-slate-100 text-slate-500 font-medium rounded-full hover:bg-slate-50 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-[#5D3FD3] text-white font-medium rounded-full hover:opacity-90 transition-all text-sm disabled:opacity-60"
                >
                  {loading
                    ? "Saving…"
                    : editingId
                      ? "Save Changes"
                      : "Create"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Categories;
