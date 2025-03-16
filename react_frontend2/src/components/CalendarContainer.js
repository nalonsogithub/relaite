import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { differenceInCalendarDays, parseISO } from 'date-fns'; // Import date comparison functions
import styles from '../styles/CalendarContainer.module.css'; // Import your CSS module

const CalendarContainer = ({
  availableTimes = {}, // Default availableTimes prop
  agentEmail = 'agent@example.com', // Default agent email
  handleBackClick,
}) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  // Date selection handler
  const handleDateChange = (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    setSelectedDate(formattedDate);
    setSelectedTime(null); // Reset selected time when changing date
  };

  // Helper function to compare two dates
  const isSameDay = (a, b) => differenceInCalendarDays(a, b) === 0;

  // Highlight available dates by returning a specific CSS class
  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const formattedDate = date.toISOString().split('T')[0];
      const availableDates = Object.keys(availableTimes).map(parseISO);

      if (availableDates.some((availableDate) => isSameDay(availableDate, date))) {
        return styles.highlight; // Return the CSS module class for highlight
      }
    }
    return null;
  };

  // Disable past dates
  const disablePastDates = ({ date }) => {
    const today = new Date();
    return date < today.setHours(0, 0, 0, 0);
  };

  // Validate the form
  const validateForm = () => {
    const errors = {};
    if (!email) errors.email = 'Email is required';
    if (!phone) errors.phone = 'Phone number is required';
    return errors;
  };

  // Form submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    // Simulate email confirmation and submission
    console.log(`Meeting confirmed for ${selectedDate} at ${selectedTime}`);
    console.log(`Confirmation email sent to ${email} and agent at ${agentEmail}`);

    setSubmitted(true); // Mark as submitted
  };

  // If submitted, show confirmation message
  if (submitted) {
    return (
      <div className={styles.confirmationContainer}>
        <p>Your meeting has been scheduled for {selectedDate} at {selectedTime}!</p>
        <button onClick={handleBackClick}>Back to Contact</button>
      </div>
    );
  }

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.header}>
        <span className={styles.backIcon} onClick={handleBackClick}>
          &#8592;
        </span>
        <h2>Schedule a Meeting</h2>
      </div>

      {/* Calendar with disabled past dates and highlighted available dates */}
      <Calendar
        onChange={handleDateChange}
        value={new Date()}
        tileDisabled={disablePastDates}
        tileClassName={tileClassName} // Apply the tile-specific class
      />

      {selectedDate && (
        <div className={styles.timeSlotsContainer}>
          <h3>Available Times for {selectedDate}</h3>
          <div className={styles.timeSlots}>
            {availableTimes[selectedDate]?.length > 0 ? (
              availableTimes[selectedDate].map((time) => (
                <button
                  key={time}
                  className={`${styles.timeSlot} ${
                    selectedTime === time ? styles.selectedTime : ''
                  }`}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </button>
              ))
            ) : (
              <p>No available times for this day</p>
            )}
          </div>

          {selectedTime && (
            <form onSubmit={handleSubmit} className={styles.form}>
              <label>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              />
              {errors.email && <p className={styles.errorMessage}>{errors.email}</p>}

              <label>Phone:</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
              />
              {errors.phone && <p className={styles.errorMessage}>{errors.phone}</p>}

              <button type="submit" className={styles.submitButton}>
                Schedule Meeting
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarContainer;
