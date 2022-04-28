import React, { Component } from 'react'
import { 
    Button, 
    Card,
    Navbar,
    Container,
    ButtonGroup,
    Spinner,
    InputGroup,
    OverlayTrigger,
    Tooltip,
    Modal,
    FormControl
} from 'react-bootstrap'
import Web3 from 'web3'
import detectEthereumProvider from '@metamask/detect-provider'
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'
import Store from './Store'
import UserLibrary from './UserLibrary'
import P2PMarketplace from './P2PMarketplace'
import ggicon1 from '../asset/ggicon1.png'
import bg from '../asset/bg.jpg'
import ContractABI from './ContractABI.json'
import './Box.css'


// role from smart contract
// 0 Guest
// 1 Player
// 2 Developer
// 3 Admin


export default class Home extends Component {


    constructor(props) {
        super(props)

        this.state = {
            TargetContractAddr: '0x6BD17918C8D0A756c3631Ec18E1B338BdD83c944',
            ConnectedWalletAddr: null,
            ConnectedContract: null,
            UserRole: null,
            TargetContract: null,
            ActivePage: 'library',
            UserDisplayName: null,
            isWaitingForBlockchain: false,
            isChangingName: false,
        }

        // refs
        this.UserNameInput = React.createRef()

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
        this.UpdateName()
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

    
    UpdateName = async () => {
        // call smart contract function
        let result = await this.state.ConnectedContract.methods.GetMyDisplayName()
        .call({
            from: this.state.ConnectedWalletAddr
        })

        // null check on name
        if(result === null || result === "") {
            this.setState({UserDisplayName: null})
            return
        }

        // store user name
        this.setState({UserDisplayName: result})        

    }


    // set player display name
    SubmitNewName = async () => {


        if (this.UserNameInput.current.value === "") {
            alert("Please enter username")
            return
        }
        
        // show pop over
        this.SetWaiting()

        // call smart contract function
        let result = await this.state.ConnectedContract.methods.SetMyDisplayName(this.UserNameInput.current.value)
        .send({
            from: this.state.ConnectedWalletAddr
        }).on('error', async (error) => {
            alert("Error: Transaction Failed")
            // hide pop over
            this.SetIdle()
        })
        console.log(result)
    
        // hide pop over
        this.SetIdle()
        
        // refresh name
        await this.UpdateName()
        this.SetChangingNameOff()
        alert("You have set your name to " + this.state.UserDisplayName)
    }

    

    // register guest user to player
    RegisterAsPlayer = async () => {

        // null check on contract
        if(this.state.ConnectedContract == null) return

        // show pop over
        this.SetWaiting()

        // call smart contract function
        let result = await this.state.ConnectedContract.methods.SetMeToPlayer()
        .send({
            from: this.state.ConnectedWalletAddr
        }).on('error', async (error) => {
            alert("Error: Transaction Failed")
            // hide pop over
            this.SetIdle()
        })
        console.log(result)

        // hide pop over
        this.SetIdle()

        // refersh role
        this.UpdateRole()
        alert("You have registered as a player")

    }
    



    // register player to developer
    RegisterAsDeveloper = async () => {
        // show pop over
        this.SetWaiting()
        
        // call smart contract function
        let result = await this.state.ConnectedContract.methods.SetMeToDeveloper()
        .send({
            from: this.state.ConnectedWalletAddr
        }).on('error', (error) => {
            alert("Error: Transaction Failed")
            this.SetIdle()

        })
        console.log(result)

        // hide pop over
        this.SetIdle()
        
        // refersh role
        this.UpdateRole()
        alert("You have registered as a developer")

    }




    // render app according to current page in state
    RenderHome = () => {

        // return spinning if still loading
        if (!this.state.ConnectedWalletAddr){//|| this.state.UserRole === "") {
            return (
                <div id="modulebox" style={{height: "100vh"}}>
                    <Spinner animation="border" role="status">
                    </Spinner>

                    <h1>Loading...</h1>
                    <p>please login to your Metamask wallet and click the wallet button above if nothing happens</p>

                </div>
            )
        }


        // return page accoding to active page
        switch (this.state.ActivePage) {
            case 'store':
                return (
                    <Store 
                        IsConnected={this.IsWalletConnected}
                        WalletAddr={this.state.ConnectedWalletAddr} 
                        ConnectedContract={this.state.ConnectedContract} 
                        RenderCards={this.RenderCards}
                        ShowPopup={this.SetWaiting}
                        HidePopup={this.SetIdle}
                    />
                )
            case 'library':
                return (
                    <UserLibrary 
                        IsConnected={this.IsWalletConnected}
                        WalletAddr={this.state.ConnectedWalletAddr} 
                        ConnectedContract={this.state.ConnectedContract} 
                        UserRole={this.state.UserRole} 
                        RenderCards={this.RenderCards}
                        ShowPopup={this.SetWaiting}
                        HidePopup={this.SetIdle}
                    />
                )
            case 'p2p':
                return(
                    <P2PMarketplace 
                        IsConnected={this.IsWalletConnected}
                        WalletAddr={this.state.ConnectedWalletAddr} 
                        ConnectedContract={this.state.ConnectedContract} 
                        RenderCards={this.RenderCards}
                        ShowPopup={this.SetWaiting}
                        UserRole={this.state.UserRole} 
                        HidePopup={this.SetIdle}
                    />
                )
            default:
                return <h2>ERROR</h2>
        }

    }

    // determine if wallet is connected
    IsWalletConnected = () => {
        if(this.state.ConnectedWalletAddr == null) {
            return false
        }else {
            return true
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



    // toggle the waiting model
    SetWaiting = () => {
        console.log("Show waiting modal")
        this.setState({isWaitingForBlockchain: true})
    }
    SetIdle = () => {
        console.log("Hide waiting modal")
        this.setState({isWaitingForBlockchain: false})
    }

    // toggle the change name model
    SetChangingName = () => {

        // if no wallet connect user cannot change name
        if (this.state.ConnectedWalletAddr === null || this.state.ConnectedWalletAddr === ""){
            alert("Please connect wallet first")
            return 
        }

        this.setState({isChangingName: true})
    }
    SetChangingNameOff = () => {
        this.setState({isChangingName: false})
    }



    // return user info card
    RenderUserInfoCard = () => {
        return(
            <div id="playercard">

                {/* avatar */}
                <div style={{ margin: "auto", marginTop: "20px", marginBottom: "20px"}}>
                    <Jazzicon diameter={100} seed={this.state.ConnectedWalletAddr ? jsNumberForAddress(this.state.ConnectedWalletAddr) : null} />
                </div>
                
                {/* display name */}
                <OverlayTrigger placement="top" overlay={ <Tooltip id='tooltip-top'>Click to <strong>Reset Display Name</strong>.</Tooltip>}>
                    <Button id="purplebutton" style={{ fontSize: "16px", marginBottom: "20px", borderRadius: "25px" }} onClick={this.SetChangingName}>{this.state.UserDisplayName === null ? `NoName` : this.state.UserDisplayName}</Button>
                </OverlayTrigger>
                <div id="playercard" style={{ background: "rgba(33, 33, 33, 0.8)", display: this.state.isChangingName ? "block" : "none"}}>  
                    <div style={{margin: "auto"}}>
                        <h4>Enter New Name</h4>
                        <p>Maximum 16 characters</p>
                    </div>
                    <InputGroup className="mb-3" style={{ marginTop: "20px", marginBottom: "20px"}}>
                        <FormControl ref={this.UserNameInput} autoFocus maxLength="16" placeholder="New Username"/>
                        <Button variant="success" onClick={this.SubmitNewName}>Submit</Button>
                        <Button variant="secondary" onClick={this.SetChangingNameOff}>Cancel</Button>
                    </InputGroup>
                </div>
                
                
                <hr />

                {/* wallet connection button */}
                <OverlayTrigger placement="top" overlay={ <Tooltip id='tooltip-top'>Click to <strong>Reconnect Wallet</strong>.</Tooltip>}>
                    <Button id="purplebutton" style={{ fontSize: "16px", marginBottom: "40px", borderRadius: "25px"}} onClick={this.Init}><strong>Connected Wallet: {this.state.ConnectedWalletAddr}</strong></Button>
                </OverlayTrigger>

                {/* user role badge */}
                <div id="playerbadge">
                    Role: {this.state.UserRole === null ? "Loading..." : this.state.UserRole}
                </div>
                {this.state.UserRole === "Guest" ? <Button style={{marginBottom: "40px", backgroundColor:"#8D12C1", border: "2px solid black"}} onClick={this.RegisterAsPlayer} variant="success">Register as Player</Button> : null} 
                {this.state.UserRole === "Player" ? <Button style={{marginBottom: "40px", backgroundColor:"#8D12C1", border: "2px solid black"}} onClick={this.RegisterAsDeveloper} variant="success">Register as Developer</Button> : null} 
            </div>
        )
    }




    render() {
        return (
            <div style={{ display: "block", backgroundImage: `url(${bg})`, height: "auto", color: "#fff", backgroundSize: "100%" }}>
                
                {/* navbar */}
                <Navbar bg="dark" variant="dark">
                    <Container>
                        <img src={ggicon1} alt="" height="50" style={{margin: "auto"}}/>
                    </Container>
                </Navbar>

                {/* user info card */}
                {this.RenderUserInfoCard()}
                

                {/* app nav */}
                <div id="playercard">
                    <ButtonGroup size="lg" className="mb-2"  >
                        <Button id="purplebutton" onClick={this.GotoLibrary}>My Library</Button>
                        <Button id="purplebutton" onClick={this.GotoStore}>Store Page</Button>
                        <Button id="purplebutton" onClick={this.GotoP2P}>P2P Marketplace</Button>
                    </ButtonGroup>
                </div>

                {/* back to top button */}
                <Button id="purplebutton" style={{position: "fixed", bottom:"40px", right: "40px", borderRadius: "50px", fontSize: "25px", zIndex: "1"}} onClick={this.ScrollToTop}>🔝</Button>


                {/* render app */}
                {this.state.UserRole == null? null: this.RenderHome()}

                
                {/* waiting pop over */}
                <Modal
                    show={this.state.isWaitingForBlockchain}
                    backdrop="static"
                    keyboard={false}
                    size="sm"
                    centered
                    style={{ background: "rgba(33, 33, 33, 0.8)" }}
                >
                    <p style={{marginTop: "40px", marginBottom: "20px", margin: "auto", padding: "20px"}}>
                        <Spinner animation="border" variant="success" />
                    </p>
                    <p style={{marginTop: "20px", marginBottom: "20px", margin: "auto", padding: "20px"}}>Waiting for Blockchain...</p>
                
                </Modal>
            </div>
        )
    }
}
