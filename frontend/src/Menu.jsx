import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Layout from "./components/Layout";

const API = "http://localhost:5000";

function Menu() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editImage, setEditImage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem("token");
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  const inputStyle = {
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #dbcdb8",
    outline: "none",
    backgroundColor: "#fffdf9",
    color: "#2c2c2c",
    fontSize: "14px",
  };

  const fetchMenu = async () => {
    try {
      const res = await axios.get(`${API}/api/menu`);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch {
      alert("Failed to fetch menu.");
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const value = searchTerm.toLowerCase();
      return (
        item.name?.toLowerCase().includes(value) ||
        item.category?.toLowerCase().includes(value) ||
        item.description?.toLowerCase().includes(value)
      );
    });
  }, [items, searchTerm]);

  const addItem = async (e) => {
    e.preventDefault();
    if (!name || !price || !description || !category) {
      return alert("Please fill all required fields.");
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", String(price));
      formData.append("description", description);
      formData.append("category", category);

      if (image) formData.append("image", image);

      await axios.post(`${API}/api/menu`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setName("");
      setPrice("");
      setDescription("");
      setCategory("");
      setImage(null);
      setShowForm(false);

      fetchMenu();
    } catch (err) {
      alert(err?.response?.data?.message || "Add failed. Login again.");
    }
  };

  const deleteItem = async (id) => {
    try {
      await axios.delete(`${API}/api/menu/${id}`, authConfig);
      setItems((prev) => prev.filter((x) => x._id !== id));
    } catch {
      alert("Delete failed.");
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditName(item.name || "");
    setEditPrice(item.price || "");
    setEditDescription(item.description || "");
    setEditCategory(item.category || "");
    setEditImage(item.image || "");
  };

  const saveEdit = async (id) => {
    try {
      await axios.put(
        `${API}/api/menu/${id}`,
        {
          name: editName,
          price: Number(editPrice),
          description: editDescription,
          category: editCategory,
          image: editImage,
        },
        authConfig
      );

      setEditingId(null);
      fetchMenu();
    } catch {
      alert("Update failed.");
    }
  };

  return (
    <Layout>
      <div style={styles.page}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Menu Management</h1>
            <p style={styles.subtitle}>
              Manage restaurant dishes, pricing, and categories.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            style={styles.primaryButton}
          >
            {showForm ? "Close Form" : "+ Add Item"}
          </button>
        </div>

        <div style={styles.toolbar}>
          <input
            type="text"
            placeholder="Search by name, category, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          />
          <div style={styles.resultBadge}>
            Total: {filteredItems.length}
          </div>
        </div>

        {showForm && (
          <form onSubmit={addItem} style={styles.formCard}>
            <h3 style={styles.cardHeading}>Add New Menu Item</h3>

            <div style={styles.formGrid}>
              <input
                placeholder="Item Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
              />

              <input
                placeholder="Price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                style={inputStyle}
              />

              <input
                placeholder="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={inputStyle}
              />

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
                style={inputStyle}
              />

              <input
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ ...inputStyle, gridColumn: "1 / -1" }}
              />
            </div>

            <div style={{ marginTop: "16px" }}>
              <button type="submit" style={styles.saveButton}>
                Save Item
              </button>
            </div>
          </form>
        )}

        <div style={styles.listWrap}>
          {filteredItems.length === 0 ? (
            <div style={styles.emptyState}>No menu items found.</div>
          ) : (
            filteredItems.map((item) => (
              <div key={item._id} style={styles.itemCard}>
                {editingId === item._id ? (
                  <>
                    <div style={styles.editSection}>
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        style={inputStyle}
                        placeholder="Name"
                      />
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        style={inputStyle}
                        placeholder="Price"
                      />
                      <input
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        style={inputStyle}
                        placeholder="Category"
                      />
                      <input
                        value={editImage}
                        onChange={(e) => setEditImage(e.target.value)}
                        style={inputStyle}
                        placeholder="Image URL / Path"
                      />
                      <input
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        style={{ ...inputStyle, gridColumn: "1 / -1" }}
                        placeholder="Description"
                      />
                    </div>

                    <div style={styles.actionColumn}>
                      <button
                        type="button"
                        onClick={() => saveEdit(item._id)}
                        style={styles.saveButton}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        style={styles.cancelButton}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={styles.itemInfo}>
                      <div style={styles.imageWrap}>
                        {item.image ? (
                          <img
                            src={`${API}${item.image}`}
                            alt={item.name}
                            style={styles.image}
                          />
                        ) : (
                          <div style={styles.noImage}>No Image</div>
                        )}
                      </div>

                      <div style={styles.textBlock}>
                        <h3 style={styles.itemTitle}>{item.name}</h3>
                        <div style={styles.metaRow}>
                          <span style={styles.categoryBadge}>{item.category}</span>
                          <span style={styles.priceTag}>₹{item.price}</span>
                        </div>
                        <p style={styles.description}>{item.description}</p>
                      </div>
                    </div>

                    <div style={styles.actionColumn}>
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        style={styles.editButton}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteItem(item._id)}
                        style={styles.deleteButton}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "8px",
    backgroundColor: "#f7f3ea",
    color: "#2c2c2c",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "24px",
  },
  title: {
    margin: 0,
    fontSize: "42px",
    fontWeight: 800,
    color: "#2c2c2c",
  },
  subtitle: {
    marginTop: "8px",
    marginBottom: 0,
    color: "#7a6f5d",
    fontSize: "15px",
  },
  toolbar: {
    display: "flex",
    gap: "14px",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: "24px",
    background: "#fffaf2",
    border: "1px solid #e5dccb",
    borderRadius: "16px",
    padding: "16px",
  },
  resultBadge: {
    background: "#eadcc6",
    color: "#6a5237",
    padding: "12px 16px",
    borderRadius: "12px",
    fontWeight: 700,
    minWidth: "110px",
    textAlign: "center",
  },
  formCard: {
    backgroundColor: "#fffaf2",
    padding: "20px",
    borderRadius: "18px",
    border: "1px solid #e5dccb",
    marginBottom: "24px",
    boxShadow: "0 8px 18px rgba(0,0,0,0.05)",
  },
  cardHeading: {
    marginTop: 0,
    marginBottom: "16px",
    color: "#2c2c2c",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
  },
  listWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  itemCard: {
    backgroundColor: "#fffaf2",
    padding: "18px",
    borderRadius: "18px",
    border: "1px solid #e5dccb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "18px",
    flexWrap: "wrap",
    boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
  },
  itemInfo: {
    display: "flex",
    gap: "18px",
    alignItems: "center",
    flex: 1,
    minWidth: "280px",
  },
  imageWrap: {
    width: "96px",
    height: "96px",
    borderRadius: "16px",
    overflow: "hidden",
    background: "#efe6d8",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  noImage: {
    color: "#8d7d67",
    fontSize: "13px",
    fontWeight: 600,
  },
  textBlock: {
    flex: 1,
  },
  itemTitle: {
    margin: 0,
    marginBottom: "10px",
    color: "#2c2c2c",
    fontSize: "28px",
  },
  metaRow: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: "10px",
  },
  categoryBadge: {
    background: "#eadcc6",
    color: "#6a5237",
    padding: "6px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 700,
  },
  priceTag: {
    color: "#b7791f",
    fontWeight: 800,
    fontSize: "18px",
  },
  description: {
    margin: 0,
    color: "#6f6657",
    lineHeight: 1.6,
  },
  actionColumn: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  editSection: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
    flex: 1,
    minWidth: "280px",
  },
  primaryButton: {
    padding: "12px 18px",
    backgroundColor: "#c49a6c",
    color: "white",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  saveButton: {
    padding: "12px 16px",
    backgroundColor: "#7a9b76",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 700,
  },
  cancelButton: {
    padding: "12px 16px",
    backgroundColor: "#9ca3af",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 700,
  },
  editButton: {
    padding: "12px 16px",
    backgroundColor: "#d4a373",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 700,
  },
  deleteButton: {
    padding: "12px 16px",
    backgroundColor: "#d9534f",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 700,
  },
  emptyState: {
    padding: "24px",
    background: "#fffaf2",
    border: "1px solid #e5dccb",
    borderRadius: "16px",
    color: "#7a6f5d",
    fontWeight: 600,
    textAlign: "center",
  },
};

export default Menu;