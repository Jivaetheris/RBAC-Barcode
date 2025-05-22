import React, { useEffect, useState } from 'react';
import { supabase } from '../../createClient';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [newOrder, setNewOrder] = useState({ customer_name: '', status: 'Pending' });
  const [orderItems, setOrderItems] = useState([]);
  const [newItem, setNewItem] = useState({ product_id: '', quantity: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('id, name')
      .order('name', { ascending: true });
    if (error) console.error('Products fetch error:', error);
    else setProducts(data);
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('sales_orders')
      .select(`
        id,
        customer_name,
        order_date,
        status,
        sales_order_items (
          id,
          product_id,
          quantity
        )
      `)
      .order('order_date', { ascending: false });
    if (error) setError(error.message);
    else setOrders(data);
  };

  const handleOrderChange = e => {
    const { name, value } = e.target;
    setNewOrder(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = e => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
  };

  const addItem = () => {
    if (newItem.product_id && newItem.quantity) {
      setOrderItems(prev => [...prev, newItem]);
      setNewItem({ product_id: '', quantity: '' });
    }
  };

  const createOrder = async () => {
    setError(null);
    setLoading(true);

    try {
      const { data: order, error: orderErr } = await supabase
        .from('sales_orders')
        .insert([newOrder])
        .select()
        .single();

      if (orderErr) throw orderErr;

      if (orderItems.length) {
        const itemsToInsert = orderItems.map(item => ({
          sales_order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
        }));

        const { error: itemsErr } = await supabase
          .from('sales_order_items')
          .insert(itemsToInsert);

        if (itemsErr) throw itemsErr;
      }

      resetForm();
      await fetchOrders();
    } catch (err) {
      setError(err.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewOrder({ customer_name: '', status: 'Pending' });
    setOrderItems([]);
    setNewItem({ product_id: '', quantity: '' });
  };

  const updateOrderStatus = async (id, status) => {
    setLoading(true);
    const { error } = await supabase
      .from('sales_orders')
      .update({ status })
      .eq('id', id)
      .single();
    if (error) setError(error.message);
    else await fetchOrders();
    setLoading(false);
  };

  const deleteOrder = async id => {
    setLoading(true);
    await supabase.from('sales_order_items').delete().eq('sales_order_id', id);
    const { error } = await supabase.from('sales_orders').delete().eq('id', id);
    if (error) setError(error.message);
    else await fetchOrders();
    setLoading(false);
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
      <h1 style={{ padding: '12px', fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Order Management</h1>
      {error && <p style={{ color: 'red', marginBottom: '10px' }}>Error: {error}</p>}

      {/* New Order Form */}
      <section className="mb-6">
        <h2 style={{ padding: '12px', fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Create New Order</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
          <input
            type="text"
            name="customer_name"
            placeholder="Customer Name"
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', minWidth: '180px' }}
            value={newOrder.customer_name}
            onChange={handleOrderChange}
            disabled={loading}
          />
          <select
            name="status"
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', minWidth: '180px' }}
            value={newOrder.status}
            onChange={handleOrderChange}
            disabled={loading}
          >
            <option value="Pending">Pending</option>
            <option value="In Transit">In Transit</option>
            <option value="Received">Received</option>
          </select>
          <select
            name="product_id"
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', minWidth: '180px' }}
            value={newItem.product_id}
            onChange={handleItemChange}
            disabled={loading}
          >
            <option value="">Select product...</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', width: '120px' }}
            value={newItem.quantity}
            onChange={handleItemChange}
            disabled={loading}
          />
          <button
            onClick={addItem}
            disabled={loading || !newItem.product_id || !newItem.quantity}
            style={{
              padding: '10px 20px',
              background: '#3CB371',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold'
            }}
          >
            +  Add Item
          </button>
        </div>

        {orderItems.length > 0 && (
          <ul className="mb-4">
            {orderItems.map((item, i) => {
              const prod = products.find(p => p.id === item.product_id);
              return <li key={i}>{`${prod?.name || item.product_id} x ${item.quantity}`}</li>;
            })}
          </ul>
        )}

        <button
          onClick={createOrder}
          disabled={loading || !orderItems.length}
          style={{
            padding: '10px 20px',
            background: '#3CB371',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Processing...' : 'Create Order'}
        </button>
      </section>

      {/* Orders Table */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>All Orders</h2>
        <table width="100%" style={{ borderCollapse: 'collapse', fontFamily: 'Arial, sans-serif' }}>
          <thead style={{ backgroundColor: '#2E8B57', color: 'white' }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Customer</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Items</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr
                key={order.id}
                style={{
                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9',
                  borderBottom: '1px solid #eee'
                }}
              >
                <td style={{ padding: '12px' }}>{order.id}</td>
                <td style={{ padding: '12px' }}>{order.customer_name}</td>
                <td style={{ padding: '12px' }}>{new Date(order.order_date).toLocaleDateString()}</td>
                <td style={{ padding: '12px' }}>
                  <select
                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc', minWidth: '140px' }}
                    value={order.status}
                    onChange={e => updateOrderStatus(order.id, e.target.value)}
                    disabled={loading}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Received">Received</option>
                    <option value="Backordered">Backordered</option>
                  </select>
                </td>
                <td style={{ padding: '12px' }}>
                  <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
                    {order.sales_order_items.map(item => {
                      const prod = products.find(p => p.id === item.product_id);
                      return (
                        <li key={item.id} style={{ marginBottom: '4px' }}>
                          {`${prod?.name || item.product_id} x ${item.quantity}`}
                        </li>
                      );
                    })}
                  </ul>
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <button
                    onClick={() => deleteOrder(order.id)}
                    style={{
                      padding: '6px 14px',
                      background: '#FF5C5C',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default Orders;
