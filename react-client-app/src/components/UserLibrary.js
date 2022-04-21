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
            ConnectedWalletAddr: props.addr,
            Contract: props.contract,
            UserRole: props.role,
            ShowGameSubmitPanel: false
        }

        // refs
        this.GameTitleInput = React.createRef()
        this.GameDescInput = React.createRef()
        this.GameRender = React.createRef()


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
                        Publisher: {this.state.ConnectedWalletAddr}
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





    ShowGameSubmitModal = () => {
        this.setState({ShowGameSubmitPanel: true})
    }

    CloseGameSubmitModal = () => {
        this.setState({ShowGameSubmitPanel: false})
    }

    SubmitPitch = () => {

        // null check for inputs
        // if(this.GameDescInput.value == "")


        // get game description, name, and pictures
        let GameDescription = this.GameDescInput.value
        let GameName = this.GameNameInput.value

        // call smart contract


    }

    // developers submit their games here for admin to review
    RenderDeveloperMintShop = () => {
        return(
            <div id="modulebox">
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
                                <Form.Control type="text" placeholder="Normal text" />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Game Description:</Form.Label>
                                <Form.Control id="game_desc" as="textarea" rows={3} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Demo Pictures</Form.Label>
                                <Form.Control type="file" size="sm" />
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
        switch (this.state.UserRole) {
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
