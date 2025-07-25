# PowerShell script to setup Hyperledger Fabric using Docker
# This script sets up a complete Fabric network with FabCar chaincode

Write-Host "🚀 Setting up Hyperledger Fabric with Docker..." -ForegroundColor Green

# Navigate to first-network directory
Set-Location "fabcar-app\first-network"

Write-Host "📋 Step 1: Cleaning up any existing network..." -ForegroundColor Yellow
docker-compose -f docker-compose-cli.yaml down 2>$null
docker container prune -f 2>$null

Write-Host "📋 Step 2: Generating crypto material..." -ForegroundColor Yellow
docker run --rm -v ${PWD}:/work -w /work hyperledger/fabric-tools:latest cryptogen generate --config=./crypto-config.yaml

Write-Host "📋 Step 3: Creating channel artifacts..." -ForegroundColor Yellow
if (!(Test-Path "channel-artifacts")) {
    New-Item -ItemType Directory -Name "channel-artifacts"
}

# Generate genesis block
Write-Host "   Creating genesis block..." -ForegroundColor Cyan
docker run --rm -v ${PWD}:/work -w /work -e FABRIC_CFG_PATH=/work hyperledger/fabric-tools:latest configtxgen -profile TwoOrgsOrdererGenesis -channelID byfn-sys-channel -outputBlock ./channel-artifacts/genesis.block

# Generate channel configuration transaction
Write-Host "   Creating channel transaction..." -ForegroundColor Cyan
docker run --rm -v ${PWD}:/work -w /work -e FABRIC_CFG_PATH=/work hyperledger/fabric-tools:latest configtxgen -profile TwoOrgsChannel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID mychannel

# Generate anchor peer transactions
Write-Host "   Creating anchor peer updates..." -ForegroundColor Cyan
docker run --rm -v ${PWD}:/work -w /work -e FABRIC_CFG_PATH=/work hyperledger/fabric-tools:latest configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org1MSPanchors.tx -channelID mychannel -asOrg Org1MSP

docker run --rm -v ${PWD}:/work -w /work -e FABRIC_CFG_PATH=/work hyperledger/fabric-tools:latest configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org2MSPanchors.tx -channelID mychannel -asOrg Org2MSP

Write-Host "📋 Step 4: Starting the network..." -ForegroundColor Yellow
docker-compose -f docker-compose-cli.yaml up -d

Write-Host "⏳ Waiting for network to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host "📋 Step 5: Creating and joining channel..." -ForegroundColor Yellow

# Create channel
Write-Host "   Creating channel 'mychannel'..." -ForegroundColor Cyan
docker exec cli peer channel create -o orderer.example.com:7050 -c mychannel -f ./channel-artifacts/channel.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

# Join peer0.org1 to channel
Write-Host "   Joining peer0.org1 to channel..." -ForegroundColor Cyan
docker exec cli peer channel join -b mychannel.block

# Join peer0.org2 to channel
Write-Host "   Joining peer0.org2 to channel..." -ForegroundColor Cyan
docker exec -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp -e CORE_PEER_ADDRESS=peer0.org2.example.com:9051 -e CORE_PEER_LOCALMSPID="Org2MSP" -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt cli peer channel join -b mychannel.block

Write-Host "📋 Step 6: Installing and instantiating FabCar chaincode..." -ForegroundColor Yellow

# Install chaincode on peer0.org1
Write-Host "   Installing chaincode on peer0.org1..." -ForegroundColor Cyan
docker exec cli peer chaincode install -n fabcar -v 1.0 -l node -p /opt/gopath/src/github.com/chaincode/fabcar/javascript

# Install chaincode on peer0.org2
Write-Host "   Installing chaincode on peer0.org2..." -ForegroundColor Cyan
docker exec -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp -e CORE_PEER_ADDRESS=peer0.org2.example.com:9051 -e CORE_PEER_LOCALMSPID="Org2MSP" -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt cli peer chaincode install -n fabcar -v 1.0 -l node -p /opt/gopath/src/github.com/chaincode/fabcar/javascript

# Instantiate chaincode
Write-Host "   Instantiating chaincode..." -ForegroundColor Cyan
docker exec cli peer chaincode instantiate -o orderer.example.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n fabcar -v 1.0 -c '{\"Args\":[]}' -P "AND ('Org1MSP.peer','Org2MSP.peer')"

Write-Host "⏳ Waiting for chaincode to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host "📋 Step 7: Initializing ledger with sample data..." -ForegroundColor Yellow
docker exec cli peer chaincode invoke -o orderer.example.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n fabcar -c '{\"function\":\"initLedger\",\"Args\":[]}'

Write-Host ""
Write-Host "✅ Hyperledger Fabric network is ready!" -ForegroundColor Green
Write-Host "🔗 Network components:" -ForegroundColor Green
Write-Host "   - Orderer: orderer.example.com:7050" -ForegroundColor White
Write-Host "   - Peer0 Org1: peer0.org1.example.com:7051" -ForegroundColor White
Write-Host "   - Peer0 Org2: peer0.org2.example.com:9051" -ForegroundColor White
Write-Host "   - Channel: mychannel" -ForegroundColor White
Write-Host "   - Chaincode: fabcar v1.0" -ForegroundColor White
Write-Host ""
Write-Host "🧪 Test the network:" -ForegroundColor Green
Write-Host "   docker exec cli peer chaincode query -C mychannel -n fabcar -c '{\"function\":\"queryAllCars\",\"Args\":[]}'" -ForegroundColor Yellow

# Return to original directory
Set-Location "..\..\"
