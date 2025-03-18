import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../assets/css/style.css";

const ManageExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, [userId]);

  const fetchExpenses = async () => {
    if (!userId) {
      setError("User not logged in");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/api/expenses?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch expenses");
      const data = await response.json();
      // Ensure amount is a number
      const normalizedData = data.map(expense => ({
        ...expense,
        amount: Number(expense.amount), // Convert amount to number
      }));
      setExpenses(normalizedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/categories", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to fetch categories");
      setCategories(data);
      if (data.length > 0) setCategoryId(data[0].id);
    } catch (err) {
      setError(err.message || "Failed to load categories");
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense({
      ...expense,
      amount: Number(expense.amount), // Ensure amount is a number
      date: new Date(expense.date).toISOString().split("T")[0], // Format date for input
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingExpense) return;
    try {
      const response = await fetch(`http://localhost:5000/api/expenses/${editingExpense.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editingExpense,
          amount: Number(editingExpense.amount), // Ensure amount is a number
          date: new Date(editingExpense.date).toISOString(), // Send date in ISO format
        }),
      });
      if (!response.ok) throw new Error("Failed to update expense");
      // Update the expenses list with the edited expense, ensuring amount is a number
      setExpenses(expenses.map((exp) =>
        exp.id === editingExpense.id ? { ...editingExpense, amount: Number(editingExpense.amount) } : exp
      ));
      setEditingExpense(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!expenseToDelete) return;
    try {
      const response = await fetch(`http://localhost:5000/api/expenses/${expenseToDelete.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to delete expense");
      setExpenses(expenses.filter((exp) => exp.id !== expenseToDelete.id));
      setShowDeleteModal(false);
      setExpenseToDelete(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const confirmDelete = (expense) => {
    setExpenseToDelete(expense);
    setShowDeleteModal(true);
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="card mb-4">
          <div className="card-header">
            <h4 className="card-title mb-0">Manage Expenses</h4>
          </div>
          <div className="card-body">
            {isLoading ? (
              <p className="text-center">Loading...</p>
            ) : error ? (
              <p className="text-center text-danger">{error}</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-borderless">
                  <thead className="thead-light">
                    <tr>
                      <th>#</th>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.length > 0 ? (
                      expenses.map((expense, index) => (
                        <tr key={expense.id}>
                          <td>{index + 1}</td>
                          <td>{expense.name || "Unknown"}</td>
                          <td> ₹{Number(expense.amount).toFixed(2)}</td> {/* Ensure amount is a number */}
                          <td>{new Date(expense.date).toLocaleDateString()}</td>
                          <td>{expense.description || "No description"}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-primary me-2"
                              onClick={() => handleEdit(expense)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => confirmDelete(expense)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">No expenses found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {editingExpense && (
          <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Expense</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setEditingExpense(null)}
                  ></button>
                </div>
                <form onSubmit={handleUpdate}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Category</label>
                      <select
                        className="form-control"
                        value={editingExpense.categoryId || ""}
                        onChange={(e) =>
                          setEditingExpense({
                            ...editingExpense,
                            categoryId: Number(e.target.value),
                          })
                        }
                        required
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
                      <label className="form-label">Amount</label>
                      <input
                        type="number"
                        className="form-control"
                        value={editingExpense.amount}
                        onChange={(e) =>
                          setEditingExpense({
                            ...editingExpense,
                            amount: e.target.value, // Keep as string here, convert to number in handleUpdate
                          })
                        }
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={editingExpense.date}
                        onChange={(e) =>
                          setEditingExpense({
                            ...editingExpense,
                            date: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setEditingExpense(null)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {showDeleteModal && (
          <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Delete</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowDeleteModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete this expense?</p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageExpenses;