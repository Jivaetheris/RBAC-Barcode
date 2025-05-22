import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../createClient';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`id, username, password_hash, roles(name)`)
      .eq('username', username)
      .single();

    if (userError || !user || user.password_hash !== password) {
      setError('Invalid username or password');
      return;
    }

    const roleName = user.roles?.name;
    if (!roleName) {
      setError('User role not found');
      return;
    }

    localStorage.setItem('userRole', roleName);
    localStorage.setItem('username', user.username);
    onLogin(roleName);

    if (roleName === 'admin') navigate('/admin/warehouse');
    else if (roleName === 'manager') navigate('/manager/warehouse');
    else if (roleName === 'staff') navigate('/staff/warehouse');
    else setError('Unknown role');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoContainer}>
          <img src="/logo.png" alt="Logo" style={styles.logo} />
        </div>

        <h3 style={styles.heading}>Welcome, please login</h3>

        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="text"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>LOGIN</button>
          {error && <p style={styles.error}>{error}</p>}
        </form>

      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#e6f4ec',
  },
  card: {
    backgroundColor: '#1d4b3e',
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
    color: 'white',
  },
  logoContainer: {
    marginBottom: '20px',
  },
  logo: {
    width: '350px',
    marginBottom: '10px',
  },
  heading: {
    marginBottom: '20px',
    fontSize: '18px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '16px',
    backgroundColor: '#f3f3f3',
    color: '#333',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '12px',
    borderRadius: '6px',
    backgroundColor: '#4CAF50',
    border: 'none',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '16px',
    cursor: 'pointer',
  },
  error: {
    color: 'salmon',
    marginTop: '10px',
    fontSize: '14px',
  },
  footer: {
    marginTop: '20px',
    fontSize: '14px',
    color: '#ccc',
  },
  link: {
    color: '#90ee90',
    textDecoration: 'none',
    fontWeight: '500',
  },
};

export default Login;
