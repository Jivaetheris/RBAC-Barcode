import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FaWarehouse, FaListAlt, FaCartPlus, FaChartBar, FaCogs, FaClipboardList, FaUserCog } from 'react-icons/fa';

const MainLayout = ({ username, role, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    onLogout();
    navigate('/login');
  };

  const navItemsByRole = {
    admin: [
      { to: '/admin/warehouse', label: 'Warehouse', icon: <FaWarehouse /> },
      { to: '/admin/stock', label: 'Stocks', icon: <FaListAlt /> },
      { to: '/admin/order', label: 'Orders', icon: <FaCartPlus /> },
      { to: '/admin/product', label: 'Products', icon: <FaCogs /> },
      { to: '/admin/report', label: 'Reports', icon: <FaChartBar /> },
      { to: '/admin/role', label: 'Roles', icon: <FaUserCog /> },
      { to: '/admin/log', label: 'Logs', icon: <FaClipboardList /> },
    ],
    manager: [
      { to: '/manager/warehouse', label: 'Warehouse', icon: <FaWarehouse /> },
      { to: '/manager/stock', label: 'Stocks', icon: <FaListAlt /> },
      { to: '/manager/order', label: 'Orders', icon: <FaCartPlus /> },
      { to: '/manager/product', label: 'Products', icon: <FaCogs /> },
      { to: '/manager/report', label: 'Reports', icon: <FaChartBar /> },
    ],
    staff: [
      { to: '/staff/warehouse', label: 'Warehouse', icon: <FaWarehouse /> },
      { to: '/staff/stock', label: 'Stocks', icon: <FaListAlt /> },
      { to: '/staff/product', label: 'Products', icon: <FaCogs /> },
    ],
  };

  const navItems = navItemsByRole[role] || [];

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter, sans-serif' }}>

      {/* Sidebar */}
      <aside style={{
        width: '220px',
        backgroundColor: '#285943',
        color: 'white',
        padding: '20px 0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <img src="/logo.png" alt="Logo" style={{ height: '75px' }} />
          </div>

          <h3 style={{ marginLeft: '20px', marginBottom: '10px', fontSize: '16px' }}>Menu</h3>

          <ul style={{ listStyleType: 'none', padding: '0 10px' }}>
            {navItems.map(item => (
              <li key={item.to} style={{
                backgroundColor: location.pathname === item.to ? '#349E7A' : 'transparent',
                borderRadius: '5px',
                margin: '5px 0'
              }}>
                <Link to={item.to} style={{
                  color: 'white',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 15px'
                }}>
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <p style={{
          fontSize: '12px',
          textAlign: 'center',
          padding: '10px 0',
          color: 'white'
        }}>
          All Rights Reserved ©2025
        </p>
      </aside>

      {/* Main Panel */}
      <div style={{ flex: 1, backgroundColor: '#E3FAE7', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{
          margin: '20px',
          backgroundColor: '#285943',
          border: '1px solid #ccc',
          borderRadius: '6px',
          padding: '10px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Left side: Logo + Title */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" alt="Logo" style={{ height: '50px', marginLeft: '5px' }} />
            <span style={{
              fontWeight: 'bold',
              color: '#285943',
              fontFamily: 'Times New Roman, serif',
              marginLeft: '10px'
            }}>
            </span>
          </div>

          {/* Right side: Hello + Logout */}
          {role && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                padding: '8px 12px',
                backgroundColor: '#fff',
                borderRadius: '6px',
                border: '1px solid #ccc',
                minWidth: '160px',
                fontWeight: 'bold',
                color: '#285943',
                textAlign: 'center'
              }}>
                Hello {role.charAt(0).toUpperCase() + role.slice(1)}!
              </div>

              <button onClick={logout} style={{
                padding: '8px 14px',
                backgroundColor: 'white',
                color: '#285943',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <main style={{ flex: 1, padding: '0 20px 20px 20px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
