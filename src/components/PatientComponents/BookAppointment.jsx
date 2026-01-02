import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CalendarBase from "../Calendar";
import ModalForm from "../ModalForm";

export default function PatientCalendar() {
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);
  const [services, setServices] = useState([]);
  const [formDefaultDate, setFormDefaultDate] = useState(null);

  const minSelectableDate = new Date();
  minSelectableDate.setHours(0, 0, 0, 0);

  // Fetch services when modal opens
  useEffect(() => {
    if (showFormModal) {
      fetch("https://sibongadentalfrontend.onrender.com/api/getAllServices")
        .then((res) => res.json())
        .then((data) => setServices(data))
        .catch((err) => console.error(err));
    }
  }, [showFormModal]);

  // Fetch doctors when modal opens
  useEffect(() => {
    if (showFormModal) {
      fetch("https://sibongadentalfrontend.onrender.com/api/getAllDoctor")
        .then((res) => res.json())
        .then((data) => setDoctors(data))
        .catch((err) => console.error(err));
    }
  }, [showFormModal]);

  // Handle calendar slot or date click
  const handleSlotSelect = (slotInfo, generateSlots) => {
    const clickedDate = new Date(slotInfo.start);
    clickedDate.setHours(0, 0, 0, 0);

    if (clickedDate < minSelectableDate) {
      toast.error("Booking is allowed only 1 day in advance.");
      return;
    }

    const slots = generateSlots(slotInfo.start);
    if (slots.length === 0) {
      toast.error("No available slots for this date.");
      return;
    }

    setSelectedSlot(slots);
    setFormDefaultDate(clickedDate);
    setShowFormModal(true);
  };

  // Handle form submission
  const handleSubmit = (formData) => {
    if (!formData.timeSlot) {
      toast.error("Please select a time slot");
      return;
    }

    const selectedStart = new Date(formData.timeSlot);
    const selectedEnd = selectedSlot.find(
      (slot) => slot.start.toISOString() === formData.timeSlot
    )?.end;

    const finalAppointment = {
      ...formData,
      paymentMethod,
      receiptFile,
      contactNumber: formData.contactNumber,
      email: formData.email,
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

    // Handle cash
    if (paymentMethod === "cash") {
      fetch("https://sibongadentalfrontend.onrender.com/api/appointments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalAppointment),
      })
        .then((res) => res.json())
        .then(() => toast.success("Appointment Submitted!"))
        .catch((err) => console.error(err));

      setShowFormModal(false);
      return;
    }

    // Handle GCASH / PAYMAYA
    if (!receiptFile) {
      toast.error("Please upload your payment receipt.");
      return;
    }

    const uploadData = new FormData();
    uploadData.append("receipt", receiptFile);
    uploadData.append("data", JSON.stringify(finalAppointment));

    fetch("https://sibongadentalfrontend.onrender.com/api/appointments/create", {
      method: "POST",
      body: uploadData,
    })
      .then((res) => res.json())
      .then(() => toast.success("Appointment Submitted with receipt!"))
      .catch((err) => console.error(err));

    setShowFormModal(false);
  };

  return (
    <div style={{ margin: "50px" }}>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        theme="light"
      />

      <h2>🧍 Patient Appointment Booking</h2>

      <CalendarBase
        role="patient"
        onSlotSelect={handleSlotSelect}
        minDate={minSelectableDate}
      />

      {showFormModal && (
        <ModalForm
          title="Book Appointment"
          fields={[
            { name: "fullName", label: "Full Name", type: "text", required: true },
            { name: "contactNumber", label: "Contact No.", type: "number", required: true },
            { name: "email", label: "Email", type: "email", required: true },
            {
              name: "services",
              label: "Services",
              type: "select",
              required: true,
              options: services.map((service) => ({
                label: `${service.service_name} - ₱${service.price}`,
                value: service.id,
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
              name: "timeSlot",
              label: "Choose Time",
              type: "select",
              required: true,
              options: selectedSlot.map((slot) => ({
                label: `${slot.start.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })} - ${slot.end.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`,
                value: slot.start.toISOString(),
              })),
              defaultValue: selectedSlot[0]?.start.toISOString(),
            },
            {
              name: "paymentMethod",
              label: "Payment Method",
              type: "select",
              required: true,
              options: [
                { label: "Cash", value: "cash" },
                { label: "GCash", value: "gcash" },
                { label: "PayMaya", value: "paymaya" },
              ],
              onChange: (e) => setPaymentMethod(e.target.value),
            },
            paymentMethod === "gcash" && {
              name: "gcashQR",
              type: "custom",
              component: (
                <div style={{ textAlign: "center", margin: "20px 0" }}>
                  <p>GCash: 0975 470 3971</p>
                </div>
              ),
            },
            paymentMethod === "paymaya" && {
              name: "mayaQR",
              type: "custom",
              component: (
                <div style={{ textAlign: "center", margin: "20px 0" }}>
                  <p>Paymaya: 0917 182 1861</p>
                </div>
              ),
            },
            (paymentMethod === "gcash" || paymentMethod === "paymaya") && {
              name: "receipt",
              label: "Upload Receipt",
              type: "file",
              required: true,
              onChange: (e) => setReceiptFile(e.target.files[0]),
            },
          ].filter(Boolean)}
          submitText="Submit Appointment"
          onSubmit={handleSubmit}
          onClose={() => setShowFormModal(false)}
        />
      )}
    </div>
  );
}
