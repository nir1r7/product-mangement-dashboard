import React, { useState, useRef, useEffect } from 'react';
import './RichTextEditor.css';

const RichTextEditor = ({ value, onChange, placeholder = "Enter description..." }) => {
    const editorRef = useRef(null);
    const [isPreview, setIsPreview] = useState(false);
    const [activeFormats, setActiveFormats] = useState({
        bold: false,
        italic: false,
        underline: false,
        strikeThrough: false
    });

    useEffect(() => {
        if (editorRef.current && !isPreview && value !== editorRef.current.innerHTML) {
            editorRef.current.innerHTML = value || '';
        }
    }, [value, isPreview]);

    const updateActiveFormats = () => {
        if (!editorRef.current) return;

        setActiveFormats({
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline'),
            strikeThrough: document.queryCommandState('strikeThrough')
        });
    };

    const handleFormat = (command) => {
        if (!editorRef.current) return;

        editorRef.current.focus();
        document.execCommand(command, false, null);
        updateActiveFormats();

        // Trigger onChange after formatting
        setTimeout(() => {
            if (onChange) {
                onChange(editorRef.current.innerHTML);
            }
        }, 0);
    };

    const handleInput = () => {
        if (onChange && editorRef.current && !isPreview) {
            onChange(editorRef.current.innerHTML);
        }
        updateActiveFormats();
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

    const handleSelectionChange = () => {
        updateActiveFormats();
    };

    useEffect(() => {
        document.addEventListener('selectionchange', handleSelectionChange);
        return () => {
            document.removeEventListener('selectionchange', handleSelectionChange);
        };
    }, []);

    return (
        <div className="rich-text-editor">
            <div className="editor-toolbar">
                <button
                    type="button"
                    onClick={() => handleFormat('bold')}
                    className={`toolbar-btn ${activeFormats.bold ? 'active' : ''}`}
                    title="Bold (Ctrl+B)"
                >
                    <strong>B</strong>
                </button>
                <button
                    type="button"
                    onClick={() => handleFormat('italic')}
                    className={`toolbar-btn ${activeFormats.italic ? 'active' : ''}`}
                    title="Italic (Ctrl+I)"
                >
                    <em>I</em>
                </button>
                <button
                    type="button"
                    onClick={() => handleFormat('underline')}
                    className={`toolbar-btn ${activeFormats.underline ? 'active' : ''}`}
                    title="Underline (Ctrl+U)"
                >
                    <u>U</u>
                </button>
                <button
                    type="button"
                    onClick={() => handleFormat('strikeThrough')}
                    className={`toolbar-btn ${activeFormats.strikeThrough ? 'active' : ''}`}
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
                    onClick={() => {
                        // Save current content before toggling
                        if (!isPreview && editorRef.current && onChange) {
                            onChange(editorRef.current.innerHTML);
                        }
                        setIsPreview(!isPreview);
                    }}
                    className={`toolbar-btn ${isPreview ? 'active' : ''}`}
                    title="Toggle Preview"
                >
                    👁
                </button>
            </div>

            {isPreview ? (
                <div
                    className="editor-preview"
                    dangerouslySetInnerHTML={{ __html: value || '' }}
                />
            ) : (
                <div
                    ref={editorRef}
                    className="editor-content"
                    contentEditable
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                    suppressContentEditableWarning={true}
                    data-placeholder={placeholder}
                />
            )}
        </div>
    );
};

export default RichTextEditor;
