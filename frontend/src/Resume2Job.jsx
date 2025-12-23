import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
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
    const [sessionId, setSessionId] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [showInputBar, setShowInputBar] = useState(false);

    const chatContainerRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
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
            setIsUploading(true);
            const newSessionId = uuidv4();
            setSessionId(newSessionId);
            const formData = new FormData();
            formData.append('session_id', newSessionId);
            formData.append('resume', resumeFile);
            if (typeof jdToUpload === 'string') {
                const jdBlob = new Blob([jdToUpload], { type: 'text/plain' });
                const jdFileFromText = new File([jdBlob], 'jd.txt');
                formData.append('jd', jdFileFromText);
            } else {
                formData.append('jd', jdToUpload);
            }
            fetch('https://resume2job-1.onrender.com/upload', {
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
                setIsUploading(false);
                setShowInputBar(true);
                setUploadMessage('Files uploaded successfully');
                setTimeout(() => setUploadMessage(null), 2000);
            })
            .catch(error => {
                console.error('Upload error:', error);
                setIsUploading(false);
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
        if (inputValue.trim() && !isLoading && sessionId) {
            const userMessage = {
                id: Date.now(),
                role: 'user',
                content: inputValue
            };
            setMessages(prev => [...prev, userMessage]);
            setInputValue('');
            setIsLoading(true);

            const assistantId = Date.now() + 1;
            setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', isTyping: true }]);

            const formData = new FormData();
            formData.append('session_id', sessionId);
            formData.append('prompt', inputValue);

            fetch('https://resume2job-1.onrender.com/query', {
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
                const words = data.split(' ');
                let wordIndex = 0;
                const typeNextWord = () => {
                    if (wordIndex < words.length) {
                        setMessages(prev => prev.map(msg => {
                            if (msg.id === assistantId) {
                                const newContent = words.slice(0, wordIndex + 1).join(' ');
                                const newIsTyping = wordIndex + 1 < words.length;
                                return { ...msg, content: newContent, isTyping: newIsTyping };
                            }
                            return msg;
                        }));
                        wordIndex++;
                        setTimeout(typeNextWord, 100);
                    } else {
                        setIsLoading(false);
                    }
                };
                typeNextWord();
            })
            .catch(error => {
                console.error('Query error:', error);
                setMessages(prev => prev.map(msg => {
                    if (msg.id === assistantId) {
                        return { ...msg, content: "Sorry, I couldn't process that query right now. Please try again.", isTyping: false };
                    }
                    return msg;
                }));
                setIsLoading(false);
            });
        }
    };

    const resetUploads = () => {
        setResumeFile(null);
        setJobDescription(null);
        setMessages([]);
        setJdToUpload(null);
        setSessionId(null);
        setShowInputBar(false);
    };

    return (
        <div className="min-h-screen flex flex-col bg-custom-bg text-text-color">
            <style>
                {`
                    .bg-custom-bg {
                        background-color: #1e1e1e;
                    }
                    .bg-panel {
                        background-color: #2a2a2a;
                    }
                    .text-text-color {
                        color: #e0e0e0;
                    }
                    .bg-input-bar {
                        background-color: #2a2a2a;
                    }
                    .bg-send-button {
                        background-color: #00bfff;
                    }
                    .bg-user-bubble {
                        background-color: #3a3a3a;
                    }
                    .bg-llm-bubble {
                        background-color: #3a3a3a;
                    }
                    .border-custom {
                        border-color: #374151;
                    }
                    .chat-container::-webkit-scrollbar {
                        width: 8px;
                    }
                    .chat-container::-webkit-scrollbar-track {
                        background: #1f2937;
                    }
                    .chat-container::-webkit-scrollbar-thumb {
                        background-color: #4b5563;
                        border-radius: 4px;
                    }
                    .animate-slide-in {
                        animation: slideIn 0.3s ease-out;
                    }
                    @keyframes slideIn {
                        from { transform: translateY(20px); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }
                    .animate-slide-up {
                        animation: slideUp 0.3s ease-out;
                    }
                    @keyframes slideUp {
                        from { transform: translateY(100%); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }
                    .animate-fade-in {
                        animation: fadeIn 0.3s ease-out;
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                `}
            </style>
            {uploadMessage && (
                <div className="fixed top-20 right-4 bg-send-button text-white p-3 rounded-lg shadow-lg z-50 animate-fade-in">
                    {uploadMessage}
                </div>
            )}
            <header className="fixed top-0 left-0 right-0 z-50 bg-panel border-b border-custom shadow-sm">
                <div className="max-w-3xl mx-auto p-2 sm:p-3">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-lg font-semibold"><span className='text-cyan-500'>Resume</span> 2 Job</h1>
                        </div>
                        {resumeFile && jobDescription && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 truncate max-w-[100px]">{resumeFile.name}</span>
                                <span className="text-xs text-gray-400 truncate max-w-[100px]">{jobDescription.name}</span>
                                <button 
                                    onClick={resetUploads}
                                    className="text-xs text-gray-400 hover:text-text-color bg-transparent border-none cursor-pointer"
                                >
                                    Change
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            <main className="flex-1 pt-16 pb-16">
                {isUploading ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-300"></div>
                        <p className="mt-4 text-gray-400">Uploading Documents...</p>
                    </div>
                ) : (!resumeFile || !jobDescription) ? (
                    <div className="flex flex-col items-center justify-center h-full py-8 px-4 sm:px-6">
                        <h2 className="text-lg font-semibold mb-6">Upload your documents to get started</h2>
                        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-3xl mx-auto">
                            <div className="flex-1 bg-panel rounded-xl p-4 border border-custom flex flex-col items-center cursor-pointer transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1">
                                <label htmlFor="resume-upload" className="w-full h-full flex flex-col items-center cursor-pointer">
                                    <div className="w-10 h-10 bg-gray-700/80 rounded-full flex items-center justify-center mb-2">
                                        <svg className="w-5 h-5 text-send-button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-base font-medium mb-2">Upload Resume</h3>
                                    <p className="text-gray-400 text-center text-sm mb-2">PDF, DOCX, or TXT files</p>
                                    {resumeFile ? (
                                        <div className="bg-gray-700/80 px-2 py-1 rounded-full text-xs">
                                            {resumeFile.name}
                                        </div>
                                    ) : (
                                        <div className="bg-send-button text-white px-3 py-1.5 rounded-md text-sm font-medium cursor-pointer hover:bg-blue-700">
                                            Select File
                                        </div>
                                    )}
                                    <input 
                                        id="resume-upload"
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,.docx,.txt"
                                        onChange={handleResumeUpload}
                                    />
                                </label>
                            </div>
                            <div 
                                className="flex-1 bg-panel rounded-xl p-4 border border-custom flex flex-col items-center cursor-pointer transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1"
                                onClick={() => setShowJdModal(true)}
                            >
                                <div className="w-10 h-10 bg-gray-700/80 rounded-full flex items-center justify-center mb-2">
                                    <svg className="w-5 h-5 text-send-button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-base font-medium mb-2">Upload Job Description</h3>
                                <p className="text-gray-400 text-center text-sm mb-2">Paste text or upload file</p>
                                {jobDescription ? (
                                    <div className="bg-gray-700/80 px-2 py-1 rounded-full text-xs">
                                        {jobDescription.name}
                                    </div>
                                ) : (
                                    <div className="bg-send-button text-white px-3 py-1.5 rounded-md text-sm font-medium cursor-pointer hover:bg-blue-700">
                                        Add Job Description
                                    </div>
                                )}
                            </div>
                        </div>
                        {(resumeFile || jobDescription) && (
                            <div className="mt-4 text-gray-400 text-sm max-w-3xl mx-auto px-4">
                                {resumeFile && !jobDescription && "Now add the job description to continue"}
                                {!resumeFile && jobDescription && "Now upload your resume to continue"}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-4 pb-40 flex flex-col h-full">
                        <div 
                            ref={chatContainerRef}
                            className="flex-1 overflow-y-auto flex flex-col gap-4 scroll-smooth chat-container"
                        >
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                                    <svg className="w-8 h-8 mb-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                    <p className="text-sm max-w-md">Ask me to analyze how your resume matches the job description, suggest improvements, or generate a cover letter.</p>
                                </div>
                            ) : (
                                messages.map((message) => (
                                    <div 
                                        key={message.id} 
                                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in`}
                                    >
                                        <div className={`p-3 max-w-[80%] ${message.role === 'user' ? 'bg-user-bubble' : 'bg-llm-bubble'} rounded-xl leading-6 text-text-color shadow-sm`}>
                                            <ReactMarkdown>{message.content}</ReactMarkdown>
                                            {message.isTyping && (
                                                <div className="flex gap-1 mt-2">
                                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </main>
            {showInputBar && (
                <div className="fixed bottom-0 left-0 right-0 z-50 bg-input-bar border-t border-custom animate-slide-up">
                    <div className="max-w-3xl mx-auto p-3">
                        <div className="flex items-end gap-2 bg-panel rounded-xl border border-custom focus-within:border-blue-600 transition-colors duration-300 p-2">
                            <textarea
                                ref={textareaRef}
                                value={inputValue}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                placeholder="Message Resume 2 Job..."
                                className="flex-1 bg-transparent outline-none resize-none min-h-[32px] max-h-[100px] text-text-color text-sm"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim() || isLoading}
                                className={`p-2 rounded-lg flex items-center justify-center ${inputValue.trim() && !isLoading ? 'bg-send-button hover:bg-blue-700' : 'bg-gray-700 cursor-not-allowed'}`}
                            >
                                <svg className="w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-center text-xs text-gray-500 mt-2">Resume 2 Job may produce inaccurate information. Always verify important details.</p>
                    </div>
                </div>
            )}
            {showJdModal && (
                <div className="fixed inset-0 bg-blue/60 flex items-center justify-center p-4 sm:p-6 z-50 animate-fade-in">
                    <div className="bg-panel rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto p-4 shadow-lg">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-base font-medium">Add Job Description</h3>
                            <button 
                                onClick={() => setShowJdModal(false)}
                                className="text-gray-400 hover:text-text-color bg-transparent border-none cursor-pointer"
                            >
                                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col">
                                <label className="text-xs font-medium mb-1">Paste Job Description</label>
                                <textarea
                                    value={jdText}
                                    onChange={handleJdTextChange}
                                    placeholder="Paste the job description here..."
                                    className="w-full bg-gray-700/80 border border-custom rounded-lg p-2 min-h-[80px] text-text-color outline-none text-sm"
                                />
                            </div>
                            <div className="text-center text-gray-400 text-xs">– OR –</div>
                            <div className="flex flex-col">
                                <label className="text-xs font-medium mb-1">Upload Job Description File</label>
                                <label htmlFor="jd-file-upload" className="flex flex-col items-center justify-center border-2 border-dashed border-custom rounded-lg p-3 cursor-pointer hover:border-gray-500 transition-colors duration-300">
                                    <svg className="w-6 h-6 text-gray-400 mb-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <span className="text-xs text-gray-400">Click to upload or drag and drop</span>
                                    <span className="text-xs text-gray-400 mt-1">PDF, DOCX, or TXT files</span>
                                    {jdFile && (
                                        <span className="text-xs bg-gray-700/80 px-2 py-1 rounded mt-1">
                                            {jdFile.name}
                                        </span>
                                    )}
                                    <input 
                                        id="jd-file-upload"
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,.docx,.txt"
                                        onChange={handleJdFileUpload}
                                    />
                                </label>
                            </div>
                            <div className="flex justify-end gap-2 mt-3">
                                <button
                                    onClick={() => setShowJdModal(false)}
                                    className="px-3 py-1 border border-custom rounded-md text-text-color hover:bg-gray-700/80 transition-colors duration-300 text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleJdTextSubmit}
                                    disabled={!jdText.trim() && !jdFile}
                                    className={`px-3 py-1 rounded-md text-white text-sm ${!jdText.trim() && !jdFile ? 'bg-gray-700 cursor-not-allowed' : 'bg-send-button hover:bg-blue-700'}`}
                                >
                                    Add Job Description
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Resume2Job;