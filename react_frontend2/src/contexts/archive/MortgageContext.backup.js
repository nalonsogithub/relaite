import React, { createContext, useContext, useState, useEffect } from 'react';

// Create a context
const MortgageContext = createContext();

const renovationData = [
  {
    color: 'Teal',
    room: 'garage',
    description: "The detached garage is painted white and has a simple design. The driveway is asphalt, and there is a small staircase leading up to a side door. The garage door is a traditional, manual style.",
    reno_cost_list: ['Low', 'Medium', 'High'],
    reno_idea_list: [
      "Repaint the garage to freshen up its appearance ($100-$300).  Install new garage door hardware for improved functionality and aesthetics ($50-$150).  Add motion-sensor lighting for security and convenience ($50-$100).",
      "Replace the garage door with an automatic, insulated model ($500-$1,500).  Resurface the driveway for a smoother finish ($1,000-$2,000).  Install shelving or storage systems inside the garage ($200-$500).",
      "Convert the garage into a living space or home office ($10,000-$20,000). Add a carport or additional storage area adjacent to the garage ($3,000-$7,000). Upgrade the electrical system to support more power-intensive tools and appliances ($1,000-$3,000)."
    ],
    reno_cost_estimates: [150, 1500, 7500]
  },
  {
    color: 'Olive',
    room: 'dining room',
    description: "The dining room has a stone accent wall and a traditional chandelier hanging from the ceiling. The kitchen features dark wooden cabinetry and a mix of tile and wood elements. The room is well-lit with natural light from the windows, which are framed by heavy drapes.",
    reno_cost_list: ['Low', 'Medium', 'High'],
    reno_idea_list: [
      "Replace the chandelier with a modern lighting fixture ($100-$300). Update the curtains with lighter, more contemporary fabric ($50-$200). Apply a fresh coat of paint to the walls ($100-$200).",
      "Install new flooring, such as laminate or engineered wood ($500-$1,000). Update the kitchen backsplash with modern tiles ($300-$600). Replace cabinet hardware for a refreshed look ($100-$200).",
      "Remodel the kitchen with new cabinetry and countertops ($5,000-$10,000). Add a kitchen island for additional workspace and storage ($1,500-$3,000). Replace windows with energy-efficient models ($2,000-$5,000)."
    ],
    reno_cost_estimates: [150, 800, 7500]
  },	
  {
    color: 'lime',
    room: 'bathroom',
    description: "The bathroom features blue mosaic tiles covering the walls and a portion of the floor. There is a large mirror with ornate lighting fixtures surrounding it. The vanity has a white countertop with a blue sink, and there are white cabinets beneath the sink. The toilet is positioned next to the vanity.",
    reno_cost_list: ['Low', 'Medium', 'High'],
    reno_idea_list: [
      "Replace lighting fixtures with modern, energy-efficient LED lights ($50-$150). Apply a fresh coat of paint to the vanity and cabinets ($100-$200). Replace cabinet knobs with contemporary hardware ($20-$50).",
      "Install a new countertop with a modern material like quartz or granite ($300-$600). Replace the sink with a more contemporary design ($150-$300). Update the toilet to a more water-efficient model ($200-$400).",
      "Redo the tile work with modern, large-format tiles ($800-$1,500). Install a frameless glass shower enclosure ($1,000-$2,500). Upgrade the vanity to a custom-built piece with integrated lighting and storage ($1,500-$3,000)."
    ],
    reno_cost_estimates: [20, 500, 2000]
  },
  {
    color: 'blue',
    room: 'kitchen',
    description: "The kitchen has dark wooden cabinets with decorative glass panels and a mix of countertop materials. The backsplash features small, square tiles in a geometric pattern. There is a built-in desk area, and the flooring is tiled.",
    reno_cost_list: ['High', 'Medium', 'Low'],
    reno_idea_list: [
      "Fully remodel the kitchen with new cabinetry, countertops, and appliances ($10,000-$20,000). Add a kitchen island with seating and additional storage ($2,000-$5,000). Replace flooring with hardwood or high-end tile ($3,000-$6,000).",
      "Install new countertops with a durable material like quartz or granite ($1,000-$3,000). Replace the sink and faucet with modern, high-quality fixtures ($300-$600). Upgrade the lighting with under-cabinet LED lights and a new overhead fixture ($200-$500).",
      "Replace cabinet hardware with modern handles and knobs ($50-$150). Apply a fresh coat of paint to the cabinets ($200-$400). Update the backsplash with peel-and-stick tiles for a quick refresh ($100-$300)."
    ],
    reno_cost_estimates: [4500, 1500, 500]
  },
  {
    color: 'Purple',
    room: 'exterior',
    description: "The front of the home features white siding with red gable accents. There is a stone retaining wall along the front of the property and a well-maintained lawn with shrubs and trees. The chimney is made of stone and adds a rustic charm to the exterior.",
    reno_cost_list: ['Low', 'Medium', 'High'],
    reno_idea_list: [
      "Repaint the front door and trim to add a pop of color ($50-$150).  Update landscaping with new plants and mulch ($200-$500).  Clean and seal the stonework on the retaining wall and chimney ($100-$300).",
      "Install outdoor lighting to enhance curb appeal and security ($300-$600). Replace the front door with a modern, energy-efficient model ($500-$1,000). Add a new mailbox and house numbers for an updated look ($100-$200).",
      "Replace siding with a more modern material like fiber cement or vinyl ($8,000-$15,000). Install a new roof with architectural shingles ($5,000-$10,000). Add a front porch or deck for additional outdoor living space ($3,000-$7,000)."
    ],
    reno_cost_estimates: [150, 1500, 10000]
  },
];


const MortgageProvider = ({ children }) => {
  const [purchasePrice, setPurchasePrice] = useState(679900); // default value
  const [downPayment, setDownPayment] = useState(135980); // default to 20% of purchasePrice
  const [renovationCosts, setRenovationCosts] = useState(0);
  const [includedEstimates, setIncludedEstimates] = useState([]);
  const [selectedCostType, setSelectedCostType] = useState(Array(renovationData.length).fill(0)); // Initialize with the correct length
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
