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
  LineController
} from 'chart.js';

ChartJS.register(
  LineController,
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
  ];
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

  const renoCost = 0
  useEffect(() => {
    console.log('useEffect - purchasePrice:', purchasePrice, 'downPayment:', downPayment);
    setLoanAmount(purchasePrice + renoCost - downPayment);
  }, [purchasePrice, downPayment, renoCost]);


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

    </div>
  );
};

export default MortgageCalculator;
