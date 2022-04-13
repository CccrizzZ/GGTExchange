import React, { Component } from 'react'
import { 
    Button, 
    Card, 
    ListGroup, 
    InputGroup, 
    FormControl, 
    Alert, 
    Spinner, 
    Navbar,
    Container

} from 'react-bootstrap'
import Web3 from 'web3'
import detectEthereumProvider from '@metamask/detect-provider'
import UserPage from './UserPage'
import DevPage from './DevPage'
import ggicon1 from '../asset/ggicon1.png'


export default class Home extends Component {


    constructor(props) {
        super(props)

        this.state = {
            ConnectedWalletAddr: "",
            isUser: true,

        }

    }


    // connect to the blockchain
    Init = async () => {

        // create 
        console.log("Connecting to metamask")
        const provider = await detectEthereumProvider()


        if (provider) {
            window.web3 = new Web3(provider)
            // let contract = new window.web3.eth.Contract(ContractABI, this.state.ContractAddr)

            console.log(provider.selectedAddress)


        }



    }


    RenderMarketListing = async () => {

    }


    render() {
        this.Init()
        return (
            <div style={{ backgroundColor: "#0d1117", height: "100vh", color: "#fff" }}>
                {/* navbar */}
                <Navbar bg="dark" variant="dark">
                    <Container>
                        <img src={ggicon1} alt="" height="50" style={{margin: "auto"}}/>
                    </Container>
                </Navbar>


                {/* marketplace */}
                <h1>Market place</h1>
                {this.state.isUser ?  <UserPage /> : <DevPage /> }

            </div>
        )
    }
}
