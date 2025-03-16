import React, { useState } from 'react';

const AigentStream = () => {
    const [inputValue, setInputValue] = useState('');
    const [responseText, setResponseText] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const response = await fetch("api/ask_stream", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ user_question: inputValue })
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        const processText = ({ done, value }) => {
            if (done) {
                console.log("Stream complete");
                return;
            }
            setResponseText(prev => prev + decoder.decode(value, { stream: true }));
            return reader.read().then(processText);
        };

        reader.read().then(processText);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', height: '100vh' }}>
            <h1>OpenAI Streaming Example</h1>
            <form onSubmit={handleSubmit}>
                <textarea
                    id="input"
                    placeholder="Enter your message"
                    cols="50"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                ></textarea>
                <button type="submit">Send</button>
            </form>
            <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', display: 'inline', maxWidth: '50%' }}>
                {responseText}
            </pre>
        </div>
    );
};

export default AigentStream;
