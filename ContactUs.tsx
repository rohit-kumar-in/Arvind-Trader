import React from 'react';

export const ContactUs = () => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Thank you for your message. We will get back to you soon!');
        (e.target as HTMLFormElement).reset();
    };

    return (
        <div className="contact-form-container">
            <h2>Get in Touch</h2>
            <p>Have questions or need a custom quote? Fill out the form below and we'll contact you.</p>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="contact-name">Full Name</label>
                    <input type="text" id="contact-name" name="name" required />
                </div>
                <div className="form-group">
                    <label htmlFor="contact-email">Email</label>
                    <input type="email" id="contact-email" name="email" required />
                </div>
                <div className="form-group">
                    <label htmlFor="contact-mobile">Mobile Number</label>
                    <input type="tel" id="contact-mobile" name="mobile" required />
                </div>
                <div className="form-group">
                    <label htmlFor="contact-requirement">Requirement</label>
                    <textarea id="contact-requirement" name="requirement" rows={4} required placeholder="e.g., I need 5000 custom printed PP bags..."></textarea>
                </div>
                <button type="submit" className="btn" style={{width: '100%', marginTop: '1rem'}}>Send Message</button>
            </form>
        </div>
    );
};
