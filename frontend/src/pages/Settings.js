import React from 'react';

function Settings() {
  return (
    <div>
      <h2>Settings</h2>
      
      <div className="card">
        <h3>Application Settings</h3>
        
        <div className="form-group">
          <label>Shop Name</label>
          <input 
            type="text" 
            value="Raza Traders" 
            disabled 
            style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed', fontWeight: 'bold' }} 
          />
          <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>Permanent shop name</small>
        </div>

        <div className="form-group">
          <label>Currency</label>
          <input 
            type="text" 
            value="₹ Indian Rupee (INR)" 
            disabled 
            style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }} 
          />
        </div>

        <div className="form-group">
          <label>Low Stock Alert Limit</label>
          <input type="number" defaultValue="10" placeholder="Default: 10 units" />
        </div>
      </div>

      <div className="card">
        <h3>About</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div>
            <p style={{ margin: '0 0 10px 0' }}><strong>🏪 Application</strong></p>
            <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>Raza Traders Stock Management System</p>
          </div>
          <div>
            <p style={{ margin: '0 0 10px 0' }}><strong>📱 Version</strong></p>
            <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>1.0.0</p>
          </div>
          <div>
            <p style={{ margin: '0 0 10px 0' }}><strong>👨‍💻 Developer</strong></p>
            <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>Salman Memon</p>
          </div>
        </div>
        <p style={{ marginTop: '20px', color: '#999', fontSize: '14px' }}>
          A professional stock management application for retail businesses. 
          Designed to streamline inventory, billing, and sales tracking.
        </p>
      </div>
    </div>
  );
}

export default Settings;
