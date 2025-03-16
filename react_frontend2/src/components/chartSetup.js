// chartSetup.js
import { Chart, ArcElement, BarElement, LineElement, PointElement, PieController, DoughnutController, BarController, LineController, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';

// Register all necessary components
Chart.register(
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  PieController,
  DoughnutController,
  BarController,
  LineController,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);
