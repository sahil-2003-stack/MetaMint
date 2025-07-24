import Header from "../components/layout/header";
import Footer from "../components/layout/footer";
import NFTGallery from "../components/nft/nft-gallery";

export default function NFTsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow">
        <NFTGallery />
      </main>
      <Footer />
    </div>
  );
}
