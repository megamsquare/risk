import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { Container, Card, Button } from "react-bootstrap";
import RebaseTokenAbi from "../contract/rebase_token_abi.json";
import Transaction from "./Transaction";
// import qs from "qs";

const TokenList = () => {
    const contractAddress = "0xC185a44E2aD16B205927A3B0b04781BF54e89359";

    const [connection, setConnection] = useState("Connect Wallet");
    const [disableConnect, setDisableConnect] = useState(false);
    const [tokenData, setTokendata] = useState(null);
    const [account, setAccount] = useState(null);

    const [amount, setAmount] = useState(0);

    const [paramsData, setParamsData] = useState({
        makerToken: "" // Expected result "0xd298cE58FB6a02FCeCf7dBd976310559d866cFF2"
    });

    const [details, setDetails] = useState({
        contract: null,
        tokens: null,
        signer: null,
        walletBalance: null
    });

    const navigate = useNavigate();

    const ordersUrl = "https://api.0x.org/orderbook/v1/orders?";

    async function checkMetaMask() {
        if (window.ethereum !== undefined) {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signerData = await provider.getSigner();
                const contract = new ethers.Contract(contractAddress, RebaseTokenAbi, signerData);
                
                setParamsData({makerToken: signerData.address});
                setDetails({
                    signer: signerData
                })
                setAccount(signerData.address);
                setTokendata(contract);
                setConnection("Connected");
                setDisableConnect(true);

            } catch (error) {
                console.log("error connecting....: ", error);
            }
        } else {
            const provider = new ethers.getDefaultProvider()
            console.log(provider);
            navigate("/nowallet")
        }

    }

    useEffect(() => {
        if (tokenData !== null && account !== null) {

            async function updateAmountName(address) {
                const getAmount = await tokenData.balanceOf(address);
                const numberAmount = getAmount.toString();
        
                setAmount(numberAmount);
                setDetails({
                    walletBalance: numberAmount
                })
            }
        
            async function fetchOrders() {
                // const addedUrl = ordersUrl + qs.stringify(paramsData);
                await fetch(ordersUrl).then((res) => {
                    return res.json();
                }).then((resp) => {
                    setDetails({
                        contract: tokenData,
                        tokens: resp.records
                    });
                }).catch((err) => {
                    console.warn(err.message);
                })
            }

            updateAmountName(account);
            fetchOrders();
        }
    }, [tokenData, account, paramsData])

    return (

        <Container>
            <Card>
                <Card.Body>
                    <Card.Subtitle>
                        <div className="divBtn">
                            <Button variant="outline-primary" onClick={checkMetaMask} disabled={disableConnect}>
                                {connection}
                            </Button>
                        </div>
                    </Card.Subtitle>
                    <Card.Title> Token Address: {account} </Card.Title>
                    <Card.Subtitle>Wallet Balance: {amount} </Card.Subtitle>
                    {details.tokens !== null && details.contract !== null ? <Transaction details={details} /> : null}
                </Card.Body>
            </Card>
        </Container>
    );
}

export default TokenList;