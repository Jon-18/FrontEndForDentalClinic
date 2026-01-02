import { useEffect, useState } from "react";

export default function AdminAppointmentRequests() {
  const [appointments, setAppointments] = useState([]);


  // Fetch appointments
  const fetchAppointments = () => {
    fetch("https://sibongadentalfrontend.onrender.com/api/appointments")
      .then((res) => res.json())
      .then((data) => console.log(data) || setAppointments(data))
      .catch((err) => console.error("Appointment fetch error:", err));
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Approve / Deny action
  const updateStatus = async (id, status) => {
    try {
      await fetch(`https://sibongadentalfrontend.onrender.com/api/appointmentAdmin/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      fetchAppointments(); // refresh table
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  return (
    <div className="table-container">
      <h2 className="table-title">Appointment Requests</h2>

      <table className="table">
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Contact Number</th>
            <th>Email</th>
            <th>Dentist</th>
            <th>Date</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Payment</th>
            <th>Receipt</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {appointments
            .filter((appt) => appt.status === "Pending")
            .map((appt) => (
            <tr key={appt.id}>
              <td>{appt.fullName}</td>
              <td>{appt.contactNumber}</td>
              <td>{appt.email}</td>

              <td>
                {appt.doctorName}
              </td>

              <td>{appt.Date}</td>
              <td>{appt.startTime}</td>
              <td>{appt.endTime}</td>
              <td>{appt.paymentMethod}</td>

              <td>
                {appt.receiptPath ? (
                  <a
                    href={`https://sibongadentalfrontend.onrender.com/${appt.receiptPath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#0077cc" }}
                  >
                    View
                  </a>
                ) : (
                  "None"
                )}
              </td>

              <td style={{ fontWeight: "bold" }}>{appt.status}</td>

              <td>
                <button
                  onClick={() => updateStatus(appt.id, "Approved by Admin")}
                  style={{
                    background: "#4caf50",
                    color: "#fff",
                    border: "none",
                    padding: "5px 10px",
                    marginRight: "5px",
                    marginBottom: "5px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "bold"
                  }}
                >
                  Approve
                </button>

                <button
                  onClick={() => updateStatus(appt.id, "Denied by Admin")}
                  style={{
                    background: "#e53935",
                    color: "#fff",
                    border: "none",
                    padding: "5px 10px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "bold"
                  }}
                >
                  Deny
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
