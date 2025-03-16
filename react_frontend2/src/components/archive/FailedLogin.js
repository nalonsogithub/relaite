import React from 'react';
import { Link } from 'react-router-dom';

function FailedLogin() {
  return (
    <div>
      <p>Login failed. Please try again.</p>
      <Link to="/login">Back to Login</Link>
    </div>
  );
}

export default FailedLogin;
