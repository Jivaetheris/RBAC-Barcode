import React, { useEffect, useState } from 'react';
import { supabase } from '../../createClient';

const WarehouseM = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ name: '', location: '', capacity: '' });
  const [newWarehouse, setNewWarehouse] = useState({ name: '', location: '', capacity: '' });

  // Fetch warehouses on component mount
  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    const { data, error } = await supabase.from('warehouses').select('*').order('created_at', { ascending: false });
    if (error) console.error('Fetch error:', error);
    else setWarehouses(data);
  };

  const handleAddWarehouse = async () => {
    const { name, location, capacity } = newWarehouse;
    if (!name || !location || !capacity) return alert('Please fill in all fields.');

    const { data, error } = await supabase.from('warehouses').insert([{ name, location, capacity: parseInt(capacity) }]);
    if (error) return console.error('Insert error:', error);
    fetchWarehouses();
    setNewWarehouse({ name: '', location: '', capacity: '' });
    setShowAddForm(false);
  };

  const handleEditClick = (warehouse) => {
    setEditId(warehouse.id);
    setEditData({ name: warehouse.name, location: warehouse.location, capacity: warehouse.capacity });
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = async (id) => {
    const { name, location, capacity } = editData;
    const { error } = await supabase
      .from('warehouses')
      .update({ name, location, capacity: parseInt(capacity) })
      .eq('id', id);

    if (error) return console.error('Update error:', error);
    fetchWarehouses();
    setEditId(null);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this warehouse?');
    if (!confirmDelete) return;

    const { error } = await supabase.from('warehouses').delete().eq('id', id);
    if (error) console.error('Delete error:', error);
    else fetchWarehouses();
  };

  const handleCancel = () => setEditId(null);

  const filteredWarehouses = warehouses.filter((w) =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      style={{
        maxHeight: '75vh',
        overflowY: 'auto',
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #ddd',
        minWidth: '200px',
      }}
    >
      <h2 style={{ padding: '12px', fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        Warehouse
      </h2>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            padding: '10px 20px',
            background: '#3CB371',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
          }}
        >
          {showAddForm ? 'Cancel' : '+ Add New Warehouse'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <input
            type="text"
            placeholder="Search ..........."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc' }}
          />
          <button
            style={{
              padding: '8px 15px',
              background: '#3CB371',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
            }}
          >
            Search
          </button>
        </div>
      </div>

      <table width="100%" style={{ borderCollapse: 'collapse', fontFamily: 'Arial, sans-serif' }}>
        <thead style={{ backgroundColor: '#2E8B57', color: 'white' }}>
          <tr>
            <th style={{ padding: '12px', textAlign: 'left' }}>Warehouse Name</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Location</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Capacity</th>
            <th style={{ padding: '12px', textAlign: 'center' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredWarehouses.map((warehouse, index) => (
            <tr
              key={warehouse.id}
              style={{
                borderBottom: '1px solid #ddd',
                backgroundColor: index % 2 === 0 ? '#ffffff' : '#f5f5f5',
              }}
            >
              {editId === warehouse.id ? (
                <>
                  <td style={{ padding: '12px' }}>
                    <input
                      type="text"
                      name="name"
                      value={editData.name}
                      onChange={handleEditChange}
                      style={{
                        width: '100%',
                        padding: '6px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                      }}
                    />
                  </td>
                  <td style={{ padding: '12px' }}>
                    <input
                      type="text"
                      name="location"
                      value={editData.location}
                      onChange={handleEditChange}
                      style={{
                        width: '100%',
                        padding: '6px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                      }}
                    />
                  </td>
                  <td style={{ padding: '12px' }}>
                    <input
                      type="number"
                      name="capacity"
                      value={editData.capacity}
                      onChange={handleEditChange}
                      style={{
                        width: '100%',
                        padding: '6px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                      }}
                    />
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleSave(warehouse.id)}
                      style={{
                        marginRight: '8px',
                        padding: '6px 12px',
                        background: '#3CB371',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      style={{
                        padding: '6px 12px',
                        background: '#FF5C5C',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                      }}
                    >
                      Cancel
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td style={{ padding: '12px' }}>{warehouse.name}</td>
                  <td style={{ padding: '12px' }}>{warehouse.location}</td>
                  <td style={{ padding: '12px' }}>{warehouse.capacity}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleEditClick(warehouse)}
                      style={{
                        marginRight: '8px',
                        padding: '6px 12px',
                        background: '#3CB371',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                      }}
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleDelete(warehouse.id)}
                      style={{
                        padding: '6px 12px',
                        background: '#FF5C5C',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
          {showAddForm && (
            <tr style={{ backgroundColor: '#f0fff0' }}>
              <td style={{ padding: '12px' }}>
                <input
                  type="text"
                  placeholder="Warehouse Name"
                  value={newWarehouse.name}
                  onChange={(e) => setNewWarehouse({ ...newWarehouse, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '6px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                  }}
                />
              </td>
              <td style={{ padding: '12px' }}>
                <input
                  type="text"
                  placeholder="Location"
                  value={newWarehouse.location}
                  onChange={(e) => setNewWarehouse({ ...newWarehouse, location: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '6px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                  }}
                />
              </td>
              <td style={{ padding: '12px' }}>
                <input
                  type="number"
                  placeholder="Capacity"
                  value={newWarehouse.capacity}
                  onChange={(e) => setNewWarehouse({ ...newWarehouse, capacity: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '6px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                  }}
                />
              </td>
              <td style={{ padding: '12px', textAlign: 'right' }}>
                <button
                  onClick={handleAddWarehouse}
                  style={{
                    padding: '6px 12px',
                    background: '#3CB371',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                  }}
                >
                  Add Warehouse
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default WarehouseM;
