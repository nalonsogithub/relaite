import React from 'react';

const MyComponent = () => {
  const handleClick = () => {
    alert('Button Clicked!');
  };

  return (
    <div>
      <h1>Welcome to My Simple Page</h1>
      <p>This is a simple paragraph.</p>
      <button onClick={handleClick}>Click Me</button>
    </div>
  );
};

export default MyComponent;
