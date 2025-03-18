import React, { useState, useEffect } from "react"; // Added useEffect import
import Sidebar from "../components/navbar/Sidebar";
import SalesDashboard from "../components/page/SalesDashboard";
import AddExpense from "../components/page/AddExpense";
import ManageExpenses from "../components/page/ManageExpense"; // Corrected component name
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [selectedPage, setSelectedPage] = useState("dashboard");
  const navigate = useNavigate();

  // Handler to update selected page
  const handlePageChange = (page) => {
    setSelectedPage(page);
  };

  // Check for token when component mounts
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/"); // Redirect to login page if no token
    }
  }, [navigate]); // Dependency array with navigate

  return (
    <div className="main-wrapper d-flex">
      {/* Sidebar */}
      <div className="sidebar-container">
        <Sidebar setSelectedPage={handlePageChange} />
      </div>

      {/* Main Content */}
      <div className="content-container flex-grow-1 p-3">
        {selectedPage === "dashboard" && <SalesDashboard />}
        {selectedPage === "add-expense" && <AddExpense />}
        {selectedPage === "manage-expense" && <ManageExpenses />}
      </div>
    </div>
  );
};

export default Home;