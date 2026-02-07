import Navbar from '@/components/Navbar';
import ChartAnalyzer from '@/components/ChartAnalyzer';

export default function Home() {
  return (
    <main className="min-h-screen pb-20 bg-[#0f1218]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight text-white">
          AI-Powered <br /> <span className="text-blue-500">Crypto Intelligence</span>
        </h1>
        <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Upload your chart. Get institutional-grade technical analysis,
          buy/sell signals, and sentiment data instantly.
        </p>

        <ChartAnalyzer />
      </div>
    </main>
  );
}
