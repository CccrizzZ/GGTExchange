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
    Modal
} from 'react-bootstrap'
import Web3 from 'web3'
import detectEthereumProvider from '@metamask/detect-provider'
import Store from './Store'
import UserLibrary from './UserLibrary'
import P2PMarketplace from './P2PMarketplace'
import ggicon1 from '../asset/ggicon1.png'
import './Box.css'
import ContractABI from './ContractABI.json'

// role from smart contract
// enum Roles {
//     Guest,
//     Player,
//     Developer,
//     Admin
// }


export default class Home extends Component {


    constructor(props) {
        super(props)

        this.state = {
            TargetContractAddr: '0xDbBa8d83f9dc07C3F00Ad46aAD37389d33cD484D',
            ConnectedWalletAddr: null,
            ConnectedContract: null,
            UserRole: null,
            TargetContract: null,
            ActivePage: 'store',
            isWaitingForBlockchain: false
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
            // store provider in window
            window.web3 = new Web3(provider)
            let contract = new window.web3.eth.Contract(ContractABI, this.state.TargetContractAddr)
            
            // null check on contract
            if(!contract) { alert("Contract Not Found"); return }
            console.log(contract)

            // store wallet address
            console.log(provider.selectedAddress)
            this.setState({ ConnectedWalletAddr: provider.selectedAddress })

            // store contract
            this.setState({ ConnectedContract: contract })


        }else {
            alert('MetaMask must be installed to run this DApp.')
            return false
        }


        // update user role
        this.UpdateRole()
    }


    // update user role from smart contract
    UpdateRole = async () => {

        // call smart contract function
        let result = await this.state.ConnectedContract.methods.GetMyRole()
        .call({
            from: this.state.ConnectedWalletAddr
        })

        switch (result) {
            case '0':
                this.setState({ UserRole: "Guest" })
                break;
            case '1':
                this.setState({ UserRole: "Player" })
                break;
            case '2':
                this.setState({ UserRole: "Developer" })
                break;
            case '3':
                this.setState({ UserRole: "Admin" })
                break;
            default:
                break;
        }

    }




    // register guest user to player
    RegisterAsPlayer = async () => {

        // null check on contract
        if(this.state.ConnectedContract == null) return

        // show pop over
        this.setState({isWaitingForBlockchain: true})

        // call smart contract function
        let result = await this.state.ConnectedContract.methods.SetMeToPlayer()
        .send({
            from: this.state.ConnectedWalletAddr
        }).on('error', async (error) => {
            alert("Error: Transaction Failed")
            // hide pop over

            this.setState({isWaitingForBlockchain: false})
        })
        console.log(result)

        // hide pop over
        this.setState({isWaitingForBlockchain: false})

        // refersh role
        this.UpdateRole()
        alert("You have registered as a player")

    }
    



    // register player to developer
    RegisterAsDeveloper = async () => {
        // show pop over
        this.setState({isWaitingForBlockchain: true})
        
        // call smart contract function
        let result = await this.state.ConnectedContract.methods.SetMeToDeveloper()
        .send({
            from: this.state.ConnectedWalletAddr
        }).on('error', (error) => {
            alert("Error: Transaction Failed")
        })
        console.log(result)

        // refersh role
        this.UpdateRole()
        alert("You have registered as a developer")

        // hide pop over
        this.setState({isWaitingForBlockchain: false})
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
                return <Store addr={this.state.ConnectedWalletAddr} contract={this.state.ConnectedContract}/>
            case 'library':
                return <UserLibrary addr={this.state.ConnectedWalletAddr} contract={this.state.ConnectedContract} role={this.state.UserRole} />
            case 'p2p':
                return <P2PMarketplace addr={this.state.ConnectedWalletAddr} contract={this.state.ConnectedContract}/>
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
                        Click to <strong>Reconnect Wallet</strong>.
                        </Tooltip>
                    }
                >
                    <Button style={{ fontSize: "16px", marginTop: "40px", marginBottom: "40px", borderRadius: "25px" }} onClick={this.Init}>Connected Wallet: {this.state.ConnectedWalletAddr}</Button>
                
                </OverlayTrigger>

                {/* user role badge */}
                <Badge onClick={this.UpdateRole} pill bg="danger" style={{width: "300px", height: "50px", display: "block", margin: "auto", marginBottom: "40px", fontSize: "24px"}}>
                    Role: {this.state.UserRole === null ? "Loading..." : this.state.UserRole}
                </Badge>
                {this.state.UserRole === "Guest" ? <Button style={{marginBottom: "40px"}} onClick={this.RegisterAsPlayer} variant="success">Register as Player</Button> : null} 
                {this.state.UserRole === "Player" ? <Button style={{marginBottom: "40px"}} onClick={this.RegisterAsDeveloper} variant="success">Register as Developer</Button> : null} 

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


                
                {/* loading pop over */}
                <Modal
                    show={this.state.isWaitingForBlockchain}
                    backdrop="static"
                    keyboard={false}
                >
                    <Modal.Header>
                        <Modal.Title>Waiting for Blockchain...</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Spinner style={{margin: "auto"}}animation="grow" variant="danger" />
                    </Modal.Body>
                </Modal>

            </div>
        )
    }
}
