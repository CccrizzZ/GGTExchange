import React, { Component } from 'react'
import { 
    Button, 
    Card, 
    Modal,
    ListGroup, 
    InputGroup, 
    FormControl, 
    Spinner,
    Table,
    Form

} from 'react-bootstrap'
// import { NFTStorage } from 'nft.storage'
import './Box.css'
import Web3 from 'web3'


export default class UserLibrary extends Component {
    constructor(props) {
        super(props)

        // wallet address from parent component
        this.state = {
            ShowGameSubmitPanel: false,
        }

        // refs
        this.GameTitleInput = React.createRef()
        this.GameDescInput = React.createRef()
        this.GamePicsInput = React.createRef()
        this.GamePriceInput = React.createRef()
        
    }


    // verify ownership with smart contract
    // called when starting game
    VerifyGameOwnerShip = () => {

        // pull from smart contract

    }



    // Guest page 
    RenderGuestPage = () => {
        return(
            <div id="modulebox" style={{height: '80vh'}}>
                <hr />
                <h2>please register as player first</h2>
                <hr />
            </div>
        )
    }
    
    
    
    
    RenderLibraryCard = (img) => {
        return(
            <Card style={{ width: '100%' }}>
                <Card.Img variant="top" src={img}/>
                <Card.Body style={{backgroundColor: '#343a40'}}>
                    <Card.Title>Example Game</Card.Title>
                    <Card.Text>
                        <hr/>
                        Description: A game about snake eating each other
                        <hr/>
                        Publisher: {this.props.WalletAddr}
                        <hr/>
                        Price: 5 Dev

                    </Card.Text>
                    <Button variant="success">Play</Button>
                </Card.Body>
            </Card>
        )
    }
    
    // player library
    RenderPlayerLibrary = () => {

        // pull from smart contract


        return(
            <div id="modulebox">
                <h2>My Library</h2>
                <hr />

                <div id="griddisplay">
                    {this.state.RenderCards("http://media.steampowered.com/apps/csgo/blog/images/fb_image.png?v=6")}
                </div>

            </div>
        )
    }




    // show or clsoe developer pitching modal
    ShowGameSubmitModal = () => {
        this.setState({ShowGameSubmitPanel: true})
    }
    CloseGameSubmitModal = () => {
        this.setState({ShowGameSubmitPanel: false})
    }


    // developer submit IPFS links containing their pitch
    // if approved it will be listed on the marketplace
    SubmitPitch = async () => {

        // null check for inputs
        // if(this.GameDescInput.value == "")


        // get game description, name, and pictures
        // let GameName = this.GameTitleInput.current.value
        let GameDescription = this.GameDescInput.current.value
        // let GamePics = this.GamePicsInput.current.value
        // let GamePrice = this.GamePriceInput.current.value


        console.log(GameDescription)


        // if (GameName === "" || GameDescription === "") {
        //     alert("Please complete the form")
        //     return
        // }

        // show pop over
        this.props.ShowPopup()

        // call smart contract function
        // func(string memory name, uint256 price, string memory URI)
        let result = await this.props.ConnectedContract.methods.SubmitPitch()
        .send({
            from: this.props.WalletAddr
        }).on('error', async (error) => {
            alert("Error: Transaction Failed")
            // hide pop over
            this.SetIdle()
        })
        console.log(result)

        // hide pop over
        this.HideWaitingPopup()

    }

    // developers submit their games here for admin to review
    RenderDeveloperMintShop = () => {
        return(
            <div id="modulebox" style={{minHeight: '80vh'}}>
                <h2>Developer Hub</h2>
                <hr />

                {/* upload panel for developers */}
                <Modal
                    show={this.state.ShowGameSubmitPanel}
                    onHide={this.state.CloseGameSubmitModal}
                    backdrop="static"
                    keyboard={false}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Submit Game</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Game title:</Form.Label>
                                <Form.Control ref={this.GameTitleInput} type="text" placeholder="Normal text" />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Game Description:</Form.Label>
                                <Form.Control ref={this.GameDescInput}  id="game_desc" as="textarea" rows={3} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Demo Pictures</Form.Label>
                                <Form.Control ref={this.GamePicsInput} type="file" size="sm" />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Your Price (in DEV):</Form.Label>
                                <Form.Control ref={this.GamePrice} type="number" placeholder="Normal text" />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.CloseGameSubmitModal}>Cancel</Button>
                        <Button variant="primary" onClick={this.SubmitPitch}>Submit</Button>
                    </Modal.Footer>
                </Modal>
                            
                
                {/* existing uploads (pitch) */}
                <h4>My Game Pitch</h4>
                <hr/>

                <Button variant="primary" onClick={this.ShowGameSubmitModal}>Submit New Game</Button>
                <div id="griddisplay">


                </div>
            </div>
        )
    }

    






    // admin approve developer's pitch
    RenderAdminHub = () => {
        return(
            <div id="modulebox">
                <h2>Admin Hub</h2>
                <hr />


            </div>
        )
    }
    












    // render library according to role
    // (admin=controlPanel, developer=mintShop, player=library)
    RenderUserLibrary = () => {
        switch (this.props.UserRole) {
            case 'Guest':
                return(this.RenderGuestPage ())
            case 'Player':
                return(this.RenderPlayerLibrary())
            case 'Developer':
                return(this.RenderDeveloperMintShop())
            case 'Admin':
                return(this.RenderAdminHub())
            default:
                break;
        }
    }


    render() {
        return (
            <>
                {this.RenderUserLibrary()}
            </>
        )
    }
}
