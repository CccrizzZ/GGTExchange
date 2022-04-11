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
import ggicon1 from '../asset/ggicon1.png'
import detectEthereumProvider from '@metamask/detect-provider'


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
        console.log("Connecting to metamask")
        const provider = await detectEthereumProvider()


        if (provider) {
            window.web3 = new Web3(provider)
            // let contract = new window.web3.eth.Contract(ContractABI, this.state.ContractAddr)

            console.log(provider.selectedAddress)


        }



    }




    render() {
        this.Init()
        return (
            <div>
                {/* navbar */}
                <Navbar bg="dark" variant="dark">
                    <Container>
                        <img src={ggicon1} alt="" height="50" style={{margin: "auto"}}/>
                    </Container>
                </Navbar>


                {/* marketplace */}
                


            </div>
        )
    }
}
