import React, { useState, useEffect } from 'react';
import RichTextEditor from '../../ui/RichTextEditor';
import './NotesModal.css';

const NotesModal = ({ isOpen, onClose, user, token, onSave }) => {
    const [notesContent, setNotesContent] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            setNotesContent(user.notes || '');
        }
    }, [isOpen, user]);

    const handleSave = async () => {
        if (!user) return;
        
        setSaving(true);
        try {
            const response = await fetch(`http://localhost:5000/api/users/${user._id}/notes`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ notes: notesContent })
            });

            if (response.ok) {
                onSave(user._id, notesContent);
                onClose();
            } else {
                // Failed to update notes
            }
        } catch (error) {
            // Error updating notes
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setNotesContent(user?.notes || '');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="notes-modal-overlay" onClick={handleCancel}>
            <div className="notes-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="notes-modal-header">
                    <h2>Edit Notes for {user?.name}</h2>
                    <button 
                        className="notes-modal-close-btn"
                        onClick={handleCancel}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>
                
                <div className="notes-modal-body">
                    <div className="notes-editor-container">
                        <RichTextEditor
                            value={notesContent}
                            onChange={setNotesContent}
                            placeholder="Add notes about this user..."
                            height="300px"
                        />
                    </div>
                </div>
                
                <div className="notes-modal-footer">
                    <button
                        onClick={handleCancel}
                        className="btn btn-secondary"
                        disabled={saving}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="btn btn-primary"
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save Notes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotesModal;
