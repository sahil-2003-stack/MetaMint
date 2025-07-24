"use client";

import React, { createContext, useState, useEffect } from "react";
import { getContractInstance } from "../utils/contract";

export const Web3Context = createContext(null);

export const Web3Provider = ({ children }) => {
    const [wallet, setWallet] = useState(null);
    const [contract, setContract] = useState(null);
    const [contractReadOnly, setContractReadOnly] = useState(null);
    const [mintStatus, setMintStatus] = useState(null);
    const [ownedNFTs, setOwnedNFTs] = useState([]);
    const [loadingNFTs, setLoadingNFTs] = useState(false);

    // Connect wallet function
    const connectWallet = async () => {
        if (typeof window === "undefined" || !window.ethereum) {
            alert("No Ethereum wallet detected! Please install MetaMask from https://metamask.io/ and refresh the page.");
            return;
        }
        if (!window.ethereum.isMetaMask) {
            alert("A wallet was detected, but it is not MetaMask. Please use MetaMask for the best experience.");
            return;
        }

        try {
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });

            if (!accounts || accounts.length === 0) {
                alert("No account was returned. Please connect your wallet.");
                return;
            }

            setWallet(accounts[0]);
        } catch (error) {
            console.error("Error connecting wallet:", error?.message || error);
            alert("Failed to connect wallet. Please check MetaMask and try again.");
            return;
        }

        try {
            // Get both contract instances
            const { contract, contractReadOnly } = await getContractInstance();
            setContract(contract);
            setContractReadOnly(contractReadOnly);
        } catch (error) {
            console.error("Error getting contract instance:", error?.message || error);
            // Optionally show an alert if needed
            // alert("Wallet connected, but failed to load smart contract.");
        }
    };

    // Disconnect wallet by instructing user to remove site from MetaMask
    const disconnectWallet = () => {
        alert(
            "To fully disconnect, please remove this site from MetaMask's Connected Sites. After that, you'll be notified."
        );
        // No immediate state clearing; we'll rely on the accountsChanged listener.
    };

    // Function to view the blockchain explorer
    const viewOnExplorer = () => {
        if (!wallet) {
            alert("No wallet connected.");
            return;
        }
        // Example: change URL based on your network (here assuming Sepolia)
        const explorerUrl = `https://www.megaexplorer.xyz/address/0x178F5395004Ee2DEEadf30F970E3Ccc887fe69DA`;
        window.open(explorerUrl, "_blank");
    };

    // Function to check the minting status using the read-only contract instance
    const checkMintingStatus = async () => {
        if (!contractReadOnly) {
            alert("Smart contract not loaded. Please connect your wallet first.");
            return;
        }

        try {
            // Call the correct function from your contract
            const status = await contractReadOnly.getMintStatus();
            setMintStatus(status);
        } catch (error) {
            console.error("Error checking mint status:", error?.message || error);
            alert("Failed to fetch minting status. See console for details.");
        }
    };

    // Function to fetch owned NFTs from both database and blockchain
    const fetchOwnedNFTs = async () => {
        if (!wallet) {
            console.log("No wallet connected, skipping NFT fetch");
            return;
        }

        setLoadingNFTs(true);
        try {
            const response = await fetch('/api/nft/owned');
            if (response.ok) {
                const data = await response.json();
                setOwnedNFTs(data.nfts || []);
            } else {
                console.error('Failed to fetch owned NFTs');
            }
        } catch (error) {
            console.error("Error fetching owned NFTs:", error);
        } finally {
            setLoadingNFTs(false);
        }
    };

    // Function to get owned NFTs from blockchain (for future implementation)
    const getOwnedNFTsFromBlockchain = async () => {
        if (!contractReadOnly || !wallet) {
            return [];
        }

        try {
            // This would be implemented to call the smart contract
            // For now, return empty array
            return [];
        } catch (error) {
            console.error("Error fetching blockchain NFTs:", error);
            return [];
        }
    };

    // Listen for account changes to clear state when wallet is disconnected
    useEffect(() => {
        if (window.ethereum) {
            const handleAccountsChanged = (accounts) => {
                if (accounts.length === 0) {
                    alert("You have disconnected your wallet. Please refresh the page to reconnect.");
                    setWallet(null);
                    setContract(null);
                    setContractReadOnly(null);
                    setMintStatus(null);
                    setOwnedNFTs([]);
                } else {
                    setWallet(accounts[0]);
                }
            };

            window.ethereum.on("accountsChanged", handleAccountsChanged);

            return () => {
                if (window.ethereum.removeListener) {
                    window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
                }
            };
        }
    }, []);

    // Fetch owned NFTs when wallet changes
    useEffect(() => {
        if (wallet) {
            fetchOwnedNFTs();
        }
    }, [wallet]);

    return (
        <Web3Context.Provider
            value={{
                wallet,
                contract,
                contractReadOnly,
                mintStatus,
                ownedNFTs,
                loadingNFTs,
                connectWallet,
                disconnectWallet,
                viewOnExplorer,
                checkMintingStatus,
                fetchOwnedNFTs,
                getOwnedNFTsFromBlockchain,
            }}
        >
            {children}
        </Web3Context.Provider>
    );
};

export default Web3Provider;
