import React, { Component } from 'react'
import { 
    Button, 
    Card, 
    ListGroup, 
    InputGroup, 
    FormControl, 
    Spinner,
    Table

} from 'react-bootstrap'
// import { NFTStorage } from 'nft.storage'
import './Box.css'


export default class UserLibrary extends Component {
    constructor(props) {
        super(props)

        // wallet address from parent component
        this.state = {
            ConnectedWalletAddr: props.addr,
            UserRole: props.role
        }

    }


    GetUserLibrary = () => {
        // axios to get user library
    }


    // verify ownership with smart contract
    // called when starting game
    VerifyGameOwnerShip = () => {
        // smart contract and db connetion
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


    RenderPlayerLibrary = () => {
        return(
            <div id="modulebox">
                <h2>My Library</h2>
                <hr />

                <div id="griddisplay">
                    {this.RenderCards()}
                    {this.RenderCards()}
                    {this.RenderCards()}
                    {this.RenderCards()}
                </div>

            </div>
        )
    }



    // developers submit their games here for admin to review
    RenderDeveloperMintShop = () => {
        return(
            <div id="modulebox">
                <h2>Developer Hub</h2>
                <hr />

                {/* upload panel */}
                
                
                
                {/* existing uploads (pitch) */}
                <hr/>
                <h4>My Game Pitch</h4>
                <hr/>

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
            case 'player':
                return(this.RenderPlayerLibrary())
            case 'developer':
                return(this.RenderDeveloperMintShop())
            case 'admin':
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
