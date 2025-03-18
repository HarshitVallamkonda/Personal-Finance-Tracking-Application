import React, { useState, useEffect } from "react";
import "../../assets/css/style.css";

const AddExpense = () => {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [categoryId, setCategoryId] = useState(""); // Initialize as empty string
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]); // State for dynamic categories

  // Fetch categories from backend when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/categories", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch categories");
        }

        setCategories(data); // Assuming data is an array of { id, name, categoryImageUrl }
        if (data.length > 0) {
          setCategoryId(data[0].id); // Set default to first category ID (number)
        }
      } catch (err) {
        setError(err.message || "Failed to load categories");
      }
    };

    fetchCategories();

    const userId = localStorage.getItem("userId");
    console.log("User ID from localStorage:", userId);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const userId = localStorage.getItem("userId");

    if (!userId || userId === "null" || userId === "undefined") {
      setError("User ID not found. Please log in again.");
      setLoading(false);
      return;
    }

    // Convert values to match backend expectations
    const expenseData = {
      userId: Number(userId), // Convert to number
      amount: Number(amount), // Convert to number
      date,
      categoryId: Number(categoryId), // Ensure categoryId is a number
      description,
    };

    try {
      const response = await fetch("http://localhost:5000/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(expenseData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add expense");
      }

      setMessage("Expense added successfully!");
      setAmount("");
      setCategoryId(categories[0]?.id || ""); // Reset to first category
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]);
    } catch (err) {
      console.error("Submission error:", err); // Log error for debugging
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="card p-4">
          <h3 className="mb-4">Add Expense</h3>

          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Amount</label>
              <input
                type="number"
                className="form-control"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="0.01" // Prevent zero or negative amounts
                step="0.01" // Allow decimals
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required // Make date required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Category</label>
              <select
                className="form-control"
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))} // Ensure number
                disabled={categories.length === 0}
                required // Make category selection required
              >
                {categories.length === 0 ? (
                  <option value="">Loading categories...</option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || categories.length === 0}
            >
              {loading ? "Adding..." : "Add Expense"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddExpense;