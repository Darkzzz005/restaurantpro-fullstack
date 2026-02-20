import { useEffect, useState } from "react";
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
  const [image, setImage] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editImage, setEditImage] = useState("");

  const token = localStorage.getItem("token");
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  const inputStyle = {
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    outline: "none",
  };

  // Load items
  const fetchMenu = async () => {
    const res = await axios.get(`${API}/api/menu`);
    setItems(res.data);
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // Add
  const addItem = async (e) => {
    e.preventDefault();
    if (!name || !price) return;

    try {
      await axios.post(
        `${API}/api/menu`,
        { name, description, category, image, price: Number(price) },
        authConfig
      );

      setName("");
      setPrice("");
      setDescription("");
      setCategory("");
      setImage("");
      setShowForm(false);
      fetchMenu();
    } catch {
      alert("Add failed. Login again.");
    }
  };

  // Delete
  const deleteItem = async (id) => {
    try {
      await axios.delete(`${API}/api/menu/${id}`, authConfig);
      setItems(items.filter((x) => x._id !== id));
    } catch {
      alert("Delete failed.");
    }
  };

  // Start Edit
  const startEdit = (item) => {
    setEditingId(item._id);
    setEditName(item.name || "");
    setEditPrice(item.price || "");
    setEditDescription(item.description || "");
    setEditCategory(item.category || "");
    setEditImage(item.image || "");
  };

  // Save Edit
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
    <div
      style={{
        minHeight: "100vh",
        padding: "40px",
        backgroundColor: "#0f172a",
        color: "white",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Menu Management</h1>

        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: "10px 14px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          + Add Item
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={addItem}
          style={{
            marginTop: "20px",
            backgroundColor: "#1e293b",
            padding: "16px",
            borderRadius: "10px",
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
          <input placeholder="Price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} style={inputStyle} />
          <input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle} />
          <input placeholder="Image" value={image} onChange={(e) => setImage(e.target.value)} style={inputStyle} />
          <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...inputStyle, flex: 1 }} />

          <button
            type="submit"
            style={{
              padding: "10px 14px",
              backgroundColor: "#22c55e",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Save
          </button>
        </form>
      )}

      <div style={{ marginTop: "25px" }}>
        {items.map((item) => (
          <div
            key={item._id}
            style={{
              backgroundColor: "#1e293b",
              padding: "15px",
              marginTop: "15px",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {editingId === item._id ? (
              <>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", flex: 1 }}>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} style={inputStyle} />
                  <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} style={inputStyle} />
                  <input value={editCategory} onChange={(e) => setEditCategory(e.target.value)} style={inputStyle} />
                  <input value={editImage} onChange={(e) => setEditImage(e.target.value)} style={inputStyle} />
                  <input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => saveEdit(item._id)} style={{ ...inputStyle, backgroundColor: "#22c55e", color: "white" }}>Save</button>
                  <button onClick={() => setEditingId(null)} style={{ ...inputStyle, backgroundColor: "#64748b", color: "white" }}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h3 style={{ margin: 0 }}>{item.name}</h3>
                  <p>{item.category}</p>
                  <p>{item.description}</p>
                  <p>₹{item.price}</p>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => startEdit(item)} style={{ ...inputStyle, backgroundColor: "#f59e0b", color: "white" }}>Edit</button>
                  <button onClick={() => deleteItem(item._id)} style={{ ...inputStyle, backgroundColor: "#ef4444", color: "white" }}>Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
    </Layout>
  );
}

export default Menu;
