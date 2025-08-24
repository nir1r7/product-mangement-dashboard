import React, { useState, useRef } from 'react';
import './RichTextEditor.css';

const RichTextEditor = ({ value, onChange, placeholder = "Enter description..." }) => {
    const textareaRef = useRef(null);
    const [isPreview, setIsPreview] = useState(false);

    const handleFormat = (command, value = null) => {
        document.execCommand(command, false, value);
        textareaRef.current.focus();
    };

    const handleTextChange = (e) => {
        onChange(e.target.innerHTML);
    };

    const handleKeyDown = (e) => {
        // Handle keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'b':
                    e.preventDefault();
                    handleFormat('bold');
                    break;
                case 'i':
                    e.preventDefault();
                    handleFormat('italic');
                    break;
                case 'u':
                    e.preventDefault();
                    handleFormat('underline');
                    break;
                default:
                    break;
            }
        }
    };

    return (
        <div className="rich-text-editor">
            <div className="editor-toolbar">
                <button
                    type="button"
                    onClick={() => handleFormat('bold')}
                    className="toolbar-btn"
                    title="Bold (Ctrl+B)"
                >
                    <strong>B</strong>
                </button>
                <button
                    type="button"
                    onClick={() => handleFormat('italic')}
                    className="toolbar-btn"
                    title="Italic (Ctrl+I)"
                >
                    <em>I</em>
                </button>
                <button
                    type="button"
                    onClick={() => handleFormat('underline')}
                    className="toolbar-btn"
                    title="Underline (Ctrl+U)"
                >
                    <u>U</u>
                </button>
                <button
                    type="button"
                    onClick={() => handleFormat('strikeThrough')}
                    className="toolbar-btn"
                    title="Strikethrough"
                >
                    <s>S</s>
                </button>
                <div className="toolbar-separator"></div>
                <button
                    type="button"
                    onClick={() => handleFormat('insertUnorderedList')}
                    className="toolbar-btn"
                    title="Bullet List"
                >
                    •
                </button>
                <button
                    type="button"
                    onClick={() => handleFormat('insertOrderedList')}
                    className="toolbar-btn"
                    title="Numbered List"
                >
                    1.
                </button>
                <div className="toolbar-separator"></div>
                <button
                    type="button"
                    onClick={() => setIsPreview(!isPreview)}
                    className={`toolbar-btn ${isPreview ? 'active' : ''}`}
                    title="Toggle Preview"
                >
                    👁
                </button>
            </div>

            {isPreview ? (
                <div
                    className="editor-preview"
                    dangerouslySetInnerHTML={{ __html: value }}
                />
            ) : (
                <div
                    ref={textareaRef}
                    className="editor-content"
                    contentEditable
                    onInput={handleTextChange}
                    onKeyDown={handleKeyDown}
                    dangerouslySetInnerHTML={{ __html: value }}
                    data-placeholder={placeholder}
                />
            )}
        </div>
    );
};

export default RichTextEditor;
