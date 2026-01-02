import { useEffect, useState } from 'react';
import TableForm from '../../TableForm';

const ServiceRegistration = () => {
  const [services, setServices] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const columns = ["Service Name", "Description", "Price"];

  const rowTemplate = {
    service_name: { value: '', type: 'text' },
    description: { value: '', type: 'text' },
    price: { value: '', type: 'number', min: 0 },
  };

  const validateService = (service) => {
    if (!service.serviceName || !service.description || !service.price) {
      return 'All fields are required.';
    }
    if (service.price <= 0) {
      return 'Price must be greater than 0.';
    }
    return null;
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('https://sibongadentalfrontend.onrender.com/api/getallservices');
        const data = await response.json();
        setServices(data);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to fetch services.');
      }
    };
    fetchServices();
  }, []);

  const handleSubmit = async (service) => {
    setError('');
    setSuccess('');

    const validationError = validateService(service);
    if (validationError) {
      setError(validationError);
      return { success: false, message: validationError };
    }

    try {
      const response = await fetch('https://sibongadentalfrontend.onrender.com/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(service),
      });

      const data = await response.json();

      if (response.ok) {
        setServices((prev) => [...prev, { ...service, id: data.id }]);
        setSuccess('✅ Service added successfully!');
        return { success: true };
      } else {
        setError(data.message || 'Error adding service.');
        return { success: false };
      }
    } catch (err) {
      console.error('Network Error:', err);
      setError('Cannot connect to the server.');
      return { success: false };
    }
  };

  return (
    <div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>{success}</div>}
      <TableForm
        title="Add Services in Clinic"
        columns={columns}
        data={services}
        setData={setServices}
        rowTemplate={rowTemplate}
        onSave={handleSubmit}
      />
    </div>
  );
};

export default ServiceRegistration;
