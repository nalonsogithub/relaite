import React, { useState, useEffect } from 'react';
import { useMortgage } from '../contexts/MortgageContext';
import { Pie } from 'react-chartjs-2';
import { Table, Form, Button, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Chart as ChartJS, ArcElement } from 'chart.js';
import styles from '../styles/RenovationComponent.module.css';

ChartJS.register(ArcElement);

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

const RenovationComponent = ({ setRenovationCosts }) => {
  const [data, setData] = useState(renovationData);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState('');
//  const [includedEstimates, setIncludedEstimates] = useState([]);
  const [selectedCostType, setSelectedCostType] = useState(Array(data.length).fill(0));

  const { includedEstimates, setIncludedEstimates } = useMortgage();	
	
  const [showChart, setShowChart] = useState(false);
  const [showCustomRenovation, setShowCustomRenovation] = useState(false);
	
  const [customRenovation, setCustomRenovation] = useState({ name: '', description: '', estimate: '' });
  const [totalRenoCost, setTotalRenoCost] = useState(0);	
	
//  useEffect(() => {
//    const totalCost = includedEstimates.reduce((sum, index) => sum + data[index].reno_cost_estimates[selectedCostType[index]], 0);
//    setRenovationCosts(totalCost);
//    console.log('Renovation Costs', totalCost);
//  }, [includedEstimates, selectedCostType, data, setRenovationCosts]);

  useEffect(() => {
    const totalCost = includedEstimates.reduce((sum, index) => sum + data[index].reno_cost_estimates[selectedCostType[index]], 0);

	setRenovationCosts(totalCost + (customRenovation.estimate ? parseFloat(customRenovation.estimate) : 0));
	  
    setTotalRenoCost(totalCost);
    setShowChart(includedEstimates.length > 0 || customRenovation.estimate);
  }, [includedEstimates, selectedCostType, data, customRenovation, setTotalRenoCost]);
	
  const handleCustomRenovationChange = (e) => {
    const { name, value } = e.target;
    setCustomRenovation({ ...customRenovation, [name]: value });
  };	
	
   const handleDetailClick = (index) => {
    setModalContent(data[index].reno_idea_list[selectedCostType[index]]);
    setShowModal(true);
  };

  const handleIncludeChange = (index) => {
    const newIncludedEstimates = [...includedEstimates];
    if (newIncludedEstimates.includes(index)) {
      newIncludedEstimates.splice(newIncludedEstimates.indexOf(index), 1);
    } else {
      newIncludedEstimates.push(index);
    }
    setIncludedEstimates(newIncludedEstimates);
  };

  const handleCostTypeChange = (event, index) => {
    const newSelectedCostType = [...selectedCostType];
    newSelectedCostType[index] = event.target.selectedIndex;
    setSelectedCostType(newSelectedCostType);
  };

  const handleCloseCustomRenovation = () => {
    setCustomRenovation({ name: '', description: '', estimate: '' });
    setShowCustomRenovation(false);
  };	
	
//  const pieData = {
//    labels: includedEstimates.map(index => data[index].room),
//    datasets: [{
//      data: includedEstimates.map(index => data[index].reno_cost_estimates[selectedCostType[index]]),
//      backgroundColor: includedEstimates.map(index => data[index].color)
//    }]
//  };
  const pieData = {
    labels: [
      ...includedEstimates.map(index => data[index].room),
      ...(customRenovation.estimate ? [customRenovation.name] : [])
    ],
    datasets: [{
      data: [
        ...includedEstimates.map(index => data[index].reno_cost_estimates[selectedCostType[index]]),
        ...(customRenovation.estimate ? [parseFloat(customRenovation.estimate)] : [])
      ],
      backgroundColor: [
        ...includedEstimates.map(index => data[index].color),
        ...(customRenovation.estimate ? ['#ADD8E6'] : [])  // Soft light blue for custom renovation
      ]
    }]
  };
	
  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };	
  return (
    <div className={styles.renovationContainer}>
      <div className={styles.renovationTitle}>Renovation Costs Breakdown</div>
	  {showChart && (
	    <div>
			<div className={styles.piechartcontainer}>
			  <Pie data={pieData} />
			</div>
            <div className={styles.totalCost}>
              Total Renovation Costs: {formatCurrency(totalRenoCost)}
            </div>	  
	  	</div>
	  )}
      <Table striped bordered hover className={styles.tableField}>
        <thead>
          <tr>
            <th>Room</th>
            <th>Cost</th>
            <th className={styles.estimateColumn}>Estimate</th>
            <th>Include</th>
            <th>Detail</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.room}</td>
              <td>
				<Form.Control type="text" value={formatCurrency(item.reno_cost_estimates[selectedCostType[index]])} className={styles.tableField} readOnly /></td>
                <td>
                  <Form.Check 
                    type="checkbox" 
                    onChange={() => handleIncludeChange(index)} 
                    checked={includedEstimates.includes(index)} 
                />
              </td>
              <td><Button onClick={() => handleDetailClick(index)} className={styles.buttonSmallFont}>View</Button></td>
            </tr>
          ))}
        </tbody>
      </Table>
<div className={styles.customRenovationContainer}>
  {!showCustomRenovation ? (
    <Button onClick={() => setShowCustomRenovation(true)} className={styles.buttonSmallFont}>Custom Renovation</Button>
  ) : (
    <div>
      <Form.Control
        type="text"
        placeholder="Name"
        name="name"
        value={customRenovation.name}
        onChange={handleCustomRenovationChange}
        className={styles.tableField}
      />
      <Form.Control
        as="textarea"
        rows={3}
        placeholder="Description"
        name="description"
        value={customRenovation.description}
        onChange={handleCustomRenovationChange}
        className={styles.tableField}
      />
      <Form.Control
        type="number"
        placeholder="Estimate"
        name="estimate"
        value={customRenovation.estimate}
        onChange={handleCustomRenovationChange}
        className={styles.tableField}
      />
      <Button onClick={handleCloseCustomRenovation} className={styles.buttonSmallFont}>Close</Button>
    </div>
  )}
</div>


      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Renovation Detail</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalContent}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RenovationComponent;
