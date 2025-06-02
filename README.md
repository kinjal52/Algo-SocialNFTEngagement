# SocialNFT-Engagement


## Module Description  
The **NFT Listing & Real-Time Q&A Chat Module** enables users to mint NFTs on the **Algorand blockchain**, store metadata on **IPFS**, and engage in **real-time conversations** between potential buyers and NFT creators. This module enhances trust and transparency by allowing on-platform discussions.

## Features  
- **NFT Minting** – Upload and mint NFTs on the Algorand blockchain.  
- **IPFS Integration** – Decentralized storage for NFT media using Pinata.  
- **Real-Time Q&A Chat** – Buyers can ask questions; creators can respond.  
- **Socket.IO Integration** – Live chat powered by WebSocket rooms per NFT.  
- **NFT Listings** – View all NFTs and their associated discussions.
 
 
## Problem Statement and Proposed Solution

### Problem Statement
- Most NFT platforms are transactional with no direct communication between buyers and sellers.
- Conversations about NFTs happen off-platform, fragmenting engagement and trust.
- Lack of creator interaction reduces confidence in NFT purchases.

### Proposed Solution
- Enable real-time, on-platform conversations via a Q&A module.
- Increase trust by allowing buyers to interact directly with NFT creators.
- Store NFT metadata on-chain (Algorand) and media on IPFS for full decentralization.

## Technical Architecture Overview

### TimeLine

| Component     | Technology Used                                          |
|---------------|----------------------------------------------------------|
| **Frontend**  | Next.js (React) + ShadCN (UI Components)                 |
| **Backend**   | Next.js API Routes (Node.js) + MongoDB (Database)        |
| **Auth**      | Web3 Wallet Authentication                               |
| **Storage**   | MongoDB (Comments, Likes) / IPFS (Decentralized Storage) |

### System Flow  
1. Creator uploads an image + metadata → sent to backend.
2. Backend uploads the image to IPFS via Pinata.
3. NFT is minted using Algorand SDK and metadata is stored in MongoDB.
4. All NFTs are listed via API.
5. Buyers can select an NFT and post questions in real-time.
6. Creator responds in a live chat room scoped to the NFT ID.
7. All Q&A is persisted in MongoDB for traceability.

## Implementation plan and timeline
| Phase       | Task                                           | Duration  |
|-------------|------------------------------------------------|-----------|
| Phase 1     | Requirement gathering & architecture planning  | 1 week    |
| Phase 2     | Backend API development                        | 1.5 weeks |
| Phase 3     | Frontend UI development                        | 1.5 weeks |
| Phase 4     | Web3 wallet integration                        | 1 week    |
| Phase 5     | Testing & Deployment                           | 1 week    |
| **Total**   |                                                |**6 weeks**|

## Expected Impact and Outcomes

### Marketplace Benefits
- **Higher User Engagement** – Encourages more interaction with NFTs.  
- **Improved Trust** – Buyers can interact with creators directly.
- **Reduced Off-Platform Leakage** – Keeps users on your marketplace.

### User Benefits
- **Buyers** – Ask questions about NFTs directly before purchase.
- **Sellers/Creators** – Build credibility and improve buyer conversion through dialogue.
