// Product.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../../createClient';
import Barcode from 'react-barcode';

const ProductS = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    supplier_id: '',
    cost_price: '',
    selling_price: '',
    barcode: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    const { data, error } = await supabase
      .from('suppliers')
      .select('id, name');
    if (error) console.error('Suppliers fetch error:', error);
    else setSuppliers(data);
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*, suppliers(name)')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Fetch error:', error);
      setError(error.message);
    } else {
      setProducts(data);
    }
  };

  return (
    <div
      style={{
        maxHeight: "75vh",
        overflowY: "auto",
        padding: "20px",
        backgroundColor: "#fff",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        border: "1px solid #ddd",
        minWidth: "200px",
      }}
    >
      <section>
        <h2 style={{
          padding: '12px',
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '20px'
        }}>All Products</h2>

        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontFamily: 'Arial, sans-serif',
          minWidth: '900px'
        }}>
          <thead style={{ backgroundColor: '#2E8B57', color: 'white' }}>
            <tr>
              <th style={{ padding: '14px', textAlign: 'left', width: '95px' }}>ID</th>
              <th style={{ padding: '14px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '14px', textAlign: 'left' }}>SKU</th>
              <th style={{ padding: '14px', textAlign: 'left' }}>Category</th>
              <th style={{ padding: '14px', textAlign: 'left' }}>Supplier</th>
              <th style={{ padding: '14px', textAlign: 'left' }}>Cost</th>
              <th style={{ padding: '14px', textAlign: 'left' }}>Price</th>
              <th style={{ padding: '14px', textAlign: 'left' }}>Barcode</th>
              <th style={{ padding: '14px', textAlign: 'left' }}>Scan</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr
                key={product.id}
                style={{
                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9',
                  borderBottom: '1px solid #ddd'
                }}
              >
                <td style={{ padding: '12px' }}>{product.id}</td>
                <td style={{ padding: '12px' }}>{product.name}</td>
                <td style={{ padding: '12px' }}>{product.sku}</td>
                <td style={{ padding: '12px' }}>{product.category}</td>
                <td style={{ padding: '12px' }}>{product.suppliers?.name}</td>
                <td style={{ padding: '12px' }}>₱{product.cost_price}</td>
                <td style={{ padding: '12px' }}>₱{product.selling_price}</td>
                <td style={{ padding: '12px' }}>{product.barcode}</td>
                <td style={{ padding: '12px' }}>
                  <Barcode
                    value={product.barcode || product.sku}
                    format="CODE128"
                    width={1}
                    height={40}
                    displayValue={false}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default ProductS;
