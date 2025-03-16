import React from "react";
import ContactComponent from "../components/Contact";
import styles from "../styles/ContactParent.module.css"; // Import the new style sheet

const ContactParent = () => {
  const handleUserSelection = (type) => {
    console.log(`User selected: ${type}`);
    // You can perform any action based on the user’s selection
  };

  return (
    <div className={styles.contactParentContainer}>
      <ContactComponent
        agentPhone="123-456-7890"
        agentEmail="agent@example.com"
        handleUserSelection={handleUserSelection}
      />
    </div>
  );
};

export default ContactParent;
