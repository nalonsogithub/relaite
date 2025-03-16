import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/MortgageCalculator.module.css'; 
import LoadingOverlay from './LoadingOverlay';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../contexts/ChatContext';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  LineController // Import LineController
} from 'chart.js';

ChartJS.register(
  LineController, // Register LineController
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const MortgageCalculator = () => {
  const mortgage_calculator_data = [
	  {
		  asking_price: 679000,
		  asking_price_range: [600000, 750000]
	  }
  ]
  const [purchasePrice, setPurchasePrice] = useState(mortgage_calculator_data[0].asking_price);
  const [purchasePrice_low, setPurchasePrice_low] = useState(mortgage_calculator_data[0].asking_price_range[0]);
  const [purchasePrice_high, setPurchasePrice_high] = useState(mortgage_calculator_data[0].asking_price_range[1]);
	
	
  const [downPayment, setDownPayment] = useState(200000); 
  const [downPaymentPercent, setDownPaymentPercent] = useState(20); 
  const [interestRate, setInterestRate] = useState(7);
  const [years, setYears] = useState(30);
  const [propertyTax, setPropertyTax] = useState(3000);
  const [homeInsurance, setHomeInsurance] = useState(1000);
  const [downPaymentType, setDownPaymentType] = useState('dollar');
  const [monthlyMortgage, setMonthlyMortgage] = useState(0);
  const showPMINote = downPayment < (purchasePrice * 0.20);
  const [amortizationData, setAmortizationData] = useState({ interest: [], principal: [] });
  const [isLoading, setIsLoading] = useState(false);
  const chartRef = useRef(null);
  const navigate = useNavigate();
  const { carouselType, setCarouselType } = useChat();
  const [renoCost, setRenoCost] = useState(0);
  const [renovations, setRenovations] = useState([]);	
  const [loanAmount, setLoanAmount] = useState(purchasePrice - downPayment);	
	
  const calculateMortgage = () => {
    let principal = purchasePrice - downPayment;
    let monthlyRate = interestRate / 100 / 12;
    let n = years * 12;
    
    let basicMortgage = principal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -n));
    let monthlyPropertyTax = propertyTax / 12;
    let monthlyInsurance = homeInsurance / 12;
    let totalMortgage = basicMortgage + monthlyPropertyTax + monthlyInsurance;

    setMonthlyMortgage(totalMortgage);

    let amortization = { interest: [], principal: [] };
    let remainingBalance = principal;
    for (let i = 1; i <= n; i++) {
      let interestPayment = remainingBalance * monthlyRate;
      let principalPayment = basicMortgage - interestPayment;
      remainingBalance -= principalPayment;

      amortization.interest.push(interestPayment);
      amortization.principal.push(principalPayment);
    }

    setAmortizationData(amortization);
    updateChart(amortization);
  };

  const updateChart = (amortizationData) => {
    const chartContext = chartRef.current.getContext('2d');

    if (window.myMortgageChart instanceof ChartJS) {
      window.myMortgageChart.destroy();
    }

    window.myMortgageChart = new ChartJS(chartContext, {
      type: 'line',
      data: {
        labels: Array.from({ length: years * 12 }, (_, i) => i + 1),
        datasets: [
          {
            label: 'Interest',
            data: amortizationData.interest,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          },
          {
            label: 'Principal',
            data: amortizationData.principal,
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  };

  const [userInteracted, setUserInteracted] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);

  const roundToNearest = (value, nearest) => {
    setHasChanged(true);
    return Math.round(value / nearest) * nearest;
  };

  const handleInterestRateChange = (event) => {
    setHasChanged(true);
    setInterestRate(Number(event.target.value));
  };

  const handleYearsChange = (event) => {
    setHasChanged(true);
    setYears(Number(event.target.value));
  };

  const handlePropertyTaxChange = (event) => {
    setHasChanged(true);
    setPropertyTax(Number(event.target.value));
  };

  const handleHomeInsuranceChange = (event) => {
    setHasChanged(true);
    setHomeInsurance(Number(event.target.value));
  };

  const updateDownPaymentSlider = (type) => {
    setDownPaymentType(type);
  };

  useEffect(() => {
    calculateMortgage();
  }, [purchasePrice, downPayment, interestRate, years, propertyTax, homeInsurance]);

  useEffect(() => {
    if (chartRef.current && amortizationData.interest.length > 0) {
      updateChart(amortizationData);
    }
  }, [amortizationData]);

	
	
	
  // ADDED 
  useEffect(() => {
    setLoanAmount(purchasePrice + renoCost - downPayment);
  }, [purchasePrice, downPayment, renoCost]);

  const handleRenoChange = (roomIndex, field, value) => {
    const updatedRenovations = [...renovations];
    updatedRenovations[roomIndex] = {
      ...updatedRenovations[roomIndex],
      [field]: value
    };
    setRenovations(updatedRenovations);
  };	
	
  const handleCheckboxChange = (roomIndex, checked) => {
    const updatedRenovations = [...renovations];
    updatedRenovations[roomIndex].included = checked;
    setRenovations(updatedRenovations);

    if (checked) {
      setRenoCost(renoCost + updatedRenovations[roomIndex].estimate);
    } else {
      setRenoCost(renoCost - updatedRenovations[roomIndex].estimate);
    }
  };

  const addCustomRenovation = () => {
    setRenovations([
      ...renovations,
      {
        room: '',
        description: '',
        cost: '',
        ideas: '',
        estimate: 0,
        included: false
      }
    ]);
  };
	
//  useEffect(() => {
//    setIsLoading(true);
//    fetch('api/fetch-mortgage-data', {
//      credentials: 'include'
//    })
//      .then(response => {
//        if (!response.ok) {
//          throw new Error('Network response was not ok');
//        }
//        return response.json();
//      })
//      .then(data => {
//        setPurchasePrice(data.purchasePrice);
//        setDownPayment(data.downPayment);
//        setIsLoading(false);
//      })
//      .catch(error => {
//        console.error('There has been a problem with your fetch operation:', error);
//        setIsLoading(false);
//      });
//  }, []);

  if (isLoading) {
    return <LoadingOverlay />;
  }

  const handleUpdateValues = async () => {
    const col_list = ['mort_purchase_price', 'mort_down_payment', 'mort_int_rate', 'mort_years', 'mort_property_tax', 'mort_home_insurance'];
    const val_list = [purchasePrice, downPayment, interestRate, years, propertyTax, homeInsurance].map(String);
    
    setIsLoading(true);

    try {
      const response = await fetch('/api/update-mortgage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ col_list, val_list }),
      });

      if (!response.ok) {
        throw new Error('Failed to update mortgage data');
      }

      const responseData = await response.json();
      console.log('Update successful:', responseData);
      setIsLoading(false);
      setHasChanged(false);
    } catch (error) {
      console.error('Error updating mortgage data:', error);
      setIsLoading(false);
    }
  };


  const renovationData = [
    {
      room: 'bathroom',
      description: "The bathroom features blue mosaic tiles covering the walls and a portion of the floor. There is a large mirror with ornate lighting fixtures surrounding it. The vanity has a white countertop with a blue sink, and there are white cabinets beneath the sink. The toilet is positioned next to the vanity.",
      reno_cost_list: ['High Cost', 'Medium Cost', 'Low Cost'],
      reno_idea_list: [
        "Replace lighting fixtures with modern, energy-efficient LED lights ($50-$150). Apply a fresh coat of paint to the vanity and cabinets ($100-$200). Replace cabinet knobs with contemporary hardware ($20-$50).",
        "Install a new countertop with a modern material like quartz or granite ($300-$600). Replace the sink with a more contemporary design ($150-$300). Update the toilet to a more water-efficient model ($200-$400).",
        "Redo the tile work with modern, large-format tiles ($800-$1,500). Install a frameless glass shower enclosure ($1,000-$2,500). Upgrade the vanity to a custom-built piece with integrated lighting and storage ($1,500-$3,000)."
      ],
      reno_cost_estimates: [1000, 500, 200]
    },
    {
      room: 'Kitchen',
      description: "The kitchen has dark wooden cabinets with decorative glass panels and a mix of countertop materials. The backsplash features small, square tiles in a geometric pattern. There is a built-in desk area, and the flooring is tiled.",
      reno_cost_list: ['High Cost', 'Medium Cost', 'Low Cost'],
      reno_idea_list: [
        "Fully remodel the kitchen with new cabinetry, countertops, and appliances ($10,000-$20,000). Add a kitchen island with seating and additional storage ($2,000-$5,000). Replace flooring with hardwood or high-end tile ($3,000-$6,000).",
        "Install new countertops with a durable material like quartz or granite ($1,000-$3,000). Replace the sink and faucet with modern, high-quality fixtures ($300-$600). Upgrade the lighting with under-cabinet LED lights and a new overhead fixture ($200-$500).",
        "Replace cabinet hardware with modern handles and knobs ($50-$150). Apply a fresh coat of paint to the cabinets ($200-$400). Update the backsplash with peel-and-stick tiles for a quick refresh ($100-$300)."
      ],
      reno_cost_estimates: [4500, 1500, 500]
    },
    // Add more rooms if needed
  ];
	
	
	
	
  const handleBackToCarousel = () => {
    setCarouselType('main');
    navigate('/carousel');
  };
	
  return (
    <div className={styles.whole_container}>
      {isLoading && <LoadingOverlay />}
      <div className={styles.backbuttonContainer}>
        <button onClick={handleBackToCarousel} className={styles.backButton}>Back to Carousel</button>
      </div>	  
      <div className={styles.calculatorContainer}>
        <div>
          <div>Your Monthly Mortgage Payment: {monthlyMortgage.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
          <canvas ref={chartRef} width="350" height="200"></canvas>
        </div>
        <label htmlFor="purchase_price">Purchase Price:</label>
        <input
          type="range"
          id="purchase_price"
          name="purchase_price"
          min={purchasePrice_low}
          max={purchasePrice_high}
          value={purchasePrice}
          onChange={(e) => {
            const roundedValue = roundToNearest(e.target.value, 25000);
            setPurchasePrice(roundedValue);
          }}
        />
        <span id="purchasePriceValue">${purchasePrice.toLocaleString()}</span>
        <br /><br />
       
        <label htmlFor="down_payment">Down Payment:</label>
        {downPaymentType === 'dollar' ? (
          <input
            type="range"
            id="down_payment"
            name="down_payment"
            min="2000"
            max="5000000"
            value={String(downPayment)}
            onChange={(e) => {
              setUserInteracted(true);
              const roundedValue = roundToNearest(e.target.value, 1000);
              setDownPayment(roundedValue);
            }}
          />
        ) : (
          <input
            type="range"
            id="down_payment_percent"
            name="down_payment_percent"
            min="0"
            max="100"
            value={String(downPaymentPercent)}
            onChange={(e) => {
              setUserInteracted(true);
              setDownPayment(e.target.value);
            }}
          />
        )}
        <div className={styles.downPaymentLabelNButton}>
          <div className={styles.downPaymentValueContainer}>
            <span id="downPaymentValue">${downPayment.toLocaleString()}</span>
          </div>
          <div className={styles.dp20buttonContainer}>
            <button onClick={() => {
              setDownPayment(purchasePrice * 0.20);
              setUserInteracted(false);
            }}>20%</button>
          </div>
        </div>
        <br /><br />
        
        <div className={styles.downPaymentType}>
          Down Payment Type:
          <label>
            <input
              type="radio"
              name="down_payment_type"
              value="dollar"
              checked={downPaymentType === 'dollar'}
              onChange={() => updateDownPaymentSlider('dollar')}
            />
            Dollar
          </label>
          <label>
            <input
              type="radio"
              name="down_payment_type"
              value="percent"
              checked={downPaymentType === 'percent'}
              onChange={() => updateDownPaymentSlider('percent')}
            />
            Percent
          </label>
        </div>
        {showPMINote && <div id={styles.pmiNote}><strong>If less than 20% down payment, PMI will need to be discussed. Click <a href="/goto_pmi_faq">here</a> to go to an FAQ about PMI.</strong></div>}
        
        <label htmlFor="interest_rate">Annual Interest Rate (%):</label>
        <input type="range" id="interest_rate" name="interest_rate" min="0.1" max="10" step="0.1"
               value={interestRate} onChange={handleInterestRateChange} />
        <span id="interestRateValue">{interestRate}%</span><br /><br />

        <label htmlFor="years">Years:</label>
        <input type="range" id="years" name="years" min="1" max="30"
               value={years} onChange={handleYearsChange} />
        <span id="yearsValue">{years}</span><br /><br />

        <label htmlFor="property_tax">Monthly Property Tax:</label>
        <input type="range" id="property_tax" name="property_tax" min="0" max="50000"
               value={propertyTax} onChange={handlePropertyTaxChange} />
        <span id="propertyTaxValue">${propertyTax.toLocaleString()}</span><br /><br />

        <div className={styles.sliderContainer} id="homeInsuranceContainer">
          <label htmlFor="home_insurance">Monthly Home Insurance:</label>
          <input type="range" id="home_insurance" name="home_insurance" min="0" max="50000"
                 value={homeInsurance} onChange={handleHomeInsuranceChange} />
          <span id="homeInsuranceValue">${homeInsurance.toLocaleString()}</span><br /><br />
        </div>
      </div>



      <div className={styles.renovationContainer}>
        <h2>Renovation Costs</h2>
        {renovationData.map((reno, index) => (
          <div key={index} className={styles.renovationSection}>
            <h3>{reno.room}</h3>
            <textarea value={reno.description} readOnly />
            <select onChange={(e) => handleRenoChange(index, 'cost', e.target.value)}>
              {reno.reno_cost_list.map((cost, costIndex) => (
                <option key={costIndex} value={cost}>
                  {cost}
                </option>
              ))}
            </select>
            <textarea
              value={
                reno.reno_cost_list.indexOf(renovations[index]?.cost) >= 0
                  ? reno.reno_idea_list[reno.reno_cost_list.indexOf(renovations[index]?.cost)]
                  : ''
              }
              readOnly
            />
            <input
              type="number"
              value={renovations[index]?.estimate || reno.reno_cost_estimates[0]}
              onChange={(e) => handleRenoChange(index, 'estimate', Number(e.target.value))}
            />
            <label>
              <input
                type="checkbox"
                checked={renovations[index]?.included || false}
                onChange={(e) => handleCheckboxChange(index, e.target.checked)}
              />
              Include this renovation
            </label>
          </div>
        ))}
        <button onClick={addCustomRenovation}>Add Custom Renovation</button>
      </div>





    </div>
  );
};

export default MortgageCalculator;
