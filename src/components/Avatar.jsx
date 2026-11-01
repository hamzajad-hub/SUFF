import React from 'react';

export default function Avatar({ initials, photo = '', small = false, showStatus = true }) {
    return (
        <span className={small ? 'avatar avatar-small' : 'avatar'}>
            {photo ? <img src={photo} alt="Profile photo" /> : initials}
            {showStatus && <i aria-label="Online" />}
        </span>
    );
}
