import { useEffect, useState } from "react";
import CalendarBase from "../Calendar";
import ModalForm from "../ModalForm";
import MessageModal from "../ModalMessage";

export default function AdminCalendar() {
  const [bookedAppointments, ] = useState([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showModalMessage, setShowModalMessage] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatient] = useState([]);
  const [services, setServices] = useState([]);

  /* LOAD DATA WHEN FORM OPENS */
  useEffect(() => {
    if (showFormModal) {
      fetch("https://sibongadentalfrontend.onrender.com//api/getAllPatient")
        .then((res) => res.json())
        .then((data) => setPatient(data))
        .catch((err) => console.error(err));
    }
  }, [showFormModal]);

  useEffect(() => {
    if (showFormModal) {
      fetch("https://sibongadentalfrontend.onrender.com//api/getAllDoctor")
        .then((res) => res.json())
        .then((data) => setDoctors(data))
        .catch((err) => console.error(err));
    }
  }, [showFormModal]);

  useEffect(() => {
    if (showFormModal) {
      fetch("https://sibongadentalfrontend.onrender.com//api/getAllServices")
        .then((res) => res.json())
        .then((data) => setServices(data))
        .catch((err) => console.error(err));
    }
  }, [showFormModal]);

  /* HANDLE SLOT SELECT FROM CALENDAR */
  const handleSlotSelect = (slotInfo, generateSlots) => {
    const { start } = slotInfo;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) return;

    const availableSlots = generateSlots(start);

    if (availableSlots.length === 0) {
      setModalMessage("No available time slots for this day.");
      setShowModalMessage(true);
      return;
    }

    setSelectedSlot({ date: start, availableSlots });
    setShowFormModal(true);
  };

  /* HANDLE FORM SUBMIT */
  const handleFormSubmit = (formData) => {
    if (!formData.timeSlot) {
      alert("Please select a time slot");
      return;
    }

    const selectedStart = new Date(formData.timeSlot);

    const selectedEnd = selectedSlot.availableSlots.find(
      (slot) => slot.start.toISOString() === formData.timeSlot
    )?.end;

    if (!selectedEnd) {
      alert("Invalid time slot");
      return;
    }

    // FINAL APPOINTMENT OBJECT
    const finalAppointment = {
      ...formData,

      date: selectedStart.toISOString().split("T")[0],

      startTime: selectedStart.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),

      endTime: selectedEnd.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // POST to backend (optional)
    fetch("https://sibongadentalfrontend.onrender.com//api/getAllPatient", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalAppointment),
    });
    console.log("Appointment created:", finalAppointment);
    setShowFormModal(false);
    setModalMessage("Appointment Created Successfully!");
    setShowModalMessage(true);
  };



  /* FORM FIELDS */
  const appointmentFields = [
    {
      name: "fullName",
      label: "Patient",
      type: "select",
      required: true,
      options: patients.map((patient) => ({
        label: patient.fullName,
        value: patient.id,
      })),
    },
    {
      name: "doctorName",
      label: "Doctor",
      type: "select",
      required: true,
      options: doctors.map((doc) => ({
        label: doc.fullName,
        value: doc.id,
      })),
    },
    {
      name: "services",
      label: "Services",
      type: "select",
      required: true,
      options: services.map((service) => ({
        label: `${service.service_name} - $${service.price}`,
        value: service.id,
      })),
    },
    {
      name: "timeSlot",
      label: "Available Time",
      type: "select",
      required: true,
      options: selectedSlot
        ? selectedSlot.availableSlots.map((slot) => ({
            label: `${slot.start.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })} - ${slot.end.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}`,
            value: slot.start.toISOString(),
          }))
        : [],
    }, 
    { name: "email", label: "Email", type: "email" },
  ];

  /* UI RENDER */
  return (
    <div style={{ margin: "50px" }}>
      <h2>🦷 Admin Appointment Scheduler</h2>

      <CalendarBase
        role="admin"
        bookedAppointments={bookedAppointments}
        onSlotSelect={handleSlotSelect}
      />

      {showModalMessage && (
        <MessageModal
          message={modalMessage}
          onClose={() => setShowModalMessage(false)}
        />
      )}

      {showFormModal && (
        <ModalForm
          title="Create Appointment"
          fields={appointmentFields}
          onSubmit={handleFormSubmit}
          onClose={() => setShowFormModal(false)}
          submitText="Create"
        />
      )}
    </div>
  );
}
