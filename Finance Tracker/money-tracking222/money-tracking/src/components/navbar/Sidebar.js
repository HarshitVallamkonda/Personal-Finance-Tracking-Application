import React from "react";
import logo from "../../assets/img/LOG.png";
import logoWhite from "../../assets/img/LOG.png";
import logoSmall from "../../assets/img/logo-small.png";
import customerImg from "../../assets/img/customer/customer15.jpg";


const Sidebar = ({ setSelectedPage }) => {
  const handleLogout = () => {
    localStorage.clear(); // Clears all local storage data
    window.location.href = "./"; // Redirects to the home page
  };
  

  return (
    <div className="sidebar" id="sidebar">
      <div className="sidebar-logo">
        <a href="#" className="logo logo-normal">
          <img src={logo} alt="Logo" />
        </a>
        <a href="#" className="logo logo-white">
          <img src={logoWhite} alt="Logo White" />
        </a>
        <a href="#" className="logo-small">
          <img src={logoSmall} alt="Logo Small" />
        </a>
        <a id="toggle_btn" href="javascript:void(0);">
          <i data-feather="chevrons-left" className="feather-16"></i>
        </a>
      </div>

      <div className="modern-profile p-3 pb-0">
        <div className="text-center rounded bg-light p-3 mb-4 user-profile">
          <div className="avatar avatar-lg online mb-3">
            <img src={customerImg} alt="User" className="img-fluid rounded-circle" />
          </div>
        </div>
      </div>

      <div className="sidebar-inner slimscroll">
        <div id="sidebar-menu" className="sidebar-menu">
          <ul>
            <li className="submenu-open">
              <h6 className="submenu-hdr">Main</h6>
              <ul>
                <li className="submenu">
                  <a href="#" onClick={() => setSelectedPage("dashboard")}>
                    <i className="ti ti-layout-grid fs-16 me-2"></i>
                    <span><b>Dashboard</b></span>
                  </a>
                </li>
                <li className="submenu">
                  <a href="#" onClick={() => setSelectedPage("add-expense")}>
                    <i className="ti ti-user-edit fs-16 me-2"></i>
                    <span><b>Add Expense</b></span>
                  </a>
                </li>
                <li className="submenu">
                  <a href="#" onClick={() => setSelectedPage("manage-expense")}>
                  <i className="ti ti-brand-apple-arcade fs-16 me-2"></i>
                  <span><b>Manage Expense</b></span>
                  </a>
                </li>
                
              </ul>
            </li>

            {/* Logout Option */}
            <li className="submenu mt-4">
              <a href="#" onClick={handleLogout} className="text-danger">
                <i className="ti ti-power fs-16 me-2"></i>
                <span><b>Logout</b></span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
