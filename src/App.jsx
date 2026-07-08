import TopBar from './components/TopBar';
import PerformanceCard from './components/PerformanceCard';
import OverviewCard from './components/OverviewCard';
import HoldingsCard from './components/HoldingsCard';
import AllocationCard from './components/AllocationCard';

export default function App() {
  return (
    <div className="app">
      <TopBar />
      <div className="grid">
        <PerformanceCard />
        <OverviewCard />
        <HoldingsCard />
        <AllocationCard />
      </div>
    </div>
  );
}
