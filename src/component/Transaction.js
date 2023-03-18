import { useState, useEffect } from "react";
import { Modal, Button, Table, Row, Form, Col, Accordion } from "react-bootstrap";
import { ethers } from "ethers";
import { BigNumber } from '@ethersproject/bignumber';

const Transaction = (props) => {

    const [show, setShow] = useState(false);
    const [tokenDetail, setTokenDetail] = useState(null);
    const [validated, setValidated] = useState(false);
    const [amount, setAmount] = useState(0);
    const [successTran, setSuccessTrans] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

    const handleShow = () => {
        setShow(true);
    };

    const handleClose = () => {
        setShow(false)
        setAmount(0);
        setTokenDetail(null);
        setErrorMsg(null);
    };

    const modalData = (e) => {
        setTokenDetail(e);
        handleShow();
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (form.checkValidity() !== false && amount > 0 && tokenDetail !== null) {
            const value = ethers.parseEther(amount.toString());
            const orderValue = BigNumber.from(tokenDetail.order.takerAmount);
            if (orderValue.gte(value)) {
                console.log("Not getting here");
                const tx = await props.details.contract.transfer(tokenDetail.order.makerToken, value);
                const txRes = await tx.wait();
                setSuccessTrans(txRes);
                if (txRes.hash !== "" && txRes.hash !== undefined) {
                    const totalValue = props.details.walletBalance - value.toString();
                    const txRebase = await props.details.contract.rebase(totalValue);
                    await txRebase.wait();
                }
                console.log(txRes);
            } else {
                setErrorMsg("Available amount t buy is: " + ethers.formatEther(tokenDetail.order.takerAmount))
                setValidated(true);
            }
        } else {
            e.stopPropagation();
            setErrorMsg("Please provide a valid Amount.");
            setValidated(true);
        }


    }

    useEffect(() => {
        // console.log(props.tokens)
    }, [props.details.tokens])

    return (
        <div>
            <Table>
                <thead>
                    <tr>
                        <th>Token Hash</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Value</th>
                        <th>Date Created</th>
                        <th>Buy Coin</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        props.details.tokens && props.details.tokens.map((token, i) => {
                            return (
                                <tr key={i}>
                                    <td>{token.metaData.orderHash.slice(0, 10)}</td>
                                    <td>{token.order.makerToken.slice(0, 10)}</td>
                                    <td>{token.order.takerToken.slice(0, 10)}</td>
                                    <td>{ethers.formatEther(token.order.takerAmount)}</td>
                                    <td>{token.metaData.createdAt.slice(0, 4)}</td>
                                    <td>
                                        <Button variant="outline-primary" onClick={() => modalData(token)}>Buy Token</Button>
                                    </td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </Table>
            <Modal
                show={show}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
                scrollable={true}
            >
                <Modal.Header closeButton>
                    <Modal.Title> {tokenDetail !== null ? tokenDetail.order.takerToken.slice(0, 18) + "..." : null}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {
                        tokenDetail !== null ?
                            <div>
                                <Form className="formStyle" onSubmit={handleSubmit} validated={validated}>
                                    <Form.Group className="md-3" as={Row} controlId="collector">
                                        <Form.Label column sm="2">Amount</Form.Label>
                                        <Col sm="5">
                                            <Form.Control
                                                type="number"
                                                placeholder="Amount"
                                                min={0}
                                                step={0.01}
                                                value={amount}
                                                isInvalid={validated}
                                                onChange={(e) => {
                                                    setAmount(e.target.value)
                                                    setValidated(false);
                                                }}
                                                required />
                                            <Form.Control.Feedback type="invalid">
                                                {errorMsg}
                                            </Form.Control.Feedback>
                                        </Col>
                                    </Form.Group>
                                    <Button type="submit">Buy</Button>
                                </Form>
                                <div>
                                    {
                                        successTran !== null ?
                                            <Accordion>
                                                <Accordion.Item eventKey="0">
                                                    <Accordion.Header>Transaction Hash</Accordion.Header>
                                                    <Accordion.Body>
                                                        {successTran.hash}
                                                    </Accordion.Body>
                                                </Accordion.Item>

                                                <Accordion.Item eventKey="1">
                                                    <Accordion.Header>Gas Used</Accordion.Header>
                                                    <Accordion.Body>
                                                        {successTran.gasUsed}
                                                    </Accordion.Body>
                                                </Accordion.Item>

                                                <Accordion.Item eventKey="2">
                                                    <Accordion.Header>From</Accordion.Header>
                                                    <Accordion.Body>
                                                        {successTran.from}
                                                    </Accordion.Body>
                                                </Accordion.Item>

                                                <Accordion.Item eventKey="3">
                                                    <Accordion.Header>To</Accordion.Header>
                                                    <Accordion.Body>
                                                        {successTran.to}
                                                    </Accordion.Body>
                                                </Accordion.Item>
                                            </Accordion> : null
                                    }
                                </div>
                            </div> : <h1>Invalid Token details</h1>
                    }
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default Transaction;