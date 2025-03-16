import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/MortgageCalculator.module.css'; 
//import LoadingOverlay from './LoadingOverlay';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../contexts/ChatContext';
import RenovationComponent from './renovationComponent';
import axios from 'axios';
import { useMortgage } from '../contexts/MortgageContext';

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
      asking_price_range: [600000, 750000],
	  downpayment: 140000,
	  annual_interest_rate: 7,
	  annual_interest_rate_range: [4, 10],
	  years: 30,
	  monthly_property_tax: 1500,
	  monthly_property_tax_range: [1000, 2000],
	  monthly_insurance: 1000,
	  monthly_insruance_range: [800, 1200],	
    }
  ];

	
	
  const { 
    purchasePrice, setPurchasePrice, 
    downPayment, setDownPayment, 
    renovationCosts, setRenovationCosts, 
    monthlyPayment 
  } = useMortgage();
	
//  const [purchasePrice, setPurchasePrice] = useState(mortgage_calculator_data[0].asking_price);
  const [purchasePrice_low] = useState(mortgage_calculator_data[0].asking_price_range[0]);
  const [purchasePrice_high] = useState(mortgage_calculator_data[0].asking_price_range[1]);

//  const [downPayment, setDownPayment] = useState(mortgage_calculator_data[0].downpayment); 
//  const [downPaymentPercent, setDownPaymentPercent] = useState(20); 
  const [years, setYears] = useState(mortgage_calculator_data[0].years);
  const [interestRate, setInterestRate] = useState(mortgage_calculator_data[0].annual_interest_rate);
  const [interestRate_low] = useState(mortgage_calculator_data[0].annual_interest_rate_range[0]);
  const [interestRate_high] = useState(mortgage_calculator_data[0].annual_interest_rate_range[1]);
  const [propertyTax, setPropertyTax] = useState(mortgage_calculator_data[0].monthly_property_tax);
  const [propertyTax_low] = useState(mortgage_calculator_data[0].monthly_property_tax_range[0]);
  const [propertyTax_high] = useState(mortgage_calculator_data[0].monthly_property_tax_range[1]);
  const [homeInsurance, setHomeInsurance] = useState(mortgage_calculator_data[0].monthly_insurance);
  const [homeInsurance_low] = useState(mortgage_calculator_data[0].monthly_insruance_range[0]);
  const [homeInsurance_high] = useState(mortgage_calculator_data[0].monthly_insruance_range[1]);
	
	
	
  const [downPaymentType, setDownPaymentType] = useState('dollar');
  const [monthlyMortgage, setMonthlyMortgage] = useState(0);
  const showPMINote = downPayment < (purchasePrice * 0.20);
  const [amortizationData, setAmortizationData] = useState({ interest: [], principal: [] });
  const [isLoading, setIsLoading] = useState(false);
  const chartRef = useRef(null);
  const navigate = useNavigate();
  const { carouselType, setCarouselType, assistantName, setAssistant } = useChat();
//  const [renovationCosts, setRenovationCosts] = useState(0);
  const [loanAmount, setLoanAmount] = useState(purchasePrice - downPayment);  

  const calculateMortgage = () => {
    const totalLoanAmount = purchasePrice + renovationCosts - downPayment;
    setLoanAmount(totalLoanAmount);

    let monthlyRate = interestRate / 100 / 12;
    let n = years * 12;

    let basicMortgage = totalLoanAmount * monthlyRate / (1 - Math.pow(1 + monthlyRate, -n));
    let monthlyPropertyTax = propertyTax;
    let monthlyInsurance = homeInsurance;
    let totalMortgage = basicMortgage + monthlyPropertyTax + monthlyInsurance;

    setMonthlyMortgage(totalMortgage);

    let amortization = { interest: [], principal: [] };
    let remainingBalance = totalLoanAmount;
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
    if (type === 'percent') {
		console.log('down payment percent');
      setDownPaymentPercent((downPayment / purchasePrice) * 100);
    } else {
      setDownPayment((downPaymentPercent / 100) * purchasePrice);
    }
  };
	
	const [downPaymentPercent, setDownPaymentPercent] = useState(20);

	
	
  useEffect(() => {
    calculateMortgage();
//    console.log('MC renovationCosts', renovationCosts);
  }, [purchasePrice, downPayment, interestRate, years, propertyTax, homeInsurance, renovationCosts]);

  useEffect(() => {
    if (chartRef.current && amortizationData.interest.length > 0) {
      updateChart(amortizationData);
    }
  }, [amortizationData]);

  const handleBackToCarousel = () => {
//    setCarouselType('main');
//	setAssistant('main');
    navigate('/WrapperMainSiteCarousel');
  };

  const handlePurchasePriceChange = (e) => {
    const roundedValue = roundToNearest(e.target.value, 5000);
    setPurchasePrice(roundedValue);
  };

  const handleDownPaymentChange = (e) => {
    const roundedValue = roundToNearest(e.target.value, 1000);
    setDownPayment(roundedValue);
    setDownPaymentPercent((roundedValue / purchasePrice) * 100);
  };	
	
  return (
    <div className={styles.whole_container}>
      <div className={styles.backbuttonContainer}>
        <button onClick={handleBackToCarousel} className={styles.backButton}>Back to Carousel</button>
      </div>  
      <div className={styles.calculatorContainer}>
        <div>
          <div>Your Monthly Mortgage Payment: {monthlyMortgage.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
          <canvas ref={chartRef} width="350" height="200"></canvas>
        </div>
        <div className={styles.mortgageComponentContainer}>
          Total Loan Amount: {loanAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </div>
		<div className={styles.mortgageComponentContainer}>
          <label htmlFor="purchase_price">Purchase Price:</label>
          <input
            type="range"
            id="purchase_price"
            name="purchase_price"
            min={purchasePrice_low}
            max={purchasePrice_high}
            value={purchasePrice}
            onChange={(e) => {
              const roundedValue = roundToNearest(e.target.value, 5000);
              setPurchasePrice(roundedValue);
            }}
          />
          <span id="purchasePriceValue">${purchasePrice.toLocaleString()}</span>
		</div>
		<div className={styles.mortgageComponentContainer}>
          <label htmlFor="down_payment">Down Payment:</label>
          {downPaymentType === 'dollar' ? (
            <input
              type="range"
              id="down_payment"
              name="down_payment"
              min="2000"
              max={purchasePrice}
              value={downPayment}
              onChange={(e) => {
                setUserInteracted(true);
                const roundedValue = roundToNearest(e.target.value, 1000);
                setDownPayment(roundedValue);
                setDownPaymentPercent((roundedValue / purchasePrice) * 100);
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
                const percentValue = Number(e.target.value);
                setDownPaymentPercent(percentValue);
                setDownPayment((percentValue / 100) * purchasePrice);
              }}
            />
          )}
		</div>
		<div className={styles.mortgageComponentContainer}>
          <div className={styles.downPaymentLabelNButton}>
			<div className={styles.dpTypeContainer}>
              <div className={styles.downPaymentValueContainer}>
	  	        {downPaymentType === 'dollar' ? (
			      <span id="downPaymentValue">${downPayment.toLocaleString()}</span>
		        ) : (
			      <span id="downPaymentValue">{downPaymentPercent.toFixed(0)}%</span>
		        )}
		      </div>			  

              <div className={styles.dp20buttonContainer}>
                <button  onClick={() => {
                  setDownPayment(purchasePrice * 0.20);
                  setUserInteracted(false);
                }} 
			    className={styles.reset20p}
				    >reset 20%</button>
              </div>
            </div>
            <div>
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
						
		    </div>
          </div>
        </div>
        
        <div className={styles.mortgageComponentContainer}>
          {showPMINote && <div id={styles.pmiNote}><strong>If less than 20% down payment, PMI will need to be discussed. Click <a href="/goto_pmi_faq">here</a> to go to an FAQ about PMI.</strong> </div>}
		</div>
        
		<div className={styles.mortgageComponentContainer}>
		  <label htmlFor="interest_rate">Annual Interest Rate (%):</label>
          <input type="range" id={interestRate} name="interest_rate" min={interestRate_low} max={interestRate_high} step="0.1"
               value={interestRate} onChange={handleInterestRateChange} />
          <span id="interestRateValue">{interestRate}%</span><br /><br />
		</div>

		<div className={styles.mortgageComponentContainer}>
          <label htmlFor="years">Years:</label>
          <input type="range" id="years" name="years" min="1" max="30"
               value={years} onChange={handleYearsChange} />
          <span id="yearsValue">{years}</span><br /><br />
		</div>

		<div className={styles.mortgageComponentContainer}>
          <label htmlFor="property_tax">Monthly Property Tax:</label>
          <input type="range" id="property_tax" name="property_tax" min={propertyTax_low} max={propertyTax_high}
               value={propertyTax} onChange={handlePropertyTaxChange} />
          <span id="propertyTaxValue">${propertyTax.toLocaleString()}</span><br /><br />
	    </div>

		<div className={styles.mortgageComponentContainer}>
          <div className={styles.sliderContainer} id="homeInsuranceContainer">
            <label htmlFor="home_insurance">Monthly Home Insurance:</label>
            <input type="range" id="home_insurance" name="home_insurance" min={homeInsurance_low} max={homeInsurance_high}
                 value={homeInsurance} onChange={handleHomeInsuranceChange} />
            <span id="homeInsuranceValue">${homeInsurance.toLocaleString()}</span><br /><br />
          </div>
		</div>
        <div className={styles.renoCompContainer}>
          <RenovationComponent setRenovationCosts={setRenovationCosts} />
		</div>
      </div>
    </div>
  );
};

export default MortgageCalculator;
