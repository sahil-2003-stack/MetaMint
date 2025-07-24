'use client';

import Image from 'next/image';
import { useState, useEffect, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Web3Context } from '@/app/context/Web3Context';
import { Wallet, ExternalLink, RefreshCw } from 'lucide-react';

const tierColors = {
  bronze: 'bg-amber-100 text-amber-800 border-amber-200',
  silver: 'bg-gray-100 text-gray-800 border-gray-200',
  gold: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

const tierIcons = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
};

export default function NFTGallery() {
  const { wallet, ownedNFTs, loadingNFTs, fetchOwnedNFTs } = useContext(Web3Context);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const { toast } = useToast();

  const handleCardClick = (nft) => {
    setSelectedNFT(nft);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = (open) => {
    setIsDialogOpen(open);
    if (!open) {
      setTimeout(() => setSelectedNFT(null), 300);
    }
  };

  const handleTransferNFT = () => {
    toast({
      title: "Transfer",
      description: "Transfer functionality coming soon",
    });
  };

  const handleViewOnBlockchain = () => {
    if (!selectedNFT) return;
    const url = `https://sepolia.etherscan.io/token/${selectedNFT.contract}?a=${selectedNFT.tokenId}`;
    window.open(url, '_blank');
  };

  const handleRefresh = () => {
    fetchOwnedNFTs();
    toast({
      title: "Refreshing",
      description: "Fetching your latest NFTs...",
    });
  };

  const groupNFTsByTier = () => {
    const grouped = { bronze: [], silver: [], gold: [] };
    ownedNFTs.forEach(nft => {
      if (grouped[nft.tier]) {
        grouped[nft.tier].push(nft);
      }
    });
    return grouped;
  };

  const groupNFTsBySource = () => {
    const grouped = { membership: [], core: [], partner: [] };
    ownedNFTs.forEach(nft => {
      if (nft.isMembership) {
        grouped.membership.push(nft);
      } else if (nft.isCoreDrop) {
        grouped.core.push(nft);
      } else if (nft.isPartnerDrop) {
        grouped.partner.push(nft);
      }
    });
    return grouped;
  };

  const renderNFTCard = (nft) => (
    <Card
      key={nft.id}
      onClick={() => handleCardClick(nft)}
      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{nft.name || `NFT #${nft.tokenId}`}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={tierColors[nft.tier]}>
              {tierIcons[nft.tier]} {nft.tier.charAt(0).toUpperCase() + nft.tier.slice(1)}
            </Badge>
            {nft.source && (
              <Badge variant="outline" className="text-xs">
                {nft.source}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative w-full aspect-square mb-3 rounded-lg overflow-hidden bg-muted">
          <Image
            src={nft.image || '/placeholder.svg'}
            alt={nft.name || `NFT #${nft.tokenId}`}
            fill
            className="object-cover"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {nft.description || `A unique ${nft.tier} tier NFT`}
        </p>
        <div className="mt-2 text-xs text-muted-foreground">
          Token ID: {nft.tokenId}
        </div>
        {nft.partnerSource && (
          <div className="mt-1 text-xs text-muted-foreground">
            Source: {nft.partnerSource}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="w-full aspect-square mb-3" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-3 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (!wallet) {
    return (
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-8">My NFT Collection</h1>
        <div className="text-center py-12">
          <Wallet className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-4">
            Connect your wallet to view your NFT collection
          </p>
        </div>
      </div>
    );
  }

  if (loadingNFTs) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My NFT Collection</h1>
          <Button variant="outline" size="sm" disabled>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Loading...
          </Button>
        </div>
        {renderSkeleton()}
      </div>
    );
  }

  const groupedNFTs = groupNFTsByTier();
  const sourceGroupedNFTs = groupNFTsBySource();

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My NFT Collection</h1>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      {ownedNFTs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No NFTs found in your collection</p>
          <Button onClick={handleRefresh}>Refresh</Button>
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="all">All ({ownedNFTs.length})</TabsTrigger>
            <TabsTrigger value="membership">Membership ({sourceGroupedNFTs.membership.length})</TabsTrigger>
            <TabsTrigger value="core">Core ({sourceGroupedNFTs.core.length})</TabsTrigger>
            <TabsTrigger value="partner">Partner ({sourceGroupedNFTs.partner.length})</TabsTrigger>
            <TabsTrigger value="bronze">Bronze ({groupedNFTs.bronze.length})</TabsTrigger>
            <TabsTrigger value="silver">Silver ({groupedNFTs.silver.length})</TabsTrigger>
            <TabsTrigger value="gold">Gold ({groupedNFTs.gold.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {ownedNFTs.map(renderNFTCard)}
            </div>
          </TabsContent>

          <TabsContent value="membership" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {sourceGroupedNFTs.membership.map(renderNFTCard)}
            </div>
          </TabsContent>

          <TabsContent value="core" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {sourceGroupedNFTs.core.map(renderNFTCard)}
            </div>
          </TabsContent>

          <TabsContent value="partner" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {sourceGroupedNFTs.partner.map(renderNFTCard)}
            </div>
          </TabsContent>

          <TabsContent value="bronze" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {groupedNFTs.bronze.map(renderNFTCard)}
            </div>
          </TabsContent>

          <TabsContent value="silver" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {groupedNFTs.silver.map(renderNFTCard)}
            </div>
          </TabsContent>

          <TabsContent value="gold" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {groupedNFTs.gold.map(renderNFTCard)}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {selectedNFT && (
        <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl">
                  {selectedNFT.name || `NFT #${selectedNFT.tokenId}`}
                </DialogTitle>
                <div className="flex items-center gap-2">
                  <Badge className={tierColors[selectedNFT.tier]}>
                    {tierIcons[selectedNFT.tier]} {selectedNFT.tier.charAt(0).toUpperCase() + selectedNFT.tier.slice(1)}
                  </Badge>
                  {selectedNFT.source && (
                    <Badge variant="outline">
                      {selectedNFT.source}
                    </Badge>
                  )}
                </div>
              </div>
            </DialogHeader>

            <div className="relative w-full aspect-square mb-4 rounded-lg overflow-hidden">
              <Image
                src={selectedNFT.image || '/placeholder.svg'}
                alt={selectedNFT.name || `NFT #${selectedNFT.tokenId}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Token ID:</span>
                    <p>{selectedNFT.tokenId}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Contract:</span>
                    <p className="font-mono text-xs">{selectedNFT.contract}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tier:</span>
                    <p className="capitalize">{selectedNFT.tier}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Owner:</span>
                    <p>{selectedNFT.owner}</p>
                  </div>
                  {selectedNFT.partnerSource && (
                    <div>
                      <span className="text-muted-foreground">Source:</span>
                      <p className="capitalize">{selectedNFT.partnerSource}</p>
                    </div>
                  )}
                  {selectedNFT.source && (
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <p className="capitalize">{selectedNFT.source}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedNFT.description || `A unique ${selectedNFT.tier} tier NFT with special benefits and privileges.`}
                </p>
              </div>

              {selectedNFT.metadata && (
                <div>
                  <h3 className="font-semibold mb-2">Metadata</h3>
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                    {JSON.stringify(selectedNFT.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Button onClick={handleTransferNFT} className="w-full sm:w-auto">
                Transfer NFT
              </Button>
              <Button onClick={handleViewOnBlockchain} variant="secondary" className="w-full sm:w-auto">
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Blockchain
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
