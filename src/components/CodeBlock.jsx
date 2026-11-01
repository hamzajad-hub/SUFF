import React, { useState } from 'react';

export default function CodeBlock({ fileName, lines }) {
    const [copyLabel, setCopyLabel] = useState('Copy');
    const [manualCopy, setManualCopy] = useState(false);

    async function copyCode() {
        try {
            if (!navigator.clipboard?.writeText) {
                throw new Error('Clipboard unavailable');
            }
            await navigator.clipboard.writeText(lines.join('\n'));
            setManualCopy(false);
            setCopyLabel('Copied');
        } catch {
            setManualCopy(true);
            setCopyLabel('Select code below');
        }
        window.setTimeout(() => setCopyLabel('Copy'), 1500);
    }

    return (
        <div className="code-block">
            <div className="code-header">
                <span>▣</span>
                <span>{fileName}</span>
                <button
                    type="button"
                    onClick={copyCode}
                >
                    {copyLabel}
                </button>
            </div>
            {manualCopy && (
                <label className="manual-copy">
                    Automatic copying is unavailable. Select and copy this code:
                    <textarea
                        readOnly
                        value={lines.join('\n')}
                        rows={Math.min(lines.length + 1, 12)}
                        onFocus={(event) => event.currentTarget.select()}
                    />
                </label>
            )}
            <pre>
                {lines.map((line, index) => (
                    <code key={`${line}-${index}`}>
                        <span>{index + 1}</span>
                        {line || ' '}
                    </code>
                ))}
            </pre>
        </div>
    );
}
