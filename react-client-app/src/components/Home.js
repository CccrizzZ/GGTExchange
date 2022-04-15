import React, { Component } from 'react'
import { 
    Button, 
    Card, 
    ListGroup, 
    InputGroup, 
    FormControl, 
    Alert, 
    Spinner, 
    Row,
    Col,
    Navbar,
    Container

} from 'react-bootstrap'
import Web3 from 'web3'
import detectEthereumProvider from '@metamask/detect-provider'
import UserPage from './UserPage'
import DevPage from './DevPage'
import ggicon1 from '../asset/ggicon1.png'
import './Home.css'


export default class Home extends Component {


    constructor(props) {
        super(props)

        this.state = {
            isUser: true,
            ConnectedWalletAddr: "",
            TargetContract: ""
            
        }

    }
    
    async componentDidMount(){

        // look for metamask
        await this.Init()
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
            this.setState({ 
                ConnectedWalletAddr: provider.selectedAddress
            })

        }else {
            console.log('MetaMask must be installed to run this DApp.')
            return false
        }



    }

    // pull listing from server
    GetMarketListing = () => {

    }


    // renders single card
    RenderCards = () => {
        return(
            <Card style={{ }}>
                <Card.Img variant="top" src="http://media.steampowered.com/apps/csgo/blog/images/fb_image.png?v=6" />
                <Card.Body style={{backgroundColor: '#343a40'}}>
                    <Card.Title>Example Game</Card.Title>
                    <Card.Text>
                        <hr/>
                        Description: A game about snake eating each other
                        <hr/>
                        Publisher: {this.state.ConnectedWalletAddr}
                        <hr/>
                        Price: 5 Dev

                    </Card.Text>
                    <Button variant="primary">Purchase</Button>
                </Card.Body>
            </Card>
        )
    }





    render() {
        return (
            <div style={{ display: "block", backgroundColor: "#0d1117", height: "auto", color: "#fff" }}>
                
                {/* navbar */}
                <Navbar bg="dark" variant="dark">
                    <Container>
                        <img src={ggicon1} alt="" height="50" style={{margin: "auto"}}/>
                    </Container>
                </Navbar>


                {/* wallet connection button */}
                <Button style={{ fontSize: "16px", marginTop: "40px", marginBottom: "40px" }} onClick={this.Init}>Connected Wallet: {this.state.ConnectedWalletAddr}</Button>


                {/* marketplace */}
                <div id="modulebox">
                    <h2>Marketplace</h2>
                    <hr/>
                    {this.RenderCards()}
                    {this.RenderCards()}
                    {this.RenderCards()}
                    {this.RenderCards()}

                </div>

            </div>
        )
    }
}
