import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { leadService } from "../services/api"; // ✅ make sure this points to your API service

const LeadGrid = ({ user, onLogout }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({});
  const navigate = useNavigate();

  // ✅ Fetch leads from backend
  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page: currentPage,
        limit: 20,
        ...Object.keys(filters).reduce((acc, key) => {
          if (filters[key].value) {
            acc[key] = filters[key].value;
            if (filters[key].operator) {
              acc[`${key}_op`] = filters[key].operator;
            }
          }
          return acc;
        }, {}),
      };

      const response = await leadService.getLeads(params);

      // ✅ Flexible response handling
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          // case: backend returns an array
          setLeads(response.data);
          setTotalPages(1);
        } else if (response.data.data) {
          // case: backend returns { data: [...], totalPages: X }
          setLeads(response.data.data);
          setTotalPages(response.data.totalPages || 1);
        } else {
          console.error("Unexpected response format:", response.data);
          setLeads([]);
          setTotalPages(1);
        }
      } else {
        console.error("No data in response:", response);
        setLeads([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Error fetching leads:", err);
      setError(
        `Failed to load leads: ${
          err.response?.data?.message || err.message || "Unknown error"
        }`
      );
      setLeads([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [currentPage]);

  // ✅ Filters
  const handleFilterChange = (field, operator, value) => {
    const newFilters = { ...filters };
    if (value) {
      newFilters[field] = { operator, value };
    } else {
      delete newFilters[field];
    }
    setFilters(newFilters);
    setCurrentPage(1);
  };

  // ✅ Pagination
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // ✅ Delete lead
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      try {
        await leadService.deleteLead(id);
        fetchLeads();
      } catch (err) {
        console.error("Error deleting lead:", err);
        setError(
          `Failed to delete lead: ${
            err.response?.data?.message || err.message || "Unknown error"
          }`
        );
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "new":
        return "status-new";
      case "contacted":
        return "status-contacted";
      case "qualified":
        return "status-qualified";
      case "lost":
        return "status-lost";
      case "won":
        return "status-won";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="header">
        <div>
          <h1 className="text-xl font-bold">Leads Management</h1>
          <p className="text-gray-600">Manage and track your leads</p>
        </div>
        <div className="flex items-center space-x-4">
          <p className="text-gray-600">
            Welcome, {user?.name ? user.name.split(" ")[0] : "Guest"}
          </p>
          <button onClick={onLogout} className="btn btn-danger">
            Logout
          </button>
        </div>
      </div>

      <div className="container py-8">
        {/* Filters */}
        <div className="filter-panel mb-8">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="filter-row">
            {/* Email Filter */}
            <div className="filter-group">
              <label className="filter-label">Email</label>
              <select
                onChange={(e) =>
                  handleFilterChange(
                    "email",
                    e.target.value,
                    document.getElementById("email-filter").value
                  )
                }
                className="filter-input"
              >
                <option value="">Select operator</option>
                <option value="equals">Equals</option>
                <option value="contains">Contains</option>
              </select>
              <input
                id="email-filter"
                type="text"
                onChange={(e) =>
                  handleFilterChange(
                    "email",
                    document.querySelector("#email-filter + select").value,
                    e.target.value
                  )
                }
                placeholder="Enter email"
                className="filter-input mt-1"
              />
            </div>

            {/* Status Filter */}
            <div className="filter-group">
              <label className="filter-label">Status</label>
              <select
                onChange={(e) =>
                  handleFilterChange("status", "equals", e.target.value)
                }
                className="filter-input"
              >
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="lost">Lost</option>
                <option value="won">Won</option>
              </select>
            </div>

            {/* Source Filter */}
            <div className="filter-group">
              <label className="filter-label">Source</label>
              <select
                onChange={(e) =>
                  handleFilterChange("source", "equals", e.target.value)
                }
                className="filter-input"
              >
                <option value="">All Sources</option>
                <option value="website">Website</option>
                <option value="facebook_ads">Facebook Ads</option>
                <option value="google_ads">Google Ads</option>
                <option value="referral">Referral</option>
                <option value="events">Events</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* City Filter */}
            <div className="filter-group">
              <label className="filter-label">City</label>
              <select
                onChange={(e) =>
                  handleFilterChange(
                    "city",
                    e.target.value,
                    document.getElementById("city-filter").value
                  )
                }
                className="filter-input"
              >
                <option value="">Select operator</option>
                <option value="equals">Equals</option>
                <option value="contains">Contains</option>
              </select>
              <input
                id="city-filter"
                type="text"
                onChange={(e) =>
                  handleFilterChange(
                    "city",
                    document.querySelector("#city-filter + select").value,
                    e.target.value
                  )
                }
                placeholder="Enter city"
                className="filter-input mt-1"
              />
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex space-x-4 mt-4">
            <button onClick={() => fetchLeads()} className="btn btn-primary">
              Apply Filters
            </button>
            <button
              onClick={() => {
                setFilters({});
                setCurrentPage(1);
                fetchLeads();
              }}
              className="btn btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error mb-6">
            {error}
            <button
              onClick={() => {
                setError("");
                fetchLeads();
              }}
              className="ml-4 text-blue-600 hover:text-blue-800 font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {/* Leads Table */}
        <div className="table-container">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <p className="text-gray-600">
                Showing {leads.length} leads (Page {currentPage} of {totalPages})
              </p>
              <button
                onClick={() => navigate("/leads/create")}
                className="btn btn-success"
              >
                Create New Lead
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Source</th>
                  <th>City</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Value</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="text-center py-8">
                      <div className="loading">
                        <div className="loading-spinner"></div>
                        <p className="mt-2 text-gray-600">Loading leads...</p>
                      </div>
                    </td>
                  </tr>
                ) : leads.length > 0 ? (
                  leads.map((lead) => (
                    <tr key={lead._id || lead.id}>
                      <td>
                        <div className="font-medium">
                          {lead.first_name} {lead.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {lead.city}, {lead.state}
                        </div>
                      </td>
                      <td>
                        <div>{lead.email}</div>
                        <div className="text-sm text-gray-500">
                          {lead.phone}
                        </div>
                      </td>
                      <td>{lead.company}</td>
                      <td>{lead.source}</td>
                      <td>{lead.city}</td>
                      <td>
                        <span
                          className={`status-badge ${getStatusColor(
                            lead.status
                          )}`}
                        >
                          {lead.status?.charAt(0).toUpperCase() +
                            lead.status?.slice(1)}
                        </span>
                      </td>
                      <td>{lead.score}</td>
                      <td>${lead.lead_value?.toLocaleString()}</td>
                      <td className="text-right">
                        <button
                          onClick={() =>
                            navigate(`/leads/edit/${lead._id || lead.id}`)
                          }
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(lead._id || lead.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="9"
                      className="text-center py-8 text-gray-600"
                    >
                      No leads found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {leads.length > 0 && totalPages > 1 && (
          <div className="pagination mt-6">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`pagination-btn ${
                  currentPage === index + 1 ? "active" : ""
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadGrid;