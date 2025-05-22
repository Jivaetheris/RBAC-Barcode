import React, { useEffect, useState } from "react";
import { supabase } from "../../createClient";

export default function Stock() {
  const [stocks, setStocks] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [newStock, setNewStock] = useState({
    product_id: "",
    warehouse_id: "",
    quantity: 0,
  });
  const [transfer, setTransfer] = useState({
    product_id: "",
    from_warehouse_id: "",
    to_warehouse_id: "",
    quantity: 0,
  });

  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [{ data: stockData }, { data: productData }, { data: warehouseData }] = await Promise.all([
        supabase.rpc("get_stocks_with_names"),
        supabase.from("products").select("*"),
        supabase.from("warehouses").select("*"),
      ]);

      setStocks(stockData || []);
      setProducts(productData || []);
      setWarehouses(warehouseData || []);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadStocksOnly() {
    try {
      const { data } = await supabase.rpc("get_stocks_with_names");
      setStocks(data || []);
    } catch (err) {
      console.error("Failed to load stocks:", err);
    }
  }

  async function handleAddStock(e) {
    e.preventDefault();
    setFormError("");
    const { product_id, warehouse_id, quantity } = newStock;
    const qty = Number(quantity);

    if (!product_id || !warehouse_id || qty <= 0) {
      setFormError("Please provide valid stock info.");
      return;
    }

    try {
      const { error: insertError } = await supabase
        .from("stock_entries")
        .insert([{ product_id, warehouse_id, quantity: qty }]);

      if (insertError) throw insertError;

      const { data: product } = await supabase
        .from("products")
        .select("stock")
        .eq("id", product_id)
        .single();

      const newStockLevel = (product?.stock || 0) + qty;

      const { error: updateError } = await supabase
        .from("products")
        .update({ stock: newStockLevel })
        .eq("id", product_id);

      if (updateError) {
        setFormError("Stock added, but failed to update product stock.");
      } else {
        setNewStock({ product_id: "", warehouse_id: "", quantity: 0 });
        loadStocksOnly();
      }
    } catch (err) {
      setFormError("Failed to add stock.");
      console.error(err);
    }
  }

  async function handleTransferStock(e) {
    e.preventDefault();
    setFormError("");
    const { product_id, from_warehouse_id, to_warehouse_id, quantity } = transfer;

    if (
      !product_id ||
      !from_warehouse_id ||
      !to_warehouse_id ||
      from_warehouse_id === to_warehouse_id ||
      quantity <= 0
    ) {
      setFormError("Invalid transfer data.");
      return;
    }

    try {
      const { error } = await supabase.rpc("transfer_stock", {
        in_product_id: product_id,
        from_warehouse_id,
        to_warehouse_id,
        transfer_quantity: Number(quantity),
      });

      if (error) throw error;

      setTransfer({
        product_id: "",
        from_warehouse_id: "",
        to_warehouse_id: "",
        quantity: 0,
      });

      loadStocksOnly();
    } catch (err) {
      setFormError("Transfer failed: " + err.message);
    }
  }

  const filteredStocks = selectedWarehouse
    ? stocks.filter((s) => s.warehouse_id.toString() === selectedWarehouse)
    : stocks;

  const lowStockItems = filteredStocks.filter((s) => s.quantity < 50);

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
      <h2 style={{ padding: "12px", fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>
        Stock Management
      </h2>

      <div style={{ marginBottom: "20px" }}>
        <label>
          Filter by Warehouse:{" "}
          <select
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            value={selectedWarehouse}
            style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", minWidth: "180px" }}
          >
            <option value="">All</option>
            {warehouses.map((wh) => (
              <option key={wh.id} value={wh.id}>
                {wh.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div
          style={{
            marginBottom: "20px",
            border: "1px solid #ffeeba",
            padding: "10px",
            borderRadius: "6px",
            color: "#856404",
          }}
        >
          <strong style={{color: "red"}}>Low Stock Alert:</strong>
          <ul style={{ margin: 0, paddingLeft: "20px" }}>
            {lowStockItems.map((item) => (
              <li key={item.id}>
                {item.product_name} in {item.warehouse_name} - Only {item.quantity} left
              </li>
            ))}
          </ul>
        </div>
      )}

      {loading ? (
        <p>Loading data...</p>
      ) : (
        <table width="100%" style={{ borderCollapse: "collapse", fontFamily: "Arial, sans-serif" }}>
          <thead style={{ backgroundColor: "#2E8B57", color: "white" }}>
            <tr>
              <th style={{ padding: "12px", textAlign: "left" }}>Product</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Warehouse</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Quantity</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredStocks.map((stock, index) => (
              <tr
                key={stock.id}
                style={{
                  borderBottom: "1px solid #ddd",
                  backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9f9f9",
                }}
              >
                <td style={{ padding: "10px" }}>{stock.product_name}</td>
                <td style={{ padding: "10px" }}>{stock.warehouse_name}</td>
                <td style={{ padding: "10px" }}>{stock.quantity}</td>
                <td style={{ padding: "10px" }}>
                  {stock.quantity === 0 ? (
                    <span style={{ color: "red", fontWeight: "bold" }}>Out of Stock</span>
                  ) : stock.quantity < 50 ? (
                      <span style={{ color: "orange", fontWeight: "bold" }}>Low</span>
                  ) : (
                    <span style={{ color: "#2e7d32", fontWeight: "bold" }}>Good</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {formError && <div style={{ color: "red", marginTop: "10px" }}>{formError}</div>}

      {/* Add Stock */}
      <h3 style={{ marginTop: "40px" }}>Add Stock</h3>
      <form onSubmit={handleAddStock} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <select
          required
          onChange={(e) => setNewStock({ ...newStock, product_id: e.target.value })}
          value={newStock.product_id}
          style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", minWidth: "180px" }}
        >
          <option value="">Select Product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          required
          onChange={(e) => setNewStock({ ...newStock, warehouse_id: e.target.value })}
          value={newStock.warehouse_id}
          style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", minWidth: "180px" }}
        >
          <option value="">Select Warehouse</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          min="1"
          placeholder="Quantity"
          value={newStock.quantity}
          onChange={(e) => setNewStock({ ...newStock, quantity: Number(e.target.value) })}
          style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", minWidth: "180px" }}
          required
        />

        <button
          type="submit"
          style={{
            backgroundColor: "#3CB371",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            padding: "6px 12px",
            cursor: "pointer",
          }}
        >
          Add
        </button>
      </form>

      {/* Transfer Stock */}
      <h3 style={{ marginTop: "30px" }}>Transfer Stock</h3>
      <form onSubmit={handleTransferStock} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <select
          required
          onChange={(e) => setTransfer({ ...transfer, product_id: e.target.value })}
          value={transfer.product_id}
          style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", minWidth: "180px" }}
        >
          <option value="">Select Product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          required
          onChange={(e) => setTransfer({ ...transfer, from_warehouse_id: e.target.value })}
          value={transfer.from_warehouse_id}
          style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", minWidth: "180px" }}
        >
          <option value="">From Warehouse</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>

        <select
          required
          onChange={(e) => setTransfer({ ...transfer, to_warehouse_id: e.target.value })}
          value={transfer.to_warehouse_id}
          style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", minWidth: "180px" }}
        >
          <option value="">To Warehouse</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          min="1"
          placeholder="Quantity"
          value={transfer.quantity}
          onChange={(e) => setTransfer({ ...transfer, quantity: Number(e.target.value) })}
          style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", minWidth: "180px" }}
          required
        />

        <button
          type="submit"
          style={{
            backgroundColor: "#FFA500",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            padding: "6px 12px",
            cursor: "pointer",
          }}
        >
          Transfer
        </button>
      </form>
    </div>
  );
}
