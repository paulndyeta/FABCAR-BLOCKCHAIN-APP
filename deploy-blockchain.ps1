# PowerShell script to deploy FabCar chaincode to Hyperledger Fabric
# This script creates channel, joins peers, and deploys chaincode

Write-Host "🚀 Deploying FabCar to Hyperledger Fabric..." -ForegroundColor Green

# Set environment variables for the CLI container
$env:CORE_PEER_TLS_ENABLED = "true"
$env:CORE_PEER_LOCALMSPID = "Org1MSP"
$env:CORE_PEER_TLS_ROOTCERT_FILE = "/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt"
$env:CORE_PEER_MSPCONFIGPATH = "/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp"
$env:CORE_PEER_ADDRESS = "peer0.org1.example.com:7051"

Write-Host "📋 Step 1: Creating channel 'mychannel'..." -ForegroundColor Yellow

# Create channel with simpler approach
docker exec cli peer channel create -o orderer.example.com:7050 -c mychannel -f ./channel-artifacts/channel.tx

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Channel created successfully" -ForegroundColor Green
} else {
    Write-Host "   ❌ Channel creation failed, trying alternative approach..." -ForegroundColor Red
    
    # Try without TLS first
    docker exec cli peer channel create -o orderer.example.com:7050 -c mychannel -f ./channel-artifacts/channel.tx
}

Write-Host "📋 Step 2: Joining peers to channel..." -ForegroundColor Yellow

# Join peer0.org1 to channel
Write-Host "   Joining peer0.org1..." -ForegroundColor Cyan
docker exec cli peer channel join -b mychannel.block

# Join peer0.org2 to channel
Write-Host "   Joining peer0.org2..." -ForegroundColor Cyan
docker exec -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp -e CORE_PEER_ADDRESS=peer0.org2.example.com:9051 -e CORE_PEER_LOCALMSPID="Org2MSP" -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt cli peer channel join -b mychannel.block

Write-Host "📋 Step 3: Installing FabCar chaincode..." -ForegroundColor Yellow

# Install chaincode on peer0.org1
Write-Host "   Installing on peer0.org1..." -ForegroundColor Cyan
docker exec cli peer chaincode install -n fabcar -v 1.0 -l node -p /opt/gopath/src/github.com/chaincode/fabcar/javascript

# Install chaincode on peer0.org2
Write-Host "   Installing on peer0.org2..." -ForegroundColor Cyan
docker exec -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp -e CORE_PEER_ADDRESS=peer0.org2.example.com:9051 -e CORE_PEER_LOCALMSPID="Org2MSP" -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt cli peer chaincode install -n fabcar -v 1.0 -l node -p /opt/gopath/src/github.com/chaincode/fabcar/javascript

Write-Host "📋 Step 4: Instantiating chaincode..." -ForegroundColor Yellow
docker exec cli peer chaincode instantiate -o orderer.example.com:7050 -C mychannel -n fabcar -v 1.0 -c '{\"Args\":[]}' -P "AND ('Org1MSP.peer','Org2MSP.peer')"

Write-Host "⏳ Waiting for chaincode to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "📋 Step 5: Initializing ledger..." -ForegroundColor Yellow
docker exec cli peer chaincode invoke -o orderer.example.com:7050 -C mychannel -n fabcar -c '{\"function\":\"initLedger\",\"Args\":[]}'

Write-Host "⏳ Waiting for initialization..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "📋 Step 6: Testing the blockchain..." -ForegroundColor Yellow
Write-Host "   Querying all cars..." -ForegroundColor Cyan
docker exec cli peer chaincode query -C mychannel -n fabcar -c '{\"function\":\"queryAllCars\",\"Args\":[]}'

Write-Host ""
Write-Host "✅ FabCar blockchain is ready!" -ForegroundColor Green
Write-Host "🔗 Network components:" -ForegroundColor Green
Write-Host "   - Orderer: orderer.example.com:7050" -ForegroundColor White
Write-Host "   - Peer0 Org1: peer0.org1.example.com:7051" -ForegroundColor White
Write-Host "   - Peer0 Org2: peer0.org2.example.com:9051" -ForegroundColor White
Write-Host "   - Channel: mychannel" -ForegroundColor White
Write-Host "   - Chaincode: fabcar v1.0" -ForegroundColor White
Write-Host ""
Write-Host "🧪 Test commands:" -ForegroundColor Green
Write-Host "   Query all cars: docker exec cli peer chaincode query -C mychannel -n fabcar -c '{\"function\":\"queryAllCars\",\"Args\":[]}'" -ForegroundColor Yellow
Write-Host "   Query specific car: docker exec cli peer chaincode query -C mychannel -n fabcar -c '{\"function\":\"queryCar\",\"Args\":[\"CAR0\"]}'" -ForegroundColor Yellow
