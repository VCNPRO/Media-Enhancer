import React from 'react';

export const Test: React.FC = () => {
  return (
    <div style={{
      backgroundColor: 'red',
      color: 'white',
      padding: '50px',
      fontSize: '40px',
      textAlign: 'center'
    }}>
      <h1>FUNCIONA! ✅</h1>
      <button
        onClick={() => alert('Click funciona!')}
        style={{
          padding: '20px',
          fontSize: '30px',
          backgroundColor: 'green',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer'
        }}
      >
        Haz Click Aquí
      </button>
    </div>
  );
};
