import React, { useEffect, useState } from "react";
import { supabase } from "../../createClient";

export default function StockM() {
  const [stocks, setStocks] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");


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

    </div>
  );
}
