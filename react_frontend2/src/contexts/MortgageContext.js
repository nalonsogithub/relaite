import React, { createContext, useContext, useState, useEffect } from 'react';

// Create a context
const MortgageContext = createContext();

const MortgageProvider = ({ children }) => {
  const [purchasePrice, setPurchasePrice] = useState(679900); // default value
  const [downPayment, setDownPayment] = useState(135980); // default to 20% of purchasePrice
  const [renovationCosts, setRenovationCosts] = useState(0);
  const [includedEstimates, setIncludedEstimates] = useState([]);
  const [selectedCostType, setSelectedCostType] = useState([]); // Initialize with an empty array
  const [customRenovation, setCustomRenovation] = useState({ name: '', description: '', estimate: '' });
  const [renovationData, setRenovationData] = useState([]);

  useEffect(() => {
    // Fetch renovation data from the server
    fetch('/api/get_reno_data')
      .then(response => response.json())
      .then(data => {
        setRenovationData(data);
        setSelectedCostType(Array(data.length).fill(0)); // Initialize selectedCostType based on data length
      })
      .catch(error => console.error('Failed to fetch renovation data', error));
  }, []);	

  const calculateLoanAmount = () => {
    return purchasePrice - downPayment + renovationCosts;
  };

  const calculateMonthlyPayment = (loanAmount) => {
    const interestRate = 0.04; // Example interest rate
    const loanTerm = 30; // Example loan term in years
    const monthlyInterestRate = interestRate / 12;
    const numberOfPayments = loanTerm * 12;
    return (
      (loanAmount * monthlyInterestRate) /
      (1 - Math.pow(1 + monthlyInterestRate, -numberOfPayments))
    );
  };

  useEffect(() => {
    const loanAmount = calculateLoanAmount();
    const newMonthlyPayment = calculateMonthlyPayment(loanAmount);
    setMonthlyPayment(newMonthlyPayment);
  }, [purchasePrice, downPayment, renovationCosts]);

  const [monthlyPayment, setMonthlyPayment] = useState(() => {
    const initialLoanAmount = calculateLoanAmount();
    return calculateMonthlyPayment(initialLoanAmount);
  });

  return (
    <MortgageContext.Provider
      value={{
        purchasePrice, setPurchasePrice,
        downPayment, setDownPayment,
        includedEstimates, setIncludedEstimates,
        selectedCostType, setSelectedCostType,
        customRenovation, setCustomRenovation,
        renovationCosts, setRenovationCosts,
        monthlyPayment,
        renovationData, setRenovationData // Provide renovationData and setRenovationData in the context
      }}
    >
      {children}
    </MortgageContext.Provider>
  );
};

// Custom hook for using the context
const useMortgage = () => {
  return useContext(MortgageContext);
};

export { MortgageProvider, useMortgage };
