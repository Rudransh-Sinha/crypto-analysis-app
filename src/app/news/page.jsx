import Navbar from '@/components/Navbar';
import NewsSection from '@/components/NewsSection';

export default function NewsPage() {
    return (
        <main className="min-h-screen bg-[#0f1218] pt-20">
            <Navbar />
            <NewsSection />
        </main>
    );
}
