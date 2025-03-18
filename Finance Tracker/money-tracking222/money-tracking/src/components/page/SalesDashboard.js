import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../assets/css/style.css";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  Filler,
} from "chart.js";

// Register Chart.js components
ChartJS.register(LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale, Filler);

const SalesDashboard = () => {
  const [userName, setUserName] = useState("User");
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [nameFilter, setNameFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const rowsPerPage = 10;
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fullName = localStorage.getItem("fullName");
    if (fullName) {
      setUserName(fullName);
    } else {
      console.warn("No fullName found in localStorage");
    }

    if (userId) {
      setIsLoading(true);
      setError(null);
      fetch(`http://localhost:5000/api/expenses?userId=${userId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("Fetched expenses:", data);
          setExpenses(data);
          setFilteredExpenses(data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching expenses:", error);
          setError("Failed to load expenses");
          setIsLoading(false);
        });
    } else {
      console.warn("No userId found in localStorage");
    }
  }, [userId]);

  // Filter expenses based on name and date
  useEffect(() => {
    let filtered = [...expenses];

    if (nameFilter) {
      filtered = filtered.filter((expense) =>
        (expense.name || "Unknown").toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    const today = new Date();
    if (dateFilter === "thisWeek") {
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)));
      weekStart.setHours(0, 0, 0, 0);
      filtered = filtered.filter((expense) => new Date(expense.date) >= weekStart);
    } else if (dateFilter === "thisMonth") {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      filtered = filtered.filter((expense) => new Date(expense.date) >= monthStart);
    } else if (dateFilter === "custom" && fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      filtered = filtered.filter(
        (expense) => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= from && expenseDate <= to;
        }
      );
    }

    setFilteredExpenses(filtered);
    setCurrentPage(1);
  }, [expenses, nameFilter, dateFilter, fromDate, toDate]);

  // Calculate total expense amount and counts
  const totalExpense = filteredExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const totalExpenseCount = filteredExpenses.length;
  const uniqueCategories = new Set(filteredExpenses.map(expense => expense.name || "Unknown")).size;

  // Prepare chart data: Aggregate expenses by month for the selected year
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyExpenses = Array(12).fill(0);

  expenses
    .filter((expense) => new Date(expense.date).getFullYear() === Number(selectedYear))
    .forEach((expense) => {
      const month = new Date(expense.date).getMonth();
      monthlyExpenses[month] += Number(expense.amount);
    });

  const chartData = {
    labels: months,
    datasets: [
      {
        label: "Expenses",
        data: monthlyExpenses,
        borderColor: "#FF9F43",
        backgroundColor: "rgba(255, 159, 67, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ₹${context.parsed.y.toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `${value / 1000}k`,
        },
      },
    },
  };

  // Generate years for dropdown (last 5 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const totalPages = Math.ceil(filteredExpenses.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentExpenses = filteredExpenses.slice(indexOfFirstRow, indexOfLastRow);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        {/* Welcome Section */}
        <div className="welcome d-lg-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center welcome-text">
            <h3 className="d-flex align-items-center">
              <img src="assets/img/icons/hi.svg" alt="hi" />
              &nbsp;Hey {userName} !
            </h3>
            &nbsp;<h6>Your finances at a glance.</h6>
          </div>
          <div className="d-flex align-items-center"></div>
        </div>

        {/* Sales Cards */}
        <div className="row sales-cards">
          <div className="col-xl-6 col-sm-12 col-12 d-flex">
            <div className="card d-flex align-items-center justify-content-between flex-fill mb-4">
              <div>
                <h6>Total Expenses</h6>
                <h3> ₹{isLoading ? "Loading..." : totalExpense.toFixed(2)}</h3>
              
              </div>
              <img src="assets/img/icons/weekly-earning.svg" alt="weekly earning" />
            </div>
          </div>

          <div className="col-xl-3 col-sm-6 col-12 d-flex">
            <div className="card color-info bg-primary flex-fill mb-4">
              <div className="mb-2">
                <img src="assets/img/icons/total-sales.svg" alt="total expenses" />
              </div>
              <h3>{isLoading ? "Loading..." : totalExpenseCount}</h3>
              <p>No. of Expenses</p>
            </div>
          </div>

          <div className="col-xl-3 col-sm-6 col-12 d-flex">
            <div className="card color-info bg-secondary flex-fill mb-4">
              <div className="mb-2">
                <img src="assets/img/icons/purchased-earnings.svg" alt="categories" />
              </div>
              <h3>{isLoading ? "Loading..." : uniqueCategories}</h3>
              <p>No. of Categories</p>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="row">
          <div className="col-sm-12 col-md-12 col-xl-12 d-flex">
            <div className="card flex-fill w-100 mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h4 className="card-title mb-0">Your Expense</h4>
              </div>
              <div className="card-body">
                {/* Filters */}
                <div className="row mb-3">
                  <div className="col-md-4">
                    <label className="form-label">Filter by Category Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={nameFilter}
                      onChange={(e) => setNameFilter(e.target.value)}
                      placeholder="Enter category name"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Date Filter</label>
                    <select
                      className="form-control"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                    >
                      <option value="">All Time</option>
                      <option value="thisWeek">This Week</option>
                      <option value="thisMonth">This Month</option>
                      <option value="custom">Custom Date</option>
                    </select>
                  </div>
                  {dateFilter === "custom" && (
                    <div className="col-md-4 d-flex gap-2">
                      <div className="flex-fill">
                        <label className="form-label">From</label>
                        <input
                          type="date"
                          className="form-control"
                          value={fromDate}
                          onChange={(e) => setFromDate(e.target.value)}
                        />
                      </div>
                      <div className="flex-fill">
                        <label className="form-label">To</label>
                        <input
                          type="date"
                          className="form-control"
                          value={toDate}
                          onChange={(e) => setToDate(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="table-responsive">
                  <table className="table table-borderless recent-transactions">
                    <thead className="thead-light">
                      <tr>
                        <th>#</th>
                        <th>Expense Category</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td colSpan="5" className="text-center">Loading...</td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td colSpan="5" className="text-center text-danger">{error}</td>
                        </tr>
                      ) : currentExpenses.length > 0 ? (
                        currentExpenses.map((expense, index) => (
                          <tr key={expense.id}>
                            <td>{indexOfFirstRow + index + 1}</td>
                            <td>
                              <div className="d-flex align-items-center">
                                <a href="product-list.html" className="avatar avatar-lg me-2">
                                  <img
                                    src={expense.categoryImageUrl}
                                    alt="category"
                                    onError={(e) => (e.target.src = "assets/img/default-category.png")}
                                  />
                                </a>
                                <div>
                                  <h6 className="fw-bold">{expense.name || "Unknown"}</h6>
                                </div>
                              </div>
                            </td>
                            <td className="fs-16 fw-bold text-gray-9"> ₹{expense.amount.toFixed(2)}</td>
                            <td>{new Date(expense.date).toLocaleDateString()}</td>
                            <td>{expense.description || "No description"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center">No transactions found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-3">
                    <nav>
                      <ul className="pagination">
                        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </button>
                        </li>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <li
                            key={page}
                            className={`page-item ${currentPage === page ? "active" : ""}`}
                          >
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          </li>
                        ))}

                        <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                          >
                            Next
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Chart: Expense Analytics */}
        <div className="row">
          <div className="col-sm-12 col-md-12 col-xl-12 d-flex">
            <div className="card flex-fill w-100 mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h4 className="card-title mb-0">Expense Analytics</h4>
                <div>
                  <select
                    className="form-control"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="card-body">
                <div style={{ height: "300px" }}>
                  <Line data={chartData} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;