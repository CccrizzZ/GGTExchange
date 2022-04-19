import React, { Component } from 'react'
import { 
    Button, 
    ListGroup, 
    Card,
    Navbar,
    Container,
    ButtonGroup,
    Spinner,
    Badge,
    OverlayTrigger,
    Tooltip,

} from 'react-bootstrap'
import Web3 from 'web3'
import detectEthereumProvider from '@metamask/detect-provider'
import Store from './Store'
import UserLibrary from './UserLibrary'
import P2PMarketplace from './P2PMarketplace'
import ggicon1 from '../asset/ggicon1.png'
import './Box.css'


export default class Home extends Component {


    constructor(props) {
        super(props)

        this.state = {
            ConnectedWalletAddr: null,
            UserRole: null,
            TargetContract: null,
            ActivePage: 'store'
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
            
            // store wallet address
            console.log(provider.selectedAddress)
            this.setState({ 
                ConnectedWalletAddr: provider.selectedAddress
            })

            // determine user role from smart contract
            this.setState({ 
                Role: "player"
            })



        }else {
            alert('MetaMask must be installed to run this DApp.')
            return false
        }



    }




    // render app according to current page in state
    RenderHome = () => {


        // return spinning if still loading
        if (!this.state.ConnectedWalletAddr){//|| this.state.UserRole === "") {
            return (
                <div style={{height: "100vh"}}>
                    <Spinner animation="border" role="status">
                    </Spinner>

                    <h1>Loading...</h1>
                    <p>please login to your Metamask wallet if nothing happens</p>

                </div>
            )
        }


        // return page accoding to active page
        switch (this.state.ActivePage) {
            case 'store':
                return <Store addr={this.state.ConnectedWalletAddr}/>
            case 'library':
                return <UserLibrary addr={this.state.ConnectedWalletAddr} role={this.state.UserRole}/>
            case 'p2p':
                return <P2PMarketplace addr={this.state.ConnectedWalletAddr}/>
            default:
                return <h2>ERROR</h2>
        }

    }




    // app navigation functions
    GotoLibrary = () => {
        this.setState({ ActivePage: 'library' })
    }

    GotoStore = () => {
        this.setState({ ActivePage: 'store' })
    }

    GotoP2P = () => {
        this.setState({ ActivePage: 'p2p' })
    }

    ScrollToTop = (e) => {
        window.scrollTo(0, 0)
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
                <OverlayTrigger
                    key="top"
                    placement="top"
                    overlay={
                        <Tooltip id='tooltip-top'>
                        Tooltip on <strong>gjnrjefrnrjank</strong>.
                        </Tooltip>
                    }
                >
                    <Button style={{ fontSize: "16px", marginTop: "40px", marginBottom: "40px", borderRadius: "25px" }} onClick={this.Init}>Connected Wallet: {this.state.ConnectedWalletAddr}</Button>
                
                </OverlayTrigger>

                {/* user role badge */}
                <Badge pill bg="danger" style={{width: "300px", height: "50px", display: "block", margin: "auto", marginBottom: "40px", fontSize: "24px"}}>
                    Role: {this.state.UserRole === null ? "Loading..." : this.state.UserRole}
                </Badge>
                <hr style={{width: "50%", margin: "auto", marginBottom: "10px"}}/>


                {/* app nav */}
                <ButtonGroup size="lg" className="mb-2"  >
                    <Button variant="success" onClick={this.GotoLibrary}>My Library</Button>
                    <Button variant="success" onClick={this.GotoStore}>Store Page</Button>
                    <Button variant="success" onClick={this.GotoP2P}>P2P Marketplace</Button>
                </ButtonGroup>
                <hr style={{width: "50%", margin: "auto", marginBottom: "40px"}}/>


                {/* back to top button */}
                <Button style={{position: "fixed", bottom:"40px", right: "40px", borderRadius: "50px", fontSize: "25px"}} onClick={this.ScrollToTop}>🔝</Button>


                {/* render app */}
                {this.RenderHome()}

            </div>
        )
    }
}
