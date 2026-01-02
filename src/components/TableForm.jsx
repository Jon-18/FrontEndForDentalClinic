import { useState } from 'react';
import '../style/components/tableform.css';
import Modal from './ModalMessage';

const TableForm = ({ columns, data, setData, title, rowTemplate, onSave }) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [currentRow, setCurrentRow] = useState(rowTemplate);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [loading, setLoading] = useState(false);
  


  const showModalMessage = (message) => {
    setModalMessage(message);
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentRow({
      ...currentRow,
      [name]: { ...currentRow[name], value },
    });
  };

  const handleAdd = () => {
    if (editingIndex !== null) {
      showModalMessage('Please finish editing before adding a new row.');
      return;
    }
    setEditingIndex(data.length);
    setCurrentRow(rowTemplate);
  };

  const handleSave = async (index) => {
    const values = Object.values(currentRow).map((field) => field.value);
    if (values.some((value) => value.toString().trim() === '')) {
      showModalMessage('Please fill out all fields before saving.');
      return;
    }

    const formattedRow = Object.fromEntries(
      Object.entries(currentRow).map(([key, { value }]) => [key, value])
    );

    setLoading(true);

    try {
      let saveResult = { success: true };
      if (onSave) {
        saveResult = await onSave(formattedRow);
      }

      if (saveResult.success) {
        const updated = [...data];
        if (index === data.length) {
          updated.push(formattedRow);
        } else {
          updated[index] = formattedRow;
        }

        setData(updated);
        setEditingIndex(null);
        setCurrentRow(rowTemplate);
        showModalMessage('✅ Registered successfully!');
      } else {
        showModalMessage(`❌ ${saveResult.message}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      showModalMessage('❌ Error saving to backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (index) => {
    if (editingIndex !== null) {
      showModalMessage('Please finish editing before editing another row.');
      return;
    }

    const editableRow = Object.fromEntries(
      Object.entries(rowTemplate).map(([key, { type, options }]) => [
        key,
        { value: data[index][key] ?? '', type, options },
      ])
    );

    setEditingIndex(index);
    setCurrentRow(editableRow);
  };

  const handleDelete = (index) => {
    const updated = data.filter((_, i) => i !== index);
    setData(updated);
    if (editingIndex === index) {
      setEditingIndex(null);
      setCurrentRow(rowTemplate);
    }
  };

  const renderInputField = (field) => {
    const fieldDef = rowTemplate[field];
    const fieldType = fieldDef.type;

    if (fieldType === 'select') {
      return (
        <select
          name={field}
          value={currentRow[field].value}
          onChange={handleChange}
          required
        >
          <option value="">-- Select --</option>
          {fieldDef.options?.map((opt, i) => (
            <option key={i} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        name={field}
        type={fieldType}
        value={currentRow[field].value}
        onChange={handleChange}
        required
        maxLength={fieldDef.maxLength || undefined}
        pattern={fieldDef.pattern || undefined}
      />
    );
  };

  return (
    <div className="table-container">
      <h2>{title}</h2>
      
      <button className="add-btn" onClick={handleAdd} disabled={loading}>
        + Add
      </button>

      <table className="dentist-table">
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i}>{col}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {editingIndex === index ? (
                <>
                  {Object.keys(rowTemplate).map((field, i) => (
                    <td key={i}>{renderInputField(field)}</td>
                  ))}
                  <td>
                    <button
                      className="save-btn"
                      onClick={() => handleSave(index)}
                      disabled={loading}
                    >
                      {loading ? '⏳ Saving...' : '💾 Save'}
                    </button>
                  </td>
                </>
              ) : (
                <>
                  {Object.keys(rowTemplate).map((field, i) => (
                    <td key={i}>{row[field]}</td>
                  ))}
                  <td>
                    <button
                      className="update-btn"
                      onClick={() => handleEdit(index)}
                      disabled={loading}
                    >
                      ✏️ Update
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(index)}
                      disabled={loading}
                    >
                      🗑 Delete
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}

          {editingIndex === data.length && (
            <tr>
              {Object.keys(rowTemplate).map((field, i) => (
                <td key={i}>{renderInputField(field)}</td>
              ))}
              <td>
                <button
                  className="save-btn"
                  onClick={() => handleSave(editingIndex)}
                  disabled={loading}
                >
                  {loading ? '⏳ Saving...' : '💾 Save'}
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {showModal && (
        <Modal message={modalMessage} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default TableForm;
