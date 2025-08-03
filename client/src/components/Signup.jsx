import React, { useState } from 'react';

function SignUp(props) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [message, setMessage] = useState('');

    const handleSignup = async (e) => {
        e.preventDefault();

        try{
        const response = await fetch('http://localhost:5000/api/auth/signup', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password, role }),
        });

        const data = await response.json();

        if (response.ok) {
            setMessage(`Sign up successful! Token: ${data.token}`);
        } else {
            setMessage(`Sign up failed: ${data.error}`); 
        }
        } catch (error) {
        setMessage(`Error: ${error.message}`);
        }
    };

    return (
        <div>
        <h2>Sign Up</h2>
        <form onSubmit={handleSignup}>
            <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            />
            <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            />
            <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            />
            <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
            </select>

                <button type="submit">Sign Up</button>
            <p>{message}</p>
        </form>
        </div>
    );

}


export default SignUp;