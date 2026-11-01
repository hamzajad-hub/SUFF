import React, { useEffect, useRef, useState } from 'react';
import Avatar from './Avatar.jsx';
import { validatePostFile } from '../utils/community.js';

function FilePreview({ file }) {
    const [url, setUrl] = useState('');
    const info = validatePostFile(file);
    useEffect(() => {
        const next = URL.createObjectURL(file);
        setUrl(next);
        return () => URL.revokeObjectURL(next);
    }, [file]);
    if (info.kind === 'image') return <img src={url} alt={`Preview: ${file.name}`} />;
    if (info.kind === 'video') return <video src={url} controls preload="metadata" aria-label={`Preview: ${file.name}`} />;
    return <span className="attachment-document">▤ {file.name}</span>;
}

export default function PostComposer({ onPublish, photo }) {
    const [text, setText] = useState('');
    const [files, setFiles] = useState([]);
    const [error, setError] = useState('');
    const input = useRef(null);

    function chooseFiles(event) {
        const chosen = [...event.target.files];
        event.target.value = '';
        if (files.length + chosen.length > 4) {
            setError('Attach up to four files per post.');
            return;
        }
        for (const file of chosen) {
            const result = validatePostFile(file);
            if (result.error) {
                setError(`${file.name}: ${result.error}`);
                return;
            }
        }
        if ([...files, ...chosen].reduce((sum, file) => sum + file.size, 0) > 60 * 1024 * 1024) {
            setError('Keep the total size of attachments under 60 MB.');
            return;
        }
        setFiles((current) => [...current, ...chosen]);
        setError('');
    }

    function publish(event) {
        event.preventDefault();
        if (!text.trim() && !files.length) return;
        onPublish(text.trim(), files);
        setText('');
        setFiles([]);
        setError('');
    }

    return (
        <form className="create-post media-composer" onSubmit={publish}>
            <Avatar initials="YO" photo={photo} small />
            <textarea aria-label="New post" value={text} onChange={(event) => setText(event.target.value)} maxLength={10000} placeholder="Share something with the SUF community..." />
            <div className="composer-attachments">
                {files.map((file, index) => (
                    <div className="composer-file" key={`${file.name}-${index}`}>
                        <FilePreview file={file} />
                        <span>{file.name}</span>
                        <button type="button" aria-label={`Remove ${file.name}`} onClick={() => setFiles((current) => current.filter((_, position) => position !== index))}>× Remove</button>
                    </div>
                ))}
            </div>
            <div className="composer-tools">
                <label>
                    ▣ Add picture, video, or document
                    <input ref={input} type="file" multiple accept=".png,.jpg,.jpeg,.webp,.gif,.mp4,.webm,.pdf,.txt,.md,.doc,.docx,.c,.cpp,.js" onChange={chooseFiles} />
                </label>
                <small>Up to 4 files · Images/documents 10 MB · Videos 50 MB</small>
            </div>
            {error && <p className="composer-error" role="alert">{error}</p>}
            <button className="publish-button" type="submit" disabled={!text.trim() && !files.length}>Post</button>
        </form>
    );
}
