import React, { useState, useRef } from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onVerify: (code: string) => void;
    onResend: () => void;
}

const TwoFAModal: React.FC<Props> = ({ isOpen, onClose, onVerify, onResend }) => {
    const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value;
        if (value.length > 1) return;
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = () => {
        const fullCode = code.join('');
        onVerify(fullCode);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>
                    &times;
                </button>
                <h2>Authentication Code</h2>
                <p>Enter the 6-digit code sent to your email.</p>

                <div className="code-input-container">
                    {code.map((digit, index) => (
                        <input
                            key={index}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(e, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            ref={(el) => { inputRefs.current[index] = el; }} // TypeScript safe
                            className="code-input-box"
                        />
                    ))}
                </div>

                <button onClick={handleVerify} className="verify-button">
                    Verify
                </button>
                <button onClick={onClose} className="cancel-button">
                    Cancel
                </button>

                <p className="resend-text">
                    Didn't get the code?{' '}
                    <span className="resend-link" onClick={onResend}>
                        Resend code
                    </span>
                </p>
            </div>
        </div>
    );
};

export default TwoFAModal;
