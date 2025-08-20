import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import './Profile.css';

const Profile = () => {
    const { token } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchProfile = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch profile');

            const data = await response.json();
            setProfile(data.user);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="profile-container">
                <div className="loading-container">
                    <div className="loading"></div>
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-container">
                <div className="error-container">
                    <h3>Error loading profile</h3>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <h1 className="profile-title">Profile</h1>
            
            <div className="profile-card">
                <div className="profile-header">
                    <div className="profile-avatar">
                        {profile?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="profile-info">
                        <h2>{profile?.name || 'User'}</h2>
                        <p className="profile-email">{profile?.email}</p>
                        <span className="profile-role">{profile?.role || 'user'}</span>
                    </div>
                </div>
                
                <div className="profile-details">
                    <div className="profile-section">
                        <h3>Account Information</h3>
                        <div className="profile-field">
                            <label>Name:</label>
                            <span>{profile?.name}</span>
                        </div>
                        <div className="profile-field">
                            <label>Email:</label>
                            <span>{profile?.email}</span>
                        </div>
                        <div className="profile-field">
                            <label>Role:</label>
                            <span className="profile-role-badge">{profile?.role}</span>
                        </div>
                        <div className="profile-field">
                            <label>Member Since:</label>
                            <span>{new Date(profile?.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
