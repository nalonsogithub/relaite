import React from 'react';
import { Link } from 'react-router-dom';

function SignUp() {
    return (
        <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto", textAlign: "center" }}>
            <h1>Sign Up</h1>
            <p>Welcome to the signup page!</p>
            {/* Link to navigate back to the Welcome page */}
            <Link to="/" style={{ display: "inline-block", marginTop: "20px", padding: "10px 20px", backgroundColor: "#007BFF", color: "white", textDecoration: "none", borderRadius: "5px" }}>
                Back to Welcome
            </Link>
        </div>
    );
}

export default SignUp;
