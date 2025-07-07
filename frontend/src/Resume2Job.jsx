import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './resume2job.css';
import ReactMarkdown from 'react-markdown';

const Resume2Job = () => {
    const [resumeFile, setResumeFile] = useState(null);
    const [jobDescription, setJobDescription] = useState(null);
    const [showJdModal, setShowJdModal] = useState(false);
    const [jdText, setJdText] = useState('');
    const [jdFile, setJdFile] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [jdToUpload, setJdToUpload] = useState(null);
    const [uploadMessage, setUploadMessage] = useState(null);
    const [sessionId, setSessionId] = useState(null); // New state for session_id

    const chatContainerRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [inputValue]);

    useEffect(() => {
        if (resumeFile && jdToUpload) {
            setIsLoading(true);
            const newSessionId = uuidv4(); // Generate session ID here
            setSessionId(newSessionId); // Store the session ID
            const formData = new FormData();
            formData.append('session_id', newSessionId); // Use the new session ID
            formData.append('resume', resumeFile);
            if (typeof jdToUpload === 'string') {
                const jdBlob = new Blob([jdToUpload], { type: 'text/plain' });
                const jdFileFromText = new File([jdBlob], 'jd.txt');
                formData.append('jd', jdFileFromText);
            } else {
                formData.append('jd', jdToUpload);
            }
            fetch('http://localhost:5000/upload', {
                method: 'POST',
                body: formData,
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(data => {
                console.log('Upload success:', data);
                setJobDescription({
                    name: typeof jdToUpload === 'string' ? 'pasted_job_description.txt' : jdToUpload.name,
                    content: typeof jdToUpload === 'string' ? jdToUpload : 'File uploaded',
                });
                setJdToUpload(null);
                setIsLoading(false);
                setUploadMessage('Files uploaded successfully');
                setTimeout(() => setUploadMessage(null), 2000);
            })
            .catch(error => {
                console.error('Upload error:', error);
                setIsLoading(false);
                setUploadMessage('Upload failed. Please try again.');
                setTimeout(() => setUploadMessage(null), 2000);
            });
        }
    }, [resumeFile, jdToUpload]);

    const handleResumeUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setResumeFile(file);
        }
    };

    const handleJdFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setJdFile(file);
            setJdText('');
        }
    };

    const handleJdTextChange = (e) => {
        setJdText(e.target.value);
        setJdFile(null);
    };

    const handleJdTextSubmit = () => {
        if (jdText.trim() || jdFile) {
            setJdToUpload(jdFile || jdText);
            setShowJdModal(false);
            setJdText('');
            setJdFile(null);
        }
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleSendMessage = () => {
        if (inputValue.trim() && !isLoading && sessionId) { // Ensure session_id exists
            const userMessage = {
                id: Date.now(),
                role: 'user',
                content: inputValue
            };
            setMessages(prev => [...prev, userMessage]);
            setInputValue('');
            setIsLoading(true);

            const formData = new FormData();
            formData.append('session_id', sessionId);
            formData.append('prompt', inputValue);

            fetch('http://localhost:5000/query', {
                method: 'POST',
                body: formData,
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(data => {
                const aiResponse = {
                    id: Date.now() + 1,
                    role: 'assistant',
                    content: data // The response directly from the LLM
                };
                setMessages(prev => [...prev, aiResponse]);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Query error:', error);
                const errorMessage = {
                    id: Date.now() + 1,
                    role: 'assistant',
                    content: "Sorry, I couldn't process that query right now. Please try again."
                };
                setMessages(prev => [...prev, errorMessage]);
                setIsLoading(false);
            });
        }
    };

    const resetUploads = () => {
        setResumeFile(null);
        setJobDescription(null);
        setMessages([]);
        setJdToUpload(null);
        setSessionId(null); // Clear session ID on reset
    };

    return (
        <div className="app-container">
            <header className="app-header">
                <h1>Resume 2 Job</h1>
                <p>AI-powered resume to job description matching tool</p>
            </header>
            {uploadMessage && (
                <div className="upload-message">{uploadMessage}</div>
            )}
            <main className="app-main">
                {(!resumeFile || !jobDescription) ? (
                    <div className="upload-container">
                        <h2>Upload your documents to get started</h2>
                        <div className="upload-cards-container">
                            <div className="upload-card">
                                <label htmlFor="resume-upload" className="upload-label">
                                    <div className="upload-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h3>Upload Resume</h3>
                                    <p>PDF, DOCX, or TXT files</p>
                                    {resumeFile ? (
                                        <div className="file-name">
                                            {resumeFile.name}
                                        </div>
                                    ) : (
                                        <div className="select-file-button">
                                            Select File
                                        </div>
                                    )}
                                    <input 
                                        id="resume-upload"
                                        type="file"
                                        className="file-input"
                                        accept=".pdf,.docx,.txt"
                                        onChange={handleResumeUpload}
                                    />
                                </label>
                            </div>
                            <div 
                                className="upload-card"
                                onClick={() => setShowJdModal(true)}
                            >
                                <div className="upload-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3>Upload Job Description</h3>
                                <p>Paste text or upload file</p>
                                {jobDescription ? (
                                    <div className="file-name">
                                        {jobDescription.name}
                                    </div>
                                ) : (
                                    <div className="select-file-button green">
                                        Add Job Description
                                    </div>
                                )}
                            </div>
                        </div>
                        {(resumeFile || jobDescription) && (
                            <div className="upload-info">
                                {resumeFile && !jobDescription && "Now add the job description to continue"}
                                {!resumeFile && jobDescription && "Now upload your resume to continue"}
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="chat-header">
                            <div className="file-tags">
                                <span className="file-tag">
                                    {resumeFile.name}
                                </span>
                                <span className="file-tag">
                                    {jobDescription.name}
                                </span>
                            </div>
                            <button 
                                onClick={resetUploads}
                                className="change-files-button"
                            >
                                Change files
                            </button>
                        </div>
                        <div 
                            ref={chatContainerRef}
                            className="chat-container"
                        >
                            {messages.length === 0 ? (
                                <div className="empty-chat">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                    <h3>How can I help you today?</h3>
                                    <p>
                                        Ask me to analyze how your resume matches the job description, 
                                        suggest improvements, or generate a cover letter.
                                    </p>
                                </div>
                            ) : (
                                messages.map(message => (
                                    <div 
                                        key={message.id}
                                        className={`message-container ${message.role === 'user' ? 'user-message-container' : 'assistant-message-container'}`}
                                    >
                                        <div className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}>
                                            {messages.map((message, idx) => (
                                                <div key={idx} className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}>
                                                    <div className="message-paragraph">
                                                    <ReactMarkdown>{message.content}</ReactMarkdown>
                                                    </div>
                                                </div>
                                                ))}
                                        </div>
                                    </div>
                                ))
                            )}
                            {isLoading && (
                                <div className="message-container assistant-message-container">
                                    <div className="assistant-message">
                                        <div className="loading-dots">
                                            <div className="loading-dot"></div>
                                            <div className="loading-dot"></div>
                                            <div className="loading-dot"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>
            {(resumeFile && jobDescription) && (
                <div className="input-container">
                    <div className="input-bar">
                        <div className="textarea-container">
                            <textarea
                                ref={textareaRef}
                                value={inputValue}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                placeholder="Message Resume 2 Job..."
                                className="message-input"
                                rows="1"
                            />
                        </div>
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim() || isLoading}
                            className={`send-button ${inputValue.trim() ? 'active' : 'inactive'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>
                    <p className="input-disclaimer">
                        Resume 2 Job may produce inaccurate information. Always verify important details.
                    </p>
                </div>
            )}
            {showJdModal && (
                <div className="modal-overlay">
                    <div className="jd-modal">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>Add Job Description</h3>
                                <button 
                                    onClick={() => setShowJdModal(false)}
                                    className="modal-close-button"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="modal-section">
                                    <label>Paste Job Description</label>
                                    <textarea
                                        value={jdText}
                                        onChange={handleJdTextChange}
                                        placeholder="Paste the job description here..."
                                        className="jd-textarea"
                                    />
                                </div>
                                <div className="modal-divider">- OR -</div>
                                <div className="modal-section">
                                    <label>Upload Job Description File</label>
                                    <label htmlFor="jd-file-upload" className="file-upload-area">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <span>Click to upload or drag and drop</span>
                                        <span>PDF, DOCX, or TXT files</span>
                                        {jdFile && (
                                            <span className="uploaded-file-name">
                                                {jdFile.name}
                                            </span>
                                        )}
                                        <input 
                                            id="jd-file-upload"
                                            type="file"
                                            className="file-input"
                                            accept=".pdf,.docx,.txt"
                                            onChange={handleJdFileUpload}
                                        />
                                    </label>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        onClick={() => setShowJdModal(false)}
                                        className="cancel-button"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleJdTextSubmit}
                                        disabled={(!jdText.trim() && !jdFile) || isLoading}
                                        className={`submit-button ${(jdText.trim() || jdFile) && !isLoading ? 'active' : 'inactive'}`}
                                    >
                                        {isLoading ? 'Uploading...' : 'Add Job Description'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Resume2Job;