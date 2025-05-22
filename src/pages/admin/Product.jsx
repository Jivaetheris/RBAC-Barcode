import React, { useEffect, useState } from 'react';
import { supabase } from '../../createClient';
import Barcode from 'react-barcode';

const Product = () => {
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
    const { data, error } = await supabase.from('suppliers').select('id, name');
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      category: '',
      supplier_id: '',
      cost_price: '',
      selling_price: '',
      barcode: ''
    });
    setEditingId(null);
    setError(null);
  };

  const saveProduct = async () => {
    setError(null);
    const payload = {
      name: formData.name,
      sku: formData.sku,
      category: formData.category,
      supplier_id: formData.supplier_id || null,
      cost_price: parseFloat(formData.cost_price),
      selling_price: parseFloat(formData.selling_price),
      barcode: formData.barcode || formData.sku
    };

    let response;
    if (editingId) {
      response = await supabase.from('products').update(payload).eq('id', editingId).select();
    } else {
      response = await supabase.from('products').insert([payload]).single();
    }

    if (response.error) {
      console.error('Save error:', response.error);
      setError(response.error.message);
      return;
    }

    resetForm();
    fetchProducts();
  };

  const editProduct = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name || '',
      sku: product.sku || '',
      category: product.category || '',
      supplier_id: product.supplier_id || '',
      cost_price: product.cost_price || '',
      selling_price: product.selling_price || '',
      barcode: product.barcode || product.sku || ''
    });
  };

  const deleteProduct = async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.error('Delete error:', error);
      setError(error.message);
    } else {
      fetchProducts();
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
      <h1 style={{ padding: '12px', fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Product Management</h1>

      {error && <p style={{ color: 'red', marginBottom: '10px' }}>Error: {error}</p>}

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>
          {editingId ? 'Update Product' : 'Add New Product'}
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          {['name', 'sku', 'category'].map((field) => (
            <input
              key={field}
              type="text"
              name={field}
              placeholder={field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              value={formData[field]}
              onChange={handleChange}
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                width: '200px'
              }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <select
            name="supplier_id"
            value={formData.supplier_id}
            onChange={handleChange}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', width: '200px' }}>
            <option value="">Select Supplier</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {['cost_price', 'selling_price'].map((field) => (
            <input
              key={field}
              type="number"
              name={field}
              placeholder={field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              value={formData[field]}
              onChange={handleChange}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', width: '200px' }}
              step="0.01"/>
          ))}
          <input
            type="text"
            name="barcode"
            placeholder="Barcode (defaults to SKU)"
            value={formData.barcode}
            onChange={handleChange}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', width: '200px' }}/>
        </div>

        <button onClick={saveProduct}
          style={{
            marginRight: '8px',
            padding: '8px 16px',
            background: '#2E8B57',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}>
          {editingId ? 'Update' : 'Create'}
        </button>
        {editingId && (
          <button onClick={resetForm}
            style={{
              padding: '8px 16px',
              background: '#FF5C5C',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}>
            Cancel
          </button>
        )}
      </section>

      <section>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>All Products</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: 'Arial, sans-serif',
            minWidth: '900px'}}>
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
                <th style={{ padding: '14px', textAlign: 'center' }}>Scan</th>
                <th style={{ padding: '14px', textAlign: 'left', width: '150px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product.id}
                  style={{
                    borderBottom: '1px solid #ddd',
                    backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white'}}>
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
                      width={1.2}
                      height={40}
                      displayValue={false}/>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button onClick={() => editProduct(product)}
                      style={{
                        marginRight: '6px',
                        padding: '6px 12px',
                        background: '#3CB371',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'}}>
                      Edit
                    </button>
                    <button onClick={() => deleteProduct(product.id)}
                      style={{
                        padding: '6px 12px',
                        background: '#FF5C5C',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'}}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Product;
