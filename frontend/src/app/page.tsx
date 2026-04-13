"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Item {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface FormState {
  name: string;
  description: string;
}

const emptyForm: FormState = { name: "", description: "" };

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    try {
      const res = await fetch(`${API_URL}/api/items`);
      if (!res.ok) throw new Error("Failed to fetch items");
      setItems(await res.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const url = editingId ? `${API_URL}/api/items/${editingId}` : `${API_URL}/api/items`;
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save item");
      setForm(emptyForm);
      setEditingId(null);
      await fetchItems();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: Item) => {
    setEditingId(item.id);
    setForm({ name: item.name, description: item.description || "" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this item?")) return;
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/items/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete item");
      await fetchItems();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  };

  return (
    <main className="container">
      <h1>Items</h1>

      {error && <div className="error">{error}</div>}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              placeholder="Item name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              placeholder="Optional description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving..." : editingId ? "Update" : "Create"}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {items.length === 0 ? (
        <p className="empty">No items yet. Create one above.</p>
      ) : (
        items.map((item) => (
          <div key={item.id} className="card">
            <div className="item-name">{item.name}</div>
            {item.description && <div className="item-desc">{item.description}</div>}
            <div className="item-date">
              Created {new Date(item.created_at).toLocaleString()}
            </div>
            <div className="actions">
              <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(item)}>
                Edit
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </main>
  );
}
