import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000";

function MenuList() {
  const [menuItems, setMenuItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedAvailability, setSelectedAvailability] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (searchTerm.trim()) params.q = searchTerm.trim();
      if (selectedCategory) params.category = selectedCategory;
      if (selectedAvailability) params.available = selectedAvailability;
      if (selectedTag) params.tag = selectedTag;

      const res = await axios.get(`${API}/api/menu`, { params });
      setMenuItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load menu items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchMenuItems();
    }, 300);

    return () => clearTimeout(delay);
  }, [searchTerm, selectedCategory, selectedAvailability, selectedTag]);

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Restaurant Menu</h2>
        <p className="text-muted mb-0">
          Search and filter menu items by category, availability, and dietary tag.
        </p>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-4">
            <div className="col-md-4">
              <label className="form-label fw-semibold">Search</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name or description"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold">Category</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Pizza, Drinks"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              />
            </div>

            <div className="col-md-2">
              <label className="form-label fw-semibold">Availability</label>
              <select
                className="form-select"
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
              >
                <option value="">All</option>
                <option value="true">Available</option>
                <option value="false">Unavailable</option>
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold">Dietary Tag</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. veg, vegan"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-3 d-flex gap-2">
            <button className="btn btn-primary" onClick={fetchMenuItems}>
              Apply Filters
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("");
                setSelectedAvailability("");
                setSelectedTag("");
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-5">
          <h5>Loading menu items...</h5>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">
              Total Results: <span className="text-primary">{menuItems.length}</span>
            </h5>
          </div>

          {menuItems.length === 0 ? (
            <div className="alert alert-warning">
              No menu items found for the selected filters.
            </div>
          ) : (
            <div className="row g-4">
              {menuItems.map((item) => (
                <div className="col-md-6 col-lg-4" key={item._id}>
                  <div className="card border-0 shadow-sm">
                    {item.image ? (
                      <img
                        src={`${API}${item.image}`}
                        alt={item.name}
                        className="card-img-top"
                        style={{ height: "160px", objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        className="d-flex align-items-center justify-content-center bg-light text-muted"
                        style={{ height: "160px" }}
                      >
                        No Image
                      </div>
                    )}

                    <div className="card-body d-flex flex-column p-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="fw-bold mb-0">{item.name}</h5>
                        <span
                          className={`badge ${item.isAvailable ? "bg-success" : "bg-secondary"
                            }`}
                        >
                          {item.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </div>

                      <p className="text-muted mb-2" style={{ fontSize: "14px" }}>
                        {item.description}
                      </p>

                      <div className="mb-1">
                        <span className="badge bg-dark me-2">{item.category}</span>
                        <span className="badge bg-warning text-dark">
                          Spice: {item.spiceLevel}
                        </span>
                      </div>

                      {item.dietaryTags?.length > 0 && (
                        <div className="mb-2">
                          {item.dietaryTags.map((tag, index) => (
                            <span key={index} className="badge bg-info text-dark me-2">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-auto d-flex justify-content-between align-items-center">
                        <span className="fw-bold fs-5 text-success">₹{item.price}</span>
                        <small className="text-muted">
                          Ordered: {item.ordersCount || 0}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MenuList;