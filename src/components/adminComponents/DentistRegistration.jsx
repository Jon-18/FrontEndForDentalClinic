import { useEffect, useState } from 'react';
import TableForm from '../TableForm';

const DentistRegistration = () => {
  const [dentists, setDentists] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const columns = [
    "Full Name",
    "Email",
    "Phone",
    "Specialization",
    "Experience (Years)",
    "License No.",
    "Address"
  ];

  const rowTemplate = {
    name: { value: '', type: 'text' },
    email: { value: '', type: 'email' },
    phone: { value: '', type: 'text', pattern: '\\d{11}', maxLength: 11 },
    specialization: { value: '', type: 'text' },
    experience: { value: '', type: 'number', min: 0 },
    licenseNumber: { value: '', type: 'text' },
    address:{ value: '', type: 'text' }
  };

  // ✅ Validation
  const validateDentist = (dentist) => {
    if (!dentist.name || !dentist.email || !dentist.phone || !dentist.specialization || !dentist.experience || !dentist.licenseNumber) {
      return 'All fields are required.';
    }
    const phoneRegex = /^\d{11}$/;
    if (!phoneRegex.test(dentist.phone)) {
      return 'Phone number must be 11 digits.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(dentist.email)) {
      return 'Invalid email format.';
    }
    return null;
  };

  // ✅ Fetch all dentists on load
  useEffect(() => {
    const fetchDentists = async () => {
      try {
        const response = await fetch('https://sibongadentalfrontend.onrender.com/api/dentists');
        const data = await response.json();
        setDentists(data);
      } catch (err) {
        console.error('Error fetching dentists:', err);
        setError('Failed to fetch dentist data.');
      }
    };
    fetchDentists();
  }, []);

  // ✅ Handle form submission
  const handleSubmit = async (dentist) => {
    setError('');
    setSuccess('');

    const validationError = validateDentist(dentist);
    if (validationError) {
      setError(validationError);
      return { success: false, message: validationError };
    }

    try {
      const response = await fetch('https://sibongadentalfrontend.onrender.com/api/dentists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dentist),
      });

      const data = await response.json();

      if (response.ok) {
        setDentists((prev) => [...prev, { ...dentist, id: data.id }]);
        return { success: true };
      } else {
        setError(data.message || 'Error registering dentist.');
        return { success: false, message: data.message || 'Error registering dentist.' };
      }
    } catch (err) {
      console.error('❌ Network Error:', err);
      setError('Cannot connect to the server. Please make sure the backend is running.');
      return { success: false, message: err.message };
    }
  };

  return (
    <div>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: '10px' }}>{success}</div>}

      <TableForm
        title="Dentist Management"
        columns={columns}
        data={dentists}
        setData={setDentists}
        rowTemplate={rowTemplate}
        onSave={handleSubmit}
      />
    </div>
  );
};

export default DentistRegistration;
