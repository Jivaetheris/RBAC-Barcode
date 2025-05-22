import React, { useEffect, useState } from 'react';
import { supabase } from '../../createClient';

const WarehouseS = () => {
  const [warehouses, setWarehouses] = useState([]);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  async function fetchWarehouses() {
    const { data, error } = await supabase.from('warehouses').select('*');
    if (error) {
      console.error('Fetch error:', error);
    } else {
      setWarehouses(data);
    }
  }

  const cellStyle = {
    padding: '12px 16px',
    borderBottom: '1px solid #ddd',
  };

  const headerCellStyle = {
    ...cellStyle,
    borderBottom: '2px solid #2E8B57',
    color: 'white',
    backgroundColor: '#2E8B57',
    textAlign:"left",
  };

  return (
    <div style={{
      maxHeight: '75vh',
      overflowY: 'auto',
      padding: '20px',
      backgroundColor: '#fff',
      borderRadius: '16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0',
    }}>
      <h2 style={{
        fontSize: '24px',
        fontWeight: '600',
        marginBottom: '20px',
        color: '#333',
      }}>
        Warehouses
      </h2>

      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontFamily: 'Arial, sans-serif',
      }}>
        <thead>
          <tr>
            <th style={headerCellStyle}>Name</th>
            <th style={headerCellStyle}>Location</th>
            <th style={headerCellStyle}>Capacity</th>
          </tr>
        </thead>
        <tbody>
          {warehouses.length > 0 ? (
            warehouses.map((wh, index) => (
              <tr
                key={wh.id}
                style={{
                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#f0f0f0',
                }}
              >
                <td style={cellStyle}>{wh.name}</td>
                <td style={cellStyle}>{wh.location}</td>
                <td style={cellStyle}>{wh.capacity}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" style={{ padding: '16px', textAlign: 'center', color: '#777' }}>
                No warehouses found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default WarehouseS;
