#!/bin/bash
#
# Setup Hyperledger Fabric using Docker containers only
# This script works on Windows with Docker Desktop
#

set -e

echo "🚀 Setting up Hyperledger Fabric with Docker..."

# Set environment variables
export FABRIC_CFG_PATH=/etc/hyperledger/fabric
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=peer0.org1.example.com:7051

# Navigate to first-network directory
cd fabcar-app/first-network

echo "📋 Step 1: Generating crypto material..."
docker run --rm -v $(pwd):/work -w /work hyperledger/fabric-tools:latest cryptogen generate --config=./crypto-config.yaml

echo "📋 Step 2: Creating channel artifacts..."
mkdir -p channel-artifacts

# Generate genesis block
docker run --rm -v $(pwd):/work -w /work -e FABRIC_CFG_PATH=/work hyperledger/fabric-tools:latest \
    configtxgen -profile TwoOrgsOrdererGenesis -channelID byfn-sys-channel -outputBlock ./channel-artifacts/genesis.block

# Generate channel configuration transaction
docker run --rm -v $(pwd):/work -w /work -e FABRIC_CFG_PATH=/work hyperledger/fabric-tools:latest \
    configtxgen -profile TwoOrgsChannel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID mychannel

# Generate anchor peer transactions
docker run --rm -v $(pwd):/work -w /work -e FABRIC_CFG_PATH=/work hyperledger/fabric-tools:latest \
    configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org1MSPanchors.tx -channelID mychannel -asOrg Org1MSP

docker run --rm -v $(pwd):/work -w /work -e FABRIC_CFG_PATH=/work hyperledger/fabric-tools:latest \
    configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org2MSPanchors.tx -channelID mychannel -asOrg Org2MSP

echo "📋 Step 3: Starting the network..."
docker-compose -f docker-compose-cli.yaml up -d

echo "⏳ Waiting for network to start..."
sleep 10

echo "📋 Step 4: Creating and joining channel..."
# Create channel
docker exec cli peer channel create -o orderer.example.com:7050 -c mychannel -f ./channel-artifacts/channel.tx \
    --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

# Join peer0.org1 to channel
docker exec cli peer channel join -b mychannel.block

# Join peer0.org2 to channel
docker exec -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp \
    -e CORE_PEER_ADDRESS=peer0.org2.example.com:9051 \
    -e CORE_PEER_LOCALMSPID="Org2MSP" \
    -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt \
    cli peer channel join -b mychannel.block

echo "📋 Step 5: Installing and instantiating FabCar chaincode..."
# Install chaincode on peer0.org1
docker exec cli peer chaincode install -n fabcar -v 1.0 -l node -p /opt/gopath/src/github.com/chaincode/fabcar/javascript

# Install chaincode on peer0.org2
docker exec -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp \
    -e CORE_PEER_ADDRESS=peer0.org2.example.com:9051 \
    -e CORE_PEER_LOCALMSPID="Org2MSP" \
    -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt \
    cli peer chaincode install -n fabcar -v 1.0 -l node -p /opt/gopath/src/github.com/chaincode/fabcar/javascript

# Instantiate chaincode
docker exec cli peer chaincode instantiate -o orderer.example.com:7050 --tls \
    --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
    -C mychannel -n fabcar -v 1.0 -c '{"Args":[]}' -P "AND ('Org1MSP.peer','Org2MSP.peer')"

echo "⏳ Waiting for chaincode to be ready..."
sleep 10

echo "📋 Step 6: Initializing ledger with sample data..."
docker exec cli peer chaincode invoke -o orderer.example.com:7050 --tls \
    --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
    -C mychannel -n fabcar -c '{"function":"initLedger","Args":[]}'

echo "✅ Hyperledger Fabric network is ready!"
echo "🔗 Network components:"
echo "   - Orderer: orderer.example.com:7050"
echo "   - Peer0 Org1: peer0.org1.example.com:7051"
echo "   - Peer0 Org2: peer0.org2.example.com:9051"
echo "   - Channel: mychannel"
echo "   - Chaincode: fabcar v1.0"
echo ""
echo "🧪 Test the network:"
echo "   docker exec cli peer chaincode query -C mychannel -n fabcar -c '{\"function\":\"queryAllCars\",\"Args\":[]}'"
